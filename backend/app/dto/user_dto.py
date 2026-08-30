from typing import List, Optional
from pydantic import BaseModel


class RegisterUserRequest(BaseModel):
    email: str
    password: str
    name: str
    phone_number: str
    avatar_url: Optional[str] = None
    address: Optional[str] = None
    date_of_birth: Optional[str] = None
    citizen_number: Optional[str] = None


class LoginRequest(BaseModel):
    email: str
    password: str


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str


class UpdateUserRequest(BaseModel):
    name: Optional[str] = None
    phone_number: Optional[str] = None
    avatar_url: Optional[str] = None
    address: Optional[str] = None
    date_of_birth: Optional[str] = None
    citizen_number: Optional[str] = None


class AddSosNumberRequest(BaseModel):
    phone_number: str


class RemoveSosNumberRequest(BaseModel):
    phone_number: str


class RegisterFcmTokenRequest(BaseModel):
    token: str


class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    phone_number: str
    avatar_url: Optional[str] = None
    address: Optional[str] = None
    date_of_birth: Optional[str] = None
    citizen_number: Optional[str] = None
    is_admin: bool = False
    sos_numbers: List[str] = []
    fcm_tokens: List[str] = []
    last_sign_in: Optional[str] = None


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserResponse
