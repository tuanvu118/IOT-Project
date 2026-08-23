from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class DeviceEventEntity(BaseModel):
    """
    Đại diện cho document trong Firestore collection: device_events/{id}
    Các sự kiện nghiêm vụ như tai nạn, mất trộm, SOS.
    Nên index theo (device_id, detected_at).
    """
    id: Optional[str] = None  # Firestore auto-generated document ID

    device_id: str             # FK → devices/{id}
    event_type: str            # ACCIDENT | THEFT | SOS
    status: str = "ACTIVE"    # ACTIVE | RESOLVED
    latitude: Optional[float] = None   # Vĩ độ tại thời điểm xảy ra sự kiện
    longitude: Optional[float] = None  # Kinh độ tại thời điểm xảy ra sự kiện
    detected_at: datetime      # Thời điểm phát hiện sự kiện
    resolved_at: Optional[datetime] = None  # Thời điểm sự kiện được xử lý/kết thúc

    class Config:
        from_attributes = True
