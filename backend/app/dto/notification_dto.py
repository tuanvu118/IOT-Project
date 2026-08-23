from datetime import datetime
from typing import Optional
from pydantic import BaseModel


# ─── Response DTOs ────────────────────────────────────────────────────────────
# Notification không có CreateRequest từ phía User (được tạo tự động bởi system)

class NotificationResponse(BaseModel):
    """Response trả về thông tin thông báo."""
    id: str
    user_id: str
    device_id: str
    event_id: Optional[str] = None
    type: str
    title: str
    content: str
    is_read: bool
    read_at: Optional[datetime] = None
    created_at: datetime


class CreateNotificationRequest(BaseModel):
    """
    Payload tạo thông báo nội bộ (gọi bởi service khác, không phải từ User trực tiếp).
    """
    user_id: str
    device_id: str
    event_id: Optional[str] = None
    type: str
    title: str
    content: str
