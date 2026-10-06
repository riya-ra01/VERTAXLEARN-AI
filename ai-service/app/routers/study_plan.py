"""Generate a personalised study plan."""

import json
from fastapi import APIRouter, HTTPException
from app.models.study_plan import StudyPlanRequest, StudyPlanResponse, StudyWeek, StudyDay
from app.core.openai_client import client
from app.core.config import settings

router = APIRouter(prefix="/study-plan", tags=["study-plan"])


@router.post("", response_model=StudyPlanResponse)
async def generate_study_plan(req: StudyPlanRequest) -> StudyPlanResponse:
    topics_str = "\n".join(f"- {t}" for t in req.topics)

    prompt = f"""Create a {req.duration_weeks}-week study plan for the course "{req.course_title}".
Available time: {req.available_hours_per_week} hours/week.
Goal: {req.goal}

Topics to cover:
{topics_str}

Return ONLY valid JSON in this format:
{{
  "plan": [
    {{
      "week": 1,
      "focus": "Week theme",
      "days": [
        {{"day": "Monday", "tasks": ["Read chapter 1", "Watch video"], "duration_mins": 45}},
        ...
      ]
    }}
  ],
  "tips": ["Study tip 1", "Study tip 2"]
}}"""

    try:
        response = await client.chat.completions.create(
            model=settings.openai_chat_model,
            messages=[
                {"role": "system", "content": "You are an expert learning coach. Always respond with valid JSON only."},
                {"role": "user",   "content": prompt},
            ],
            temperature=0.7,
            max_tokens=2048,
            response_format={"type": "json_object"},
        )
        raw = response.choices[0].message.content or "{}"
        parsed = json.loads(raw)

        plan = [
            StudyWeek(
                week=w["week"],
                focus=w["focus"],
                days=[StudyDay(**d) for d in w.get("days", [])],
            )
            for w in parsed.get("plan", [])
        ]
        tips = parsed.get("tips", [])
    except (json.JSONDecodeError, KeyError, TypeError) as e:
        raise HTTPException(status_code=502, detail=f"Failed to parse study plan: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"LLM error: {str(e)}")

    return StudyPlanResponse(plan=plan, tips=tips)
