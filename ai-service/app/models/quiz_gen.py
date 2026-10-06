from pydantic import BaseModel


class QuizGenRequest(BaseModel):
    text: str
    num_questions: int = 5
    difficulty: str = "medium"   # easy | medium | hard
    question_types: list[str] = ["multiple_choice"]


class QuizOption(BaseModel):
    id: str
    text: str
    is_correct: bool


class GeneratedQuestion(BaseModel):
    question_text: str
    question_type: str
    options: list[QuizOption] | None = None
    explanation: str | None = None


class QuizGenResponse(BaseModel):
    questions: list[GeneratedQuestion]
