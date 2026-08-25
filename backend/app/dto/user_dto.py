from typing import List, Optional
from pydantic import BaseModel


# ─── Request DTOs ────────────────────────────────────────────────────────────

class RegisterUserRequest(BaseModel):
    """Payload đăng ký tài khoản mới. Gọi sau khi Firebase Auth đã tạo user."""
    name: str
    phone_number: str
    avatar_url: Optional[str] = None
    address: Optional[str] = None
    date_of_birth: Optional[str] = None    # ISO string, e.g. "1999-05-20"
    citizen_number: Optional[str] = None


class UpdateUserRequest(BaseModel):
    """Payload cập nhật thông tin cá nhân. Tất cả field đều Optional."""
    name: Optional[str] = None
    avatar_url: Optional[str] = None
    address: Optional[str] = None
    date_of_birth: Optional[str] = None
    citizen_number: Optional[str] = None


class AddSosNumberRequest(BaseModel):
    """Thêm một SĐT vào danh sách SOS."""
    phone_number: str


class RemoveSosNumberRequest(BaseModel):
    """Xóa một SĐT khỏi danh sách SOS."""
    phone_number: str


class RegisterFcmTokenRequest(BaseModel):
    """Đăng ký FCM token cho thiết bị di động."""
    token: str


# ─── Response DTOs ────────────────────────────────────────────────────────────

class UserResponse(BaseModel):
    """Response trả về thông tin User."""
    id: str
    name: str
    phone_number: str
    avatar_url: Optional[str] = None
    address: Optional[str] = None
    date_of_birth: Optional[str] = None
    citizen_number: Optional[str] = None
    sos_numbers: List[str] = []
    fcm_tokens: List[str] = []
    last_sign_in: Optional[str] = None

