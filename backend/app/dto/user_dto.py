from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel


# ─── Request DTOs ────────────────────────────────────────────────────────────

class RegisterUserRequest(BaseModel):
    """Payload đăng ký tài khoản mới. Gọi sau khi Firebase Auth đã tạo user."""
    phone_number: str
    name: str
    avatar_url: Optional[str] = None
    address: Optional[str] = None
    date_of_birth: Optional[date] = None
    citizen_number: Optional[str] = None


class UpdateUserRequest(BaseModel):
    """Payload cập nhật thông tin cá nhân. Tất cả field đều Optional."""
    name: Optional[str] = None
    avatar_url: Optional[str] = None
    address: Optional[str] = None
    date_of_birth: Optional[date] = None
    citizen_number: Optional[str] = None


# ─── Response DTOs ────────────────────────────────────────────────────────────

class UserResponse(BaseModel):
    """Response trả về thông tin User."""
    id: str
    phone_number: str
    name: str
    avatar_url: Optional[str] = None
    address: Optional[str] = None
    date_of_birth: Optional[date] = None
    citizen_number: Optional[str] = None
    status: str
    created_at: datetime
    updated_at: datetime
