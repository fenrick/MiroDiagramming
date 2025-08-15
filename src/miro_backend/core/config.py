"""Application configuration using pydantic settings."""

from pydantic import BaseModel, ConfigDict


class Settings(BaseModel):
    """Defines application settings."""

    model_config = ConfigDict(extra="ignore")

    app_name: str = "Miro Backend"
    database_url: str = "sqlite:///./app.db"
    webhook_secret: str = "dev-secret"


settings = Settings()
