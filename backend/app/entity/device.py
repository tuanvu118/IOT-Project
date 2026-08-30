from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel


# ─── Sub-models (embedded documents) ─────────────────────────────────────────

class DeviceConfig(BaseModel):
    """Cấu hình thiết bị – config{}"""
    anti_thief: bool = False  # antiThief


class DeviceProperties(BaseModel):
    """Thuộc tính runtime – properties{}"""
    last_make_call_time: Optional[datetime] = None
    last_send_sms_time: Optional[datetime] = None
    last_push_notification_time: Optional[datetime] = None


class VehicleInfo(BaseModel):
    """Thông tin xe – vehicle{}"""
    brand: Optional[str] = None
    color: Optional[str] = None
    license_plate: Optional[str] = None
    model: Optional[str] = None


class LocationEntry(BaseModel):
    """Một điểm vị trí GPS – locations[0]"""
    created_at: Optional[datetime] = None
    longitude: Optional[float] = None
    latitude: Optional[float] = None


# ─── Main Entity ──────────────────────────────────────────────────────────────

class DeviceEntity(BaseModel):
    """
    Đại diện cho document trong Firestore collection: devices/{id}

    NoSQL schema:
      - userId: liên kết trực tiếp tới owner (thay UserDevice collection)
      - vehicle{}: thông tin xe embedded
      - config{}: cấu hình chống trộm embedded
      - properties{}: timestamps lần gửi thông báo cuối embedded
      - locations[]: chỉ lưu 1 phần tử (vị trí mới nhất)
    """
    id: Optional[str] = None       # Firestore auto-generated document ID
    name: str                       # Tên thiết bị
    status: int = 0                 # Trạng thái (number)
    user_id: Optional[str] = None   # FK → users/{uid}; None nếu chưa liên kết
    verification_code: str          # Mã thiết bị (UNIQUE, VD: IOT-001)
    secret_code: Optional[str] = None # Mã xác thực bí mật (PIN/Secret code của thiết bị)

    config: DeviceConfig = DeviceConfig()
    properties: DeviceProperties = DeviceProperties()
    vehicle: VehicleInfo = VehicleInfo()
    locations: List[LocationEntry] = []  # Luôn có tối đa 1 phần tử

    class Config:
        from_attributes = True

