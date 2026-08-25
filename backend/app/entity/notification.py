from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class NotificationEntity(BaseModel):
    """
    Đại diện cho document trong Firestore collection: user-notifications/{id}

    NoSQL schema fields (Firestore camelCase → Python snake_case):
      userId, deviceId, isRead, createdAt, type (enum), status (number)
    """
    id: Optional[str] = None   # Firestore auto-generated document ID

    title: str                 # Tiêu đề thông báo
    content: str               # Nội dung thông báo
    type: str                  # Loại: ACCIDENT | THEFT | SOS | INFO (enum)
    status: int = 0            # Trạng thái (number)
    user_id: str               # FK → users/{uid}
    is_read: bool = False      # User đã đọc hay chưa
    device_id: str             # FK → devices/{id}
    created_at: datetime       # Thời điểm tạo

    class Config:
        from_attributes = True

