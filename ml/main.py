from __future__ import annotations

import argparse
import asyncio
import os
import tempfile
from io import BytesIO
from pathlib import Path
from typing import Any

import requests
from dotenv import load_dotenv
from fastapi import FastAPI
from pydantic import BaseModel, Field

from pipeline import DEFAULT_SUMMARY_MD, DEFAULT_TRANSCRIPT_MD, run_transcription_pipeline

load_dotenv()

OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434/api/generate")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "gemma3:1b")
RABBITMQ_URL = os.getenv("RABBITMQ_URL", "amqp://guest:guest@localhost:5672/")
RABBITMQ_INCOMING_QUEUE = os.getenv("RABBITMQ_INCOMING_QUEUE", "ml-intake")
RABBITMQ_RESULTS_QUEUE = os.getenv("RABBITMQ_RESULTS_QUEUE", "meeting-ml-results")
S3_ENDPOINT_URL = os.getenv("S3_ENDPOINT_URL")
S3_ACCESS_KEY_ID = os.getenv("S3_ACCESS_KEY_ID")
S3_SECRET_ACCESS_KEY = os.getenv("S3_SECRET_ACCESS_KEY")
S3_BUCKET_NAME = os.getenv("S3_BUCKET_NAME")
S3_REGION = os.getenv("S3_REGION", "us-east-1")
S3_USE_SSL = os.getenv("S3_USE_SSL", "false").lower() in {"1", "true", "yes"}

app = FastAPI(title="Bezum Hack ML Service")


class ChatRequest(BaseModel):
    user_text: str


class DiarizeRequest(BaseModel):
    video_path: str


class SummaryRequest(BaseModel):
    transcript_path: str = str(DEFAULT_TRANSCRIPT_MD)
    output_path: str = str(DEFAULT_SUMMARY_MD)


class MeetingMLResultMessage(BaseModel):
    meeting_id: int
    recording_object_key: str
    transcript_object_key: str | None = None
    summary_object_key: str | None = None
    transcript_text: str | None = None
    summary_text: str | None = None
    speaker_segments: list[dict[str, Any]] = Field(default_factory=list)
    decisions: list[str] = Field(default_factory=list)
    action_items: list[dict[str, Any]] = Field(default_factory=list)
    metadata: dict[str, Any] = Field(default_factory=dict)


def ask_ollama(prompt: str, response_format: str | None = "json") -> str | None:
    payload = {
        "model": OLLAMA_MODEL,
        "prompt": prompt,
        "stream": False,
    }
    if response_format:
        payload["format"] = response_format
    response = requests.post(OLLAMA_URL, json=payload, timeout=300)
    response.raise_for_status()
    return response.json().get("response")


def summarize_transcript_markdown(
    transcript_path: str = str(DEFAULT_TRANSCRIPT_MD),
    output_path: str = str(DEFAULT_SUMMARY_MD),
) -> str:
    transcript_file = Path(transcript_path)
    if not transcript_file.exists():
        raise FileNotFoundError(f"Transcript file not found: {transcript_file}")

    transcript_text = transcript_file.read_text(encoding="utf-8")
    prompt = f"""
Ты помощник, который кратко и структурированно суммаризирует стенограммы встреч.
Сформируй результат в Markdown на русском языке.

Структура ответа:
# Саммари встречи
## Кратко
- 3-5 ключевых выводов
## Что решили
- список решений
## Задачи
- формат: исполнитель | задача | срок/статус
## Риски и вопросы
- открытые вопросы, блокеры, риски

Если информации для какого-то раздела нет, так и напиши кратко.
Не выдумывай факты и не добавляй ничего вне стенограммы.

Стенограмма:
{transcript_text}
""".strip()

    summary_text = ask_ollama(prompt, response_format=None) or (
        "# Саммари встречи\n\nНе удалось получить ответ от модели."
    )
    summary_file = Path(output_path)
    summary_file.parent.mkdir(parents=True, exist_ok=True)
    summary_file.write_text(summary_text, encoding="utf-8")
    return summary_text


def get_s3_client() -> Any:
    import boto3

    if not S3_BUCKET_NAME:
        raise RuntimeError("S3_BUCKET_NAME is required")
    return boto3.client(
        "s3",
        endpoint_url=S3_ENDPOINT_URL,
        aws_access_key_id=S3_ACCESS_KEY_ID,
        aws_secret_access_key=S3_SECRET_ACCESS_KEY,
        region_name=S3_REGION,
        use_ssl=S3_USE_SSL,
    )


def download_recording_to_tempfile(recording_object_key: str) -> str:
    client = get_s3_client()
    buffer = BytesIO()
    client.download_fileobj(S3_BUCKET_NAME, recording_object_key, buffer)
    buffer.seek(0)

    suffix = Path(recording_object_key).suffix or ".webm"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
        temp_file.write(buffer.getbuffer())
        return temp_file.name


def upload_markdown_to_s3(markdown_text: str, object_key: str) -> None:
    client = get_s3_client()
    buffer = BytesIO(markdown_text.encode("utf-8"))
    client.upload_fileobj(
        buffer,
        S3_BUCKET_NAME,
        object_key,
        ExtraArgs={"ContentType": "text/markdown; charset=utf-8"},
    )


def build_success_message(
    job: MeetingMLResultMessage,
    transcript_key: str,
    summary_key: str,
) -> MeetingMLResultMessage:
    return MeetingMLResultMessage(
        meeting_id=job.meeting_id,
        recording_object_key=job.recording_object_key,
        transcript_object_key=transcript_key,
        summary_object_key=summary_key,
        speaker_segments=[],
        decisions=[],
        action_items=[],
        metadata=dict(job.metadata),
    )


def build_failure_message(job: MeetingMLResultMessage) -> MeetingMLResultMessage:
    return MeetingMLResultMessage(
        meeting_id=job.meeting_id,
        recording_object_key=job.recording_object_key,
        transcript_object_key=None,
        summary_object_key=None,
        transcript_text=None,
        summary_text=None,
        speaker_segments=[],
        decisions=[],
        action_items=[],
        metadata=dict(job.metadata),
    )


def get_attempt(message: MeetingMLResultMessage) -> int:
    raw_attempt = message.metadata.get("attempt", 1)
    try:
        return max(1, int(raw_attempt))
    except (TypeError, ValueError):
        return 1


def with_incremented_attempt(message: MeetingMLResultMessage) -> MeetingMLResultMessage:
    metadata = dict(message.metadata)
    metadata["attempt"] = get_attempt(message) + 1
    return message.model_copy(update={"metadata": metadata})


def process_meeting_job(job: MeetingMLResultMessage) -> MeetingMLResultMessage:
    local_recording_path = download_recording_to_tempfile(job.recording_object_key)
    job_dir = Path(tempfile.mkdtemp(prefix=f"meeting_{job.meeting_id}_"))

    try:
        diarized_json_path = job_dir / "transcript_diarized.json"
        transcript_path = job_dir / "transcript.md"
        summary_path = job_dir / "summary.md"

        run_transcription_pipeline(
            video_path=local_recording_path,
            out_json=str(diarized_json_path),
            transcript_path=str(transcript_path),
        )
        summary_text = summarize_transcript_markdown(
            transcript_path=str(transcript_path),
            output_path=str(summary_path),
        )
        transcript_text = transcript_path.read_text(encoding="utf-8")

        transcript_key = f"meetings/{job.meeting_id}/transcript.md"
        summary_key = f"meetings/{job.meeting_id}/summary.md"

        upload_markdown_to_s3(transcript_text, transcript_key)
        upload_markdown_to_s3(summary_text, summary_key)

        return build_success_message(job, transcript_key, summary_key)
    finally:
        try:
            os.remove(local_recording_path)
        except OSError:
            pass
        for artifact in job_dir.glob("*"):
            try:
                artifact.unlink()
            except OSError:
                pass
        try:
            job_dir.rmdir()
        except OSError:
            pass


def create_worker_runtime() -> tuple[Any, Any]:
    from faststream import FastStream
    from faststream.rabbit import RabbitBroker

    broker = RabbitBroker(RABBITMQ_URL)
    worker_app = FastStream(broker)

    @broker.subscriber(RABBITMQ_INCOMING_QUEUE)
    async def consume_meeting_job(message: MeetingMLResultMessage) -> None:
        try:
            result = process_meeting_job(message)
            await broker.publish(
                result.model_dump(exclude_none=False),
                queue=RABBITMQ_RESULTS_QUEUE,
            )
            print(
                f"Meeting {message.meeting_id} processed, "
                f"results published to {RABBITMQ_RESULTS_QUEUE}."
            )
        except Exception as exc:
            current_attempt = get_attempt(message)
            print(
                f"Meeting {message.meeting_id} failed on attempt "
                f"{current_attempt}: {exc}"
            )
            if current_attempt >= 5:
                failure_message = build_failure_message(message)
                await broker.publish(
                    failure_message.model_dump(exclude_none=False),
                    queue=RABBITMQ_RESULTS_QUEUE,
                )
                print(
                    f"Meeting {message.meeting_id} reached retry limit, "
                    f"failure message published to {RABBITMQ_RESULTS_QUEUE}."
                )
                return

            retry_message = with_incremented_attempt(message)
            await broker.publish(
                retry_message.model_dump(exclude_none=False),
                queue=RABBITMQ_INCOMING_QUEUE,
            )
            print(
                f"Meeting {message.meeting_id} requeued to "
                f"{RABBITMQ_INCOMING_QUEUE} with attempt {get_attempt(retry_message)}."
            )

    return broker, worker_app


@app.get("/")
def health() -> dict[str, str]:
    return {"status": "ML service is live"}


@app.post("/extract-ticket")
async def extract_ticket(request: ChatRequest) -> dict[str, str | None]:
    prompt = f"""
Действуй как аналитик. Извлеки из текста: суть задачи, срок, ответственное лицо.
Выведи результат строго в формате JSON. Текст: "{request.user_text}"
""".strip()
    return {"ticket": ask_ollama(prompt)}


@app.post("/diarize-transcribe")
def diarize_transcribe_endpoint(
    request: DiarizeRequest,
) -> dict[str, list[dict[str, object]]]:
    result = run_transcription_pipeline(request.video_path)
    return {"segments": result["segments"]}


@app.post("/summarize-transcript")
def summarize_transcript(request: SummaryRequest) -> dict[str, str]:
    summary = summarize_transcript_markdown(
        transcript_path=request.transcript_path,
        output_path=request.output_path,
    )
    return {
        "summary_path": request.output_path,
        "summary": summary,
    }


def run_local_pipeline(video_path: str) -> None:
    run_transcription_pipeline(video_path)
    summarize_transcript_markdown()
    print(f"Готово: {DEFAULT_TRANSCRIPT_MD}")
    print(f"Готово: {DEFAULT_SUMMARY_MD}")


async def run_worker() -> None:
    _, worker_app = create_worker_runtime()
    await worker_app.run()


def build_arg_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Local CLI, API entrypoint and RabbitMQ worker for the ML pipeline."
    )
    parser.add_argument(
        "video_path",
        nargs="?",
        help="Path to a local video file. If provided, runs the full local pipeline.",
    )
    parser.add_argument(
        "--summarize",
        action="store_true",
        help="Only summarize the existing transcript from outputs/transcript.md.",
    )
    parser.add_argument(
        "--worker",
        action="store_true",
        help="Run RabbitMQ worker for ml-intake -> meeting-ml-results.",
    )
    parser.add_argument(
        "--transcript-path",
        default=str(DEFAULT_TRANSCRIPT_MD),
        help="Path to transcript markdown for summarize mode.",
    )
    parser.add_argument(
        "--output-path",
        default=str(DEFAULT_SUMMARY_MD),
        help="Output path for summary markdown in summarize mode.",
    )
    return parser


if __name__ == "__main__":
    parser = build_arg_parser()
    args = parser.parse_args()

    if args.worker:
        asyncio.run(run_worker())
    elif args.summarize:
        summarize_transcript_markdown(
            transcript_path=args.transcript_path,
            output_path=args.output_path,
        )
        print(f"Готово: {args.output_path}")
    elif args.video_path:
        run_local_pipeline(args.video_path)
    else:
        parser.print_help()