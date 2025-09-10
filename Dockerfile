# Use official Python 3.11 slim image
FROM python:3.11-slim AS base

# Prevent Python from buffering stdout/stderr
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Ensure Python can import from src/ for Alembic and Uvicorn
ENV PYTHONPATH=/app/src

# Install build dependencies
RUN pip install --no-cache-dir poetry

# Copy dependency definitions
COPY pyproject.toml poetry.lock ./

# Install dependencies directly into the image
RUN poetry config virtualenvs.create false \
    && poetry install --only main --no-root

# Copy application source
COPY src ./src
COPY config/ ./config/

# Expose application port
EXPOSE 8000

# Run the FastAPI app with hot reload enabled
# Use an entrypoint to run migrations then start the app
COPY docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh
CMD ["./docker-entrypoint.sh"]
