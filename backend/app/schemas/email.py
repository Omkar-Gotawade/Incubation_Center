from pydantic import BaseModel


class EmailBroadcastResponse(BaseModel):
    message: str
    recipients_count: int
