from pydantic import BaseModel, EmailStr, Field


class ExchangeRequest(BaseModel):
    code: str


class TokenPair(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class SignupRequest(BaseModel):
    name: str = Field(min_length=2)
    organization: str = Field(min_length=2)
    email: EmailStr
    password: str = Field(min_length=8)


class SignupResponse(BaseModel):
    message: str


class VerifyOtpRequest(BaseModel):
    email: EmailStr
    code: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str
