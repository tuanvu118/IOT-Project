from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class UserDeviceEntity(BaseModel):
    """
    Đại diện cho document trong Firestore collection: user_devices/{id}
    Lịch sử liên kết giữa User và Device.
    Tại một thời điểm chỉ có tối đa một bản ghi active (unlinked_at IS NULL) cho mỗi Device.
    """
    id: Optional[str] = None  # Firestore auto-generated document ID

    user_id: str      # FK → users/{uid}
    device_id: str    # FK → devices/{id}
    linked_at: datetime
    unlinked_at: Optional[datetime] = None  # NULL = đang liên kết

    class Config:
        from_attributes = True
