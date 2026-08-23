from datetime import datetime
from typing import Optional
from pydantic import BaseModel


# ─── Request DTOs ────────────────────────────────────────────────────────────

class CreateVehicleRequest(BaseModel):
    """Payload tạo thông tin phương tiện mới gắn với Device."""
    device_id: str
    brand: Optional[str] = None
    model: Optional[str] = None
    color: Optional[str] = None
    license_plate: Optional[str] = None


class UpdateVehicleRequest(BaseModel):
    """Payload cập nhật thông tin phương tiện. Tất cả field đều Optional."""
    brand: Optional[str] = None
    model: Optional[str] = None
    color: Optional[str] = None
    license_plate: Optional[str] = None


# ─── Response DTOs ────────────────────────────────────────────────────────────

class VehicleResponse(BaseModel):
    """Response trả về thông tin phương tiện."""
    id: str
    device_id: str
    brand: Optional[str] = None
    model: Optional[str] = None
    color: Optional[str] = None
    license_plate: Optional[str] = None
    created_at: datetime
    updated_at: datetime
