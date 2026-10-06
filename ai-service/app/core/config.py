from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables / .env file."""

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_name: str = "VertexLearn AI Service"
    debug: bool = False
    port: int = 8000

    # OpenAI
    openai_api_key: str = ""
    openai_chat_model: str = "gpt-4o-mini"
    openai_embedding_model: str = "text-embedding-3-small"
    embedding_dimensions: int = 1536

    # PostgreSQL (for pgvector)
    database_url: str = ""

    # Chunking
    chunk_size: int = 512
    chunk_overlap: int = 64

    # RAG retrieval
    rag_top_k: int = 5


settings = Settings()
