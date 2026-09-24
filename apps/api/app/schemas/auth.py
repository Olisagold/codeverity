from pydantic import BaseModel


class ExchangeRequest(BaseModel):
    code: str


class TokenPair(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
