from pydantic import BaseModel


class StudyPlanRequest(BaseModel):
    course_title: str
    topics: list[str]
    available_hours_per_week: int = 5
    duration_weeks: int = 4
    goal: str = "complete the course"


class StudyDay(BaseModel):
    day: str
    tasks: list[str]
    duration_mins: int


class StudyWeek(BaseModel):
    week: int
    focus: str
    days: list[StudyDay]


class StudyPlanResponse(BaseModel):
    plan: list[StudyWeek]
    tips: list[str]
