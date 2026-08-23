from datetime import datetime
from typing import Optional
from pydantic import BaseModel


# ─── Request DTOs ────────────────────────────────────────────────────────────

class LinkDeviceRequest(BaseModel):
    """Payload liên kết Device với tài khoản User hiện tại."""
    device_code: str         # Mã định danh Device
    verification_code: str   # Mã xác thực Device


class UnlinkDeviceRequest(BaseModel):
    """Payload huỷ liên kết Device."""
    device_id: str


# ─── Response DTOs ────────────────────────────────────────────────────────────

class UserDeviceResponse(BaseModel):
    """Response trả về thông tin liên kết User-Device."""
    id: str
    user_id: str
    device_id: str
    linked_at: datetime
    unlinked_at: Optional[datetime] = None
