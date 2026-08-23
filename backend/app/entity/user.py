from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel


class UserEntity(BaseModel):
    """
    Đại diện cho document trong Firestore collection: users/{uid}
    Document ID = Firebase Auth UID
    """
    id: str  # Firebase UID

    phone_number: str
    name: str
    avatar_url: Optional[str] = None
    address: Optional[str] = None
    date_of_birth: Optional[date] = None
    citizen_number: Optional[str] = None
    status: str = "ACTIVE"  # ACTIVE | INACTIVE
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
