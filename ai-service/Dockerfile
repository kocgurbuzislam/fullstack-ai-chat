FROM python:3.10-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    HF_HOME=/tmp/huggingface \
    TRANSFORMERS_CACHE=/tmp/huggingface

RUN mkdir -p /tmp/huggingface && chmod -R 777 /tmp/huggingface

WORKDIR /app
COPY requirements.txt .
RUN pip install --upgrade pip && pip install -r requirements.txt

COPY app.py .

EXPOSE 7860
CMD ["bash","-lc","uvicorn app:app --host 0.0.0.0 --port ${PORT:-7860}"]
