from fastapi import FastAPI

app: FastAPI = FastAPI()


@app.get("/health")  # type: ignore[misc]
async def health() -> dict[str, str]:
    """Basic health check endpoint."""
    return {"status": "ok"}
