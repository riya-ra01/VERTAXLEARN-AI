"""Generate flashcards from lesson content."""

import json
from fastapi import APIRouter, HTTPException
from app.models.flashcards import FlashcardsRequest, FlashcardsResponse, Flashcard
from app.core.openai_client import client
from app.core.config import settings

router = APIRouter(prefix="/flashcards", tags=["flashcards"])


@router.post("", response_model=FlashcardsResponse)
async def generate_flashcards(req: FlashcardsRequest) -> FlashcardsResponse:
    prompt = f"""Generate exactly {req.num_cards} flashcards from the text below.
Return ONLY a valid JSON array, no other text.
Format: [{{"front": "question or term", "back": "answer or definition"}}, ...]

Text:
{req.text}"""

    try:
        response = await client.chat.completions.create(
            model=settings.openai_chat_model,
            messages=[
                {"role": "system", "content": "You are an expert at creating educational flashcards. Always respond with valid JSON only."},
                {"role": "user",   "content": prompt},
            ],
            temperature=0.5,
            max_tokens=1024,
            response_format={"type": "json_object"},
        )
        raw = response.choices[0].message.content or "{}"
        parsed = json.loads(raw)

        # Handle both {"cards": [...]} and direct array responses
        cards_data = parsed.get("cards", parsed) if isinstance(parsed, dict) else parsed
        cards = [Flashcard(**c) for c in cards_data]
    except (json.JSONDecodeError, KeyError, TypeError) as e:
        raise HTTPException(status_code=502, detail=f"Failed to parse flashcards: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"LLM error: {str(e)}")

    return FlashcardsResponse(cards=cards)
