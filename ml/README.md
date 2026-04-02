# Bezum Hack ML

Проект умеет работать в трёх режимах:
- локальный прогон `.webm` одной командой;
- FastAPI API;
- worker для `RabbitMQ + MinIO`.

## Файлы

- `main.py` - API, CLI, Ollama, RabbitMQ worker, S3/MinIO интеграция
- `pipeline.py` - диаризация, транскрипция, метрики, сохранение артефактов
- `outputs/` - локальные результаты ручного запуска

## Env

```env
HF_TOKEN=your_huggingface_token
OLLAMA_URL=http://localhost:11434/api/generate
OLLAMA_MODEL=gemma3:1b

RABBITMQ_URL=amqp://guest:guest@localhost:5672/
RABBITMQ_INCOMING_QUEUE=ml-intake
RABBITMQ_RESULTS_QUEUE=meeting-ml-results

S3_ENDPOINT_URL=http://localhost:9000
S3_ACCESS_KEY_ID=minioadmin
S3_SECRET_ACCESS_KEY=minioadmin
S3_BUCKET_NAME=meetings
S3_REGION=us-east-1
S3_USE_SSL=false
```

## Install

```powershell
cd D:\Проекты\bezum-hack-2026\ml
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

## Локальный запуск

Полный прогон одной командой:

```powershell
cd D:\Проекты\bezum-hack-2026\ml
.\.venv\Scripts\python.exe main.py "D:\Test_for_hack\Recording 2026-04-01 15-47-00.webm"
```

Только саммари:

```powershell
.\.venv\Scripts\python.exe main.py --summarize
```

## API

```powershell
.\.venv\Scripts\python.exe -m uvicorn main:app --reload
```

## Worker

```powershell
.\.venv\Scripts\python.exe main.py --worker
```

Worker:
- читает сообщения из `ml-intake`
- скачивает запись из MinIO по `recording_object_key` через `BytesIO`
- строит `transcript.md` и `summary.md`
- загружает их обратно в тот же bucket
- публикует `MeetingMLResultMessage` в `meeting-ml-results`
- при ошибке переотправляет сообщение в `ml-intake`, увеличивая `metadata.attempt`
- после `attempt >= 5` отправляет result-message с пустыми путями

## Выходные ключи в MinIO

- `meetings/{meeting_id}/transcript.md`
- `meetings/{meeting_id}/summary.md`