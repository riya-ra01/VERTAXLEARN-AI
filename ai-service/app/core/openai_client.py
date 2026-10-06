from openai import AsyncOpenAI
from app.core.config import settings

# Single shared async client — reused across requests
client = AsyncOpenAI(api_key=settings.openai_api_key)
