from datetime import datetime
from typing import Optional
from pydantic import BaseModel


# ─── Request DTOs ────────────────────────────────────────────────────────────

class CreateEmergencyContactRequest(BaseModel):
    """Payload tạo số liên hệ khẩn cấp mới."""
    name: str
    phone_number: str
    relationship: Optional[str] = None
    priority: Optional[int] = None


class UpdateEmergencyContactRequest(BaseModel):
    """Payload cập nhật thông tin contact. Tất cả field đều Optional."""
    name: Optional[str] = None
    phone_number: Optional[str] = None
    relationship: Optional[str] = None
    priority: Optional[int] = None
    is_active: Optional[bool] = None


# ─── Response DTOs ────────────────────────────────────────────────────────────

class EmergencyContactResponse(BaseModel):
    """Response trả về thông tin số liên hệ khẩn cấp."""
    id: str
    user_id: str
    name: str
    phone_number: str
    relationship: Optional[str] = None
    priority: Optional[int] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime
