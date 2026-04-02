from __future__ import annotations

import json
import os
import shutil
import tempfile
import threading
import time
import warnings
import wave
from pathlib import Path
from typing import Any

import numpy as np
import psutil
import torch
import torchaudio
from dotenv import load_dotenv
from imageio_ffmpeg import get_ffmpeg_exe
from moviepy import AudioFileClip, VideoFileClip
from transformers import AutoModel

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent
OUTPUTS_DIR = BASE_DIR / "outputs"
OUTPUTS_DIR.mkdir(exist_ok=True)

DEFAULT_DIARIZED_JSON = OUTPUTS_DIR / "transcript_diarized.json"
DEFAULT_TRANSCRIPT_MD = OUTPUTS_DIR / "transcript.md"
DEFAULT_SUMMARY_MD = OUTPUTS_DIR / "summary.md"

GIGA_REVISION = "e2e_rnnt"
MIN_SEGMENT_SEC = 0.35
DIARIZATION_MODEL = "pyannote/speaker-diarization-3.1"

with warnings.catch_warnings():
    warnings.simplefilter("ignore", UserWarning)
    from pyannote.audio import Pipeline


class ResourceMonitor:
    def __init__(self) -> None:
        self.process = psutil.Process(os.getpid())
        self._stop_event = threading.Event()
        self._thread: threading.Thread | None = None
        self._started = False
        self.start_time = 0.0
        self.start_rss = 0
        self.max_rss = 0

    def start(self) -> None:
        self.start_time = time.perf_counter()
        self.start_rss = self.process.memory_info().rss
        self.max_rss = self.start_rss
        self._stop_event.clear()
        self._thread = threading.Thread(target=self._poll_memory, daemon=True)
        self._thread.start()
        self._started = True

    def _poll_memory(self) -> None:
        while not self._stop_event.is_set():
            rss = self.process.memory_info().rss
            if rss > self.max_rss:
                self.max_rss = rss
            time.sleep(0.2)

    def stop(self) -> dict[str, float]:
        if not self._started:
            return {"elapsed_sec": 0.0, "rss_peak_mb": 0.0}
        self._stop_event.set()
        if self._thread:
            self._thread.join(timeout=1)
        self._started = False
        elapsed = time.perf_counter() - self.start_time
        return {
            "elapsed_sec": elapsed,
            "rss_peak_mb": self.max_rss / (1024 * 1024),
        }


def save_formatted_transcripts(
    json_data_path: str,
    output_path: str | Path = DEFAULT_TRANSCRIPT_MD,
) -> str:
    json_path = Path(json_data_path)
    if not json_path.exists():
        raise FileNotFoundError(f"File not found: {json_path}")

    output_file = Path(output_path)
    output_file.parent.mkdir(parents=True, exist_ok=True)

    with json_path.open("r", encoding="utf-8") as file:
        data = json.load(file)

    dialogue_lines: list[str] = []
    for seg in data.get("segments", []):
        text = seg.get("text", "").strip()
        if not text:
            continue
        speaker = str(seg.get("speaker", "Unknown")).replace("_", "")
        start_sec = seg.get("start_sec", 0)
        timestamp = time.strftime("%H.%M.%S", time.gmtime(start_sec))
        dialogue_lines.append(f"[{timestamp}] {speaker}: - {text}")

    output_file.write_text(
        "# Протокол встречи\n\n" + "\n\n".join(dialogue_lines),
        encoding="utf-8",
    )
    return str(output_file)


def extract_audio(video_path: str, audio_path: str) -> None:
    print(f"Извлекаю аудио из {video_path}...")
    video = VideoFileClip(video_path)
    try:
        if video.audio is None:
            raise RuntimeError("В видеофайле не найдена аудиодорожка.")
        video.audio.write_audiofile(audio_path, fps=16000)
    finally:
        video.close()
    print("Аудио готово.")


def ensure_ffmpeg_available() -> None:
    if shutil.which("ffmpeg"):
        return
    ffmpeg_real_exe = Path(get_ffmpeg_exe())
    ffmpeg_dir = ffmpeg_real_exe.parent
    ffmpeg_alias = ffmpeg_dir / "ffmpeg.exe"
    if not ffmpeg_alias.exists():
        shutil.copy2(ffmpeg_real_exe, ffmpeg_alias)
    os.environ["PATH"] = str(ffmpeg_dir) + os.pathsep + os.environ.get("PATH", "")


def transcribe_in_chunks(model: Any, audio_path: str, chunk_seconds: int = 20) -> str:
    print("Режу аудио на чанки...")
    chunk_dir = Path(tempfile.mkdtemp(prefix="transcribe_chunk_"))
    parts: list[str] = []
    audio = AudioFileClip(audio_path)
    try:
        total = int(audio.duration)
        for start in range(0, total + 1, chunk_seconds):
            end = min(start + chunk_seconds, audio.duration)
            if end - start < 0.1:
                continue
            chunk_path = chunk_dir / f"chunk_{start:06d}.wav"
            audio.subclipped(start, end).write_audiofile(
                str(chunk_path), fps=16000, logger=None
            )
            text = model.transcribe(str(chunk_path))
            if isinstance(text, str) and text.strip():
                parts.append(text.strip())
    finally:
        audio.close()
        shutil.rmtree(chunk_dir, ignore_errors=True)
    return " ".join(parts).strip()


def _annotation_from_diarization_output(diarization: Any) -> Any:
    annotation = getattr(diarization, "exclusive_speaker_diarization", None)
    if annotation is not None:
        return annotation
    annotation = getattr(diarization, "speaker_diarization", None)
    if annotation is not None:
        return annotation
    return diarization


def _load_wav_without_torchcodec(wav_path: str) -> tuple[torch.Tensor, int]:
    try:
        with wave.open(wav_path, "rb") as wav_file:
            n_channels = wav_file.getnchannels()
            sample_rate = wav_file.getframerate()
            sample_width = wav_file.getsampwidth()
            n_frames = wav_file.getnframes()
            raw = wav_file.readframes(n_frames)
        if sample_width == 2:
            audio = np.frombuffer(raw, dtype=np.int16).astype(np.float32) / 32768.0
        elif sample_width == 4:
            audio = np.frombuffer(raw, dtype=np.int32).astype(np.float32) / 2147483648.0
        else:
            raise ValueError(f"Unsupported WAV width: {sample_width}")
        if n_channels > 1:
            audio = audio.reshape(-1, n_channels).mean(axis=1)
        waveform = torch.from_numpy(audio.copy()).unsqueeze(0)
        return waveform, int(sample_rate)
    except Exception:
        import soundfile as sf

        data, sample_rate = sf.read(wav_path, dtype="float32", always_2d=True)
        audio = data.mean(axis=1)
        waveform = torch.from_numpy(audio.copy()).unsqueeze(0)
        return waveform, int(sample_rate)


def _load_waveform_for_pyannote(wav_path: str) -> dict[str, Any]:
    waveform, sample_rate = _load_wav_without_torchcodec(wav_path)
    if waveform.shape[0] > 1:
        waveform = waveform.mean(dim=0, keepdim=True)
    if sample_rate != 16000:
        resampler = torchaudio.transforms.Resample(sample_rate, 16000)
        waveform = resampler(waveform)
        sample_rate = 16000
    return {"waveform": waveform, "sample_rate": sample_rate}


def run_diarization(audio_wav: str, hf_token: str | None) -> Any:
    if not hf_token:
        raise RuntimeError("HF_TOKEN is required in .env")
    pipeline = Pipeline.from_pretrained(DIARIZATION_MODEL, token=hf_token)
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    pipeline.to(device)
    audio_input = _load_waveform_for_pyannote(audio_wav)
    audio_input["waveform"] = audio_input["waveform"].to(device)
    return pipeline(audio_input)


def transcribe_one_file(model: Any, wav_path: str) -> str:
    with AudioFileClip(wav_path) as clip:
        duration = clip.duration
    if duration > 24.5:
        return transcribe_in_chunks(model, wav_path, chunk_seconds=20)
    text = model.transcribe(wav_path)
    return text if isinstance(text, str) else str(text)


def run_transcription_pipeline(
    video_path: str,
    audio_wav: str | None = None,
    out_json: str = str(DEFAULT_DIARIZED_JSON),
    transcript_path: str = str(DEFAULT_TRANSCRIPT_MD),
) -> dict[str, Any]:
    monitor = ResourceMonitor()
    monitor.start()
    created_audio = False

    try:
        ensure_ffmpeg_available()
        hf_token = os.getenv("HF_TOKEN")
        out_json_path = Path(out_json)
        out_json_path.parent.mkdir(parents=True, exist_ok=True)

        if audio_wav is None:
            audio_wav = str(out_json_path.with_suffix(".wav"))
            created_audio = True
        extract_audio(video_path, audio_wav)

        print("Диаризация...")
        diarization = run_diarization(audio_wav, hf_token)
        annotation = _annotation_from_diarization_output(diarization)

        segments_meta: list[tuple[float, float, str]] = []
        for turn, _, speaker in annotation.itertracks(yield_label=True):
            start, end = float(turn.start), float(turn.end)
            if end - start < MIN_SEGMENT_SEC:
                continue
            segments_meta.append((start, end, str(speaker)))

        if not segments_meta:
            print("Диаризация не вернула сегментов.")
            metrics = monitor.stop()
            print(
                "Метрики: "
                f"elapsed={metrics['elapsed_sec']:.2f}s, "
                f"rss_peak={metrics['rss_peak_mb']:.1f}MB"
            )
            return {
                "segments": [],
                "diarized_json_path": str(out_json_path),
                "transcript_path": str(Path(transcript_path)),
                "metrics": metrics,
            }

        print(f"Загрузка GigaAM-v3 ({GIGA_REVISION})...")
        asr_model = AutoModel.from_pretrained(
            "ai-sage/GigaAM-v3",
            revision=GIGA_REVISION,
            trust_remote_code=True,
            low_cpu_mem_usage=False,
        )

        results: list[dict[str, Any]] = []
        tmp_root = Path(tempfile.mkdtemp(prefix="diarize_seg_"))
        try:
            with AudioFileClip(audio_wav) as full_audio:
                for index, (start, end, speaker) in enumerate(segments_meta):
                    seg_path = tmp_root / f"seg_{index:05d}.wav"
                    full_audio.subclipped(start, end).write_audiofile(
                        str(seg_path), fps=16000, logger=None
                    )
                    print(
                        f"Сегмент {index + 1}/{len(segments_meta)} "
                        f"[{start:.1f}s-{end:.1f}s] {speaker}..."
                    )
                    text = transcribe_one_file(asr_model, str(seg_path)).strip()
                    results.append(
                        {
                            "speaker": speaker,
                            "start_sec": round(start, 3),
                            "end_sec": round(end, 3),
                            "text": text,
                        }
                    )
        finally:
            shutil.rmtree(tmp_root, ignore_errors=True)

        payload = {
            "source_video": os.path.abspath(video_path),
            "audio_wav": os.path.abspath(audio_wav),
            "segments": results,
        }

        out_json_path.write_text(
            json.dumps(payload, ensure_ascii=False, indent=2),
            encoding="utf-8",
        )
        print(f"Сохранено: {out_json_path}")

        transcript_file_path = save_formatted_transcripts(
            str(out_json_path),
            output_path=transcript_path,
        )
        print(f"Сохранено: {transcript_file_path}")

        metrics = monitor.stop()
        print(
            "Метрики: "
            f"elapsed={metrics['elapsed_sec']:.2f}s, "
            f"rss_peak={metrics['rss_peak_mb']:.1f}MB"
        )
        return {
            "segments": results,
            "diarized_json_path": str(out_json_path),
            "transcript_path": transcript_file_path,
            "metrics": metrics,
        }
    finally:
        if created_audio and audio_wav and os.path.exists(audio_wav):
            try:
                os.remove(audio_wav)
            except OSError:
                pass


def diarize_and_transcribe(
    video_path: str,
    audio_wav: str | None = None,
    out_json: str = str(DEFAULT_DIARIZED_JSON),
    transcript_path: str = str(DEFAULT_TRANSCRIPT_MD),
) -> list[dict[str, Any]]:
    result = run_transcription_pipeline(
        video_path=video_path,
        audio_wav=audio_wav,
        out_json=out_json,
        transcript_path=transcript_path,
    )
    return result["segments"]