from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class DeviceLocationEntity(BaseModel):
    """
    Đại diện cho document trong Firestore collection: device_locations/{id}
    Lịch sử vị trí GPS của Device. Nên index theo (device_id, recorded_at).
    """
    id: Optional[str] = None  # Firestore auto-generated document ID

    device_id: str             # FK → devices/{id}
    latitude: float            # Vĩ độ
    longitude: float           # Kinh độ
    accuracy: Optional[float] = None   # Độ chính xác GPS (mét)
    speed: Optional[float] = None      # Tốc độ tại thời điểm ghi nhận (km/h)
    battery_level: Optional[float] = None  # Mức pin tại thời điểm ghi vị trí
    recorded_at: datetime      # Thời điểm Device ghi nhận vị trí

    class Config:
        from_attributes = True
