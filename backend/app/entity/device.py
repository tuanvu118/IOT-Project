from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class DeviceEntity(BaseModel):
    """
    Đại diện cho document trong Firestore collection: devices/{id}
    """
    id: Optional[str] = None  # Firestore auto-generated document ID

    device_code: str           # Mã định danh duy nhất của Device (UNIQUE)
    verification_code: str     # Mã dùng để xác thực/liên kết Device (UNIQUE)
    status: str                # Trạng thái hiện tại: ONLINE | OFFLINE | LOST | ACCIDENT
    anti_theft_enabled: bool   # Chế độ chống trộm đang bật hay tắt
    battery_level: Optional[float] = None  # Phần trăm pin hiện tại (0-100)
    is_charging: bool = False  # Đang sạc hay không
    last_connected_at: Optional[datetime] = None  # Lần cuối kết nối Backend
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
