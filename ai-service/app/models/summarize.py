from pydantic import BaseModel


class SummarizeRequest(BaseModel):
    text: str
    style: str = "concise"   # concise | detailed | bullet_points


class SummarizeResponse(BaseModel):
    summary: str
