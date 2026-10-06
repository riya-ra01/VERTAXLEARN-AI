"""Generate quiz questions from lesson content."""

import json
from fastapi import APIRouter, HTTPException
from app.models.quiz_gen import QuizGenRequest, QuizGenResponse, GeneratedQuestion
from app.core.openai_client import client
from app.core.config import settings

router = APIRouter(prefix="/quiz-gen", tags=["quiz-gen"])


@router.post("", response_model=QuizGenResponse)
async def generate_quiz(req: QuizGenRequest) -> QuizGenResponse:
    types_str = ", ".join(req.question_types)

    prompt = f"""Generate exactly {req.num_questions} quiz questions from the text below.
Difficulty: {req.difficulty}
Question types: {types_str}

For multiple_choice questions include 4 options with exactly one correct (is_correct: true).
For true_false questions include 2 options: "True" and "False".
Always include a brief explanation.

Return ONLY valid JSON in this format:
{{
  "questions": [
    {{
      "question_text": "...",
      "question_type": "multiple_choice",
      "options": [{{"id": "a", "text": "...", "is_correct": false}}, ...],
      "explanation": "..."
    }}
  ]
}}

Text:
{req.text}"""

    try:
        response = await client.chat.completions.create(
            model=settings.openai_chat_model,
            messages=[
                {"role": "system", "content": "You are an expert quiz creator. Always respond with valid JSON only."},
                {"role": "user",   "content": prompt},
            ],
            temperature=0.6,
            max_tokens=2048,
            response_format={"type": "json_object"},
        )
        raw = response.choices[0].message.content or "{}"
        parsed = json.loads(raw)
        questions = [GeneratedQuestion(**q) for q in parsed.get("questions", [])]
    except (json.JSONDecodeError, KeyError, TypeError) as e:
        raise HTTPException(status_code=502, detail=f"Failed to parse questions: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"LLM error: {str(e)}")

    return QuizGenResponse(questions=questions)
