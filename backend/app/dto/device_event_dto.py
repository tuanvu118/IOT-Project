from datetime import datetime
from typing import Optional
from pydantic import BaseModel


# ─── Request DTOs ────────────────────────────────────────────────────────────

class CreateDeviceEventRequest(BaseModel):
    """Payload tạo sự kiện từ thiết bị IoT (tai nạn, mất trộm, SOS)."""
    device_id: str
    event_type: str            # ACCIDENT | THEFT | SOS
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    detected_at: datetime


class ResolveDeviceEventRequest(BaseModel):
    """Payload đánh dấu sự kiện đã được xử lý."""
    resolved_at: Optional[datetime] = None  # Mặc định là thời điểm hiện tại nếu None


# ─── Response DTOs ────────────────────────────────────────────────────────────

class DeviceEventResponse(BaseModel):
    """Response trả về thông tin sự kiện."""
    id: str
    device_id: str
    event_type: str
    status: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    detected_at: datetime
    resolved_at: Optional[datetime] = None
