from typing import List, Optional
from pydantic import BaseModel


class UserEntity(BaseModel):
    id: str
    email: str
    name: str
    phone_number: str
    password_hash: Optional[str] = None
    avatar_url: Optional[str] = None
    address: Optional[str] = None
    date_of_birth: Optional[str] = None
    citizen_number: Optional[str] = None
    is_admin: bool = False
    sos_numbers: List[str] = []
    fcm_tokens: List[str] = []
    last_sign_in: Optional[str] = None

    class Config:
        from_attributes = True
