from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class PrototypeCreate(BaseModel):
    title: str = Field(min_length=3, max_length=200)
    description: str = Field(min_length=10, max_length=5000)


class PrototypeResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    description: str
    created_by: int
    created_at: datetime
