from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables / .env file."""

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_name: str = "VertexLearn AI Service"
    debug: bool = False
    port: int = 8000

    openai_api_key: str = ""


settings = Settings()
