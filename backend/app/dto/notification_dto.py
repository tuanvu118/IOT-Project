from datetime import datetime
from pydantic import BaseModel


# ─── Request DTOs ─────────────────────────────────────────────────────────────
# Notification được tạo tự động bởi system/service, không phải từ User trực tiếp.

class CreateNotificationRequest(BaseModel):
    """
    Payload tạo thông báo nội bộ (gọi bởi service khác khi có sự kiện).
    Maps tới collection: user-notifications
    """
    user_id: str
    device_id: str
    type: str        # ACCIDENT | THEFT | SOS | INFO
    title: str
    content: str
    status: int = 0


# ─── Response DTOs ────────────────────────────────────────────────────────────

class NotificationResponse(BaseModel):
    """Response trả về thông tin thông báo."""
    id: str
    title: str
    content: str
    type: str
    status: int
    user_id: str
    is_read: bool
    device_id: str
    created_at: datetime

