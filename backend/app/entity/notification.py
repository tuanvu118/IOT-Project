from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class NotificationEntity(BaseModel):
    """
    Đại diện cho document trong Firestore collection: notifications/{id}
    Thông báo hiển thị trên ứng dụng của User.
    Nên index theo (user_id, created_at).
    """
    id: Optional[str] = None  # Firestore auto-generated document ID

    user_id: str               # FK → users/{uid}
    device_id: str             # FK → devices/{id}
    event_id: Optional[str] = None  # FK → device_events/{id} nếu có
    type: str                  # Loại thông báo: ACCIDENT | THEFT | SOS | INFO
    title: str                 # Tiêu đề thông báo
    content: str               # Nội dung thông báo
    is_read: bool = False      # User đã đọc hay chưa
    read_at: Optional[datetime] = None  # Thời điểm User đọc thông báo
    created_at: datetime       # Thời điểm tạo thông báo

    class Config:
        from_attributes = True
