import re
from typing import List, Optional
from pydantic import BaseModel, field_validator


EMAIL_GMAIL_REGEX = re.compile(r"^[a-zA-Z0-9._%+-]+@gmail\.com$", re.IGNORECASE)
PHONE_REGEX = re.compile(r"^0[0-9]{9}$")
PASSWORD_REGEX = re.compile(r"^[a-zA-Z0-9]{8,20}$")
CITIZEN_REGEX = re.compile(r"^[0-9]{12}$")


class RegisterUserRequest(BaseModel):
    email: str
    password: str
    name: str
    phone_number: str
    avatar_url: Optional[str] = None
    address: Optional[str] = None
    date_of_birth: Optional[str] = None
    citizen_number: Optional[str] = None

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        clean = (v or "").strip().lower()
        if not clean:
            raise ValueError("Vui lòng nhập địa chỉ email.")
        if not EMAIL_GMAIL_REGEX.match(clean):
            raise ValueError("Email phải có định dạng @gmail.com (ví dụ: user@gmail.com).")
        return clean

    @field_validator("phone_number")
    @classmethod
    def validate_phone_number(cls, v: str) -> str:
        clean = (v or "").strip()
        if not clean:
            raise ValueError("Vui lòng nhập số điện thoại.")
        if not PHONE_REGEX.match(clean):
            raise ValueError("Số điện thoại phải gồm đúng 10 chữ số và bắt đầu bằng số 0.")
        return clean

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        if not v:
            raise ValueError("Vui lòng nhập mật khẩu.")
        if len(v) < 8 or len(v) > 20:
            raise ValueError("Mật khẩu phải dài từ 8 đến 20 ký tự.")
        if not PASSWORD_REGEX.match(v):
            raise ValueError("Mật khẩu chỉ được chứa chữ cái và số, không được chứa ký tự đặc biệt.")
        return v

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        clean = (v or "").strip()
        if not clean:
            raise ValueError("Vui lòng nhập họ và tên.")
        if len(clean) < 2 or len(clean) > 50:
            raise ValueError("Họ và tên phải từ 2 đến 50 ký tự.")
        return clean

    @field_validator("citizen_number")
    @classmethod
    def validate_citizen_number(cls, v: Optional[str]) -> Optional[str]:
        if not v or not v.strip():
            return None
        clean = v.strip()
        if not CITIZEN_REGEX.match(clean):
            raise ValueError("Số CCCD phải gồm đúng 12 chữ số.")
        return clean


class LoginRequest(BaseModel):
    email: str
    password: str

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        clean = (v or "").strip().lower()
        if not clean:
            raise ValueError("Vui lòng nhập địa chỉ email.")
        return clean

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        if not v:
            raise ValueError("Vui lòng nhập mật khẩu.")
        return v


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

    @field_validator("new_password")
    @classmethod
    def validate_new_password(cls, v: str) -> str:
        if not v:
            raise ValueError("Vui lòng nhập mật khẩu mới.")
        if len(v) < 8 or len(v) > 20:
            raise ValueError("Mật khẩu mới phải dài từ 8 đến 20 ký tự.")
        if not PASSWORD_REGEX.match(v):
            raise ValueError("Mật khẩu mới chỉ được chứa chữ cái và số, không được chứa ký tự đặc biệt.")
        return v


class UpdateUserRequest(BaseModel):
    name: Optional[str] = None
    phone_number: Optional[str] = None
    avatar_url: Optional[str] = None
    address: Optional[str] = None
    date_of_birth: Optional[str] = None
    citizen_number: Optional[str] = None

    @field_validator("phone_number")
    @classmethod
    def validate_phone_number(cls, v: Optional[str]) -> Optional[str]:
        if v is None or not v.strip():
            return None
        clean = v.strip()
        if not PHONE_REGEX.match(clean):
            raise ValueError("Số điện thoại phải gồm đúng 10 chữ số và bắt đầu bằng số 0.")
        return clean

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: Optional[str]) -> Optional[str]:
        if v is None or not v.strip():
            return None
        clean = v.strip()
        if len(clean) < 2 or len(clean) > 50:
            raise ValueError("Họ và tên phải từ 2 đến 50 ký tự.")
        return clean

    @field_validator("citizen_number")
    @classmethod
    def validate_citizen_number(cls, v: Optional[str]) -> Optional[str]:
        if not v or not v.strip():
            return None
        clean = v.strip()
        if not CITIZEN_REGEX.match(clean):
            raise ValueError("Số CCCD phải gồm đúng 12 chữ số.")
        return clean


class AddSosNumberRequest(BaseModel):
    phone_number: str

    @field_validator("phone_number")
    @classmethod
    def validate_sos_phone(cls, v: str) -> str:
        clean = (v or "").strip()
        if not clean:
            raise ValueError("Vui lòng nhập số điện thoại khẩn cấp.")
        if not PHONE_REGEX.match(clean):
            raise ValueError("Số điện thoại khẩn cấp phải gồm đúng 10 chữ số và bắt đầu bằng số 0.")
        return clean


class RemoveSosNumberRequest(BaseModel):
    phone_number: str


class RegisterFcmTokenRequest(BaseModel):
    token: str



class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    phone_number: str
    avatar_url: Optional[str] = None
    address: Optional[str] = None
    date_of_birth: Optional[str] = None
    citizen_number: Optional[str] = None
    is_admin: bool = False
    sos_numbers: List[str] = []
    fcm_tokens: List[str] = []
    last_sign_in: Optional[str] = None


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserResponse
