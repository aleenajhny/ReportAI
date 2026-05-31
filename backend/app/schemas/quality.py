from pydantic import BaseModel


class QualityScore(BaseModel):
    grammar: int
    readability: int
    technical_depth: int
    formatting_quality: int
    citation_quality: int
    overall: int
    suggestions: list[str]
