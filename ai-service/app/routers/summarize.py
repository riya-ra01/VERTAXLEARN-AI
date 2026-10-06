"""Summarize lesson/article text."""

from fastapi import APIRouter, HTTPException
from app.models.summarize import SummarizeRequest, SummarizeResponse
from app.core.openai_client import client
from app.core.config import settings

router = APIRouter(prefix="/summarize", tags=["summarize"])

STYLE_INSTRUCTIONS = {
    "concise":       "Write a concise 2-3 sentence summary.",
    "detailed":      "Write a detailed summary covering all key points.",
    "bullet_points": "Write a summary as a list of bullet points (use - prefix).",
}


@router.post("", response_model=SummarizeResponse)
async def summarize(req: SummarizeRequest) -> SummarizeResponse:
    instruction = STYLE_INSTRUCTIONS.get(req.style, STYLE_INSTRUCTIONS["concise"])

    prompt = f"""{instruction}

Text to summarize:
{req.text}"""

    try:
        response = await client.chat.completions.create(
            model=settings.openai_chat_model,
            messages=[
                {"role": "system", "content": "You are an expert educational content summarizer."},
                {"role": "user",   "content": prompt},
            ],
            temperature=0.3,
            max_tokens=512,
        )
        summary = response.choices[0].message.content or ""
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"LLM error: {str(e)}")

    return SummarizeResponse(summary=summary)
