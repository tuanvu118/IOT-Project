from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class EmergencyContactEntity(BaseModel):
    """
    Đại diện cho document trong Firestore collection: emergency_contacts/{id}
    Danh sách số điện thoại SOS của User.
    """
    id: Optional[str] = None  # Firestore auto-generated document ID

    user_id: str               # FK → users/{uid}
    name: str                  # Tên người liên hệ
    phone_number: str          # Số điện thoại nhận SOS
    relationship: Optional[str] = None  # Mối quan hệ với User (bố, mẹ, bạn, ...)
    priority: Optional[int] = None      # Thứ tự ưu tiên khi xử lý liên hệ
    is_active: bool = True     # Contact còn được sử dụng hay không
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
