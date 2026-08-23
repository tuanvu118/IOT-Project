from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class VehicleEntity(BaseModel):
    """
    Đại diện cho document trong Firestore collection: vehicles/{id}
    Mỗi Device chỉ được gắn với tối đa một Vehicle (device_id UNIQUE).
    """
    id: Optional[str] = None  # Firestore auto-generated document ID

    device_id: str              # FK → devices/{id} (UNIQUE)
    brand: Optional[str] = None        # Hãng xe
    model: Optional[str] = None        # Mẫu/dòng xe
    color: Optional[str] = None        # Màu xe
    license_plate: Optional[str] = None  # Biển số xe (UNIQUE nếu có giá trị)
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
