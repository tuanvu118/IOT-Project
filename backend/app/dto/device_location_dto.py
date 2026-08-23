from datetime import datetime
from typing import Optional
from pydantic import BaseModel


# ─── Request DTOs ────────────────────────────────────────────────────────────

class CreateDeviceLocationRequest(BaseModel):
    """Payload ghi nhận vị trí GPS từ thiết bị IoT."""
    device_id: str
    latitude: float
    longitude: float
    accuracy: Optional[float] = None
    speed: Optional[float] = None
    battery_level: Optional[float] = None
    recorded_at: datetime


# ─── Response DTOs ────────────────────────────────────────────────────────────

class DeviceLocationResponse(BaseModel):
    """Response trả về thông tin vị trí."""
    id: str
    device_id: str
    latitude: float
    longitude: float
    accuracy: Optional[float] = None
    speed: Optional[float] = None
    battery_level: Optional[float] = None
    recorded_at: datetime
