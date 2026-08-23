from datetime import datetime
from typing import Optional
from pydantic import BaseModel


# ─── Request DTOs ────────────────────────────────────────────────────────────

class CreateDeviceRequest(BaseModel):
    """Payload tạo Device mới (thường do admin hoặc hệ thống thực hiện)."""
    device_code: str
    verification_code: str
    anti_theft_enabled: bool = False
    is_charging: bool = False


class UpdateDeviceStatusRequest(BaseModel):
    """Payload cập nhật trạng thái Device từ thiết bị IoT gửi lên."""
    status: Optional[str] = None            # ONLINE | OFFLINE | LOST | ACCIDENT
    anti_theft_enabled: Optional[bool] = None
    battery_level: Optional[float] = None
    is_charging: Optional[bool] = None


# ─── Response DTOs ────────────────────────────────────────────────────────────

class DeviceResponse(BaseModel):
    """Response trả về thông tin Device."""
    id: str
    device_code: str
    status: str
    anti_theft_enabled: bool
    battery_level: Optional[float] = None
    is_charging: bool
    last_connected_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
