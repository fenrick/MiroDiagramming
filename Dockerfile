# Use official Python 3.11 slim image
FROM python:3.11-slim AS base

# Prevent Python from buffering stdout/stderr
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Install build dependencies
RUN pip install --no-cache-dir poetry

# Copy dependency definitions
COPY pyproject.toml poetry.lock ./

# Install dependencies directly into the image
RUN poetry config virtualenvs.create false \
    && poetry install --only main --no-root

# Copy application source
COPY src ./src
COPY config.example.yaml ./config.example.yaml

# Expose application port
EXPOSE 8000

# Run the FastAPI app with hot reload enabled
CMD ["uvicorn", "miro_backend.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
