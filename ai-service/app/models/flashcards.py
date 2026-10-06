from pydantic import BaseModel


class FlashcardsRequest(BaseModel):
    text: str
    num_cards: int = 10


class Flashcard(BaseModel):
    front: str
    back: str


class FlashcardsResponse(BaseModel):
    cards: list[Flashcard]
