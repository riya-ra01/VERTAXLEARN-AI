"""Split raw text into overlapping chunks for embedding."""

from langchain_text_splitters import RecursiveCharacterTextSplitter
from app.core.config import settings


def chunk_text(text: str) -> list[str]:
    """Return a list of text chunks suitable for embedding."""
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=settings.chunk_size,
        chunk_overlap=settings.chunk_overlap,
        separators=["\n\n", "\n", ". ", " ", ""],
    )
    return splitter.split_text(text)
