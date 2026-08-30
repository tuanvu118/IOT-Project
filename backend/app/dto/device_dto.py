from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel


# ─── Request DTOs ────────────────────────────────────────────────────────────

class CreateDeviceRequest(BaseModel):
    """Payload tạo Device mới (thường do admin/provisioning thực hiện)."""
    name: str
    verification_code: str
    secret_code: Optional[str] = "123456"


class AddUserDeviceRequest(BaseModel):
    """Payload cho user thêm thiết bị vào tài khoản bằng mã thiết bị và mã xác nhận bí mật."""
    verification_code: str
    secret_code: str
    name: Optional[str] = None
    brand: Optional[str] = None
    model: Optional[str] = None
    color: Optional[str] = None
    license_plate: Optional[str] = None


class LinkDeviceRequest(BaseModel):
    """Liên kết Device với phương tiện của user."""
    device_id: Optional[str] = None
    verification_code: Optional[str] = None
    brand: Optional[str] = None
    model: Optional[str] = None
    color: Optional[str] = None
    license_plate: Optional[str] = None


class UnlinkDeviceRequest(BaseModel):
    """Huỷ liên kết Device khỏi tài khoản."""
    device_id: str


class UpdateDeviceConfigRequest(BaseModel):
    """Cập nhật cấu hình thiết bị (chống trộm on/off)."""
    anti_thief: bool


class UpdateDeviceStatusRequest(BaseModel):
    """Cập nhật trạng thái trực tuyến/ngoại tuyến (1 = Online, 0 = Offline)."""
    status: int


class UpdateVehicleRequest(BaseModel):
    """Cập nhật thông tin xe gắn với thiết bị."""
    brand: Optional[str] = None
    color: Optional[str] = None
    license_plate: Optional[str] = None
    model: Optional[str] = None


class UpdateLocationRequest(BaseModel):
    """Cập nhật vị trí GPS mới nhất của thiết bị."""
    latitude: float
    longitude: float


# ─── Response Sub-models ──────────────────────────────────────────────────────

class DeviceConfigResponse(BaseModel):
    anti_thief: bool = False


class DevicePropertiesResponse(BaseModel):
    last_make_call_time: Optional[datetime] = None
    last_send_sms_time: Optional[datetime] = None
    last_push_notification_time: Optional[datetime] = None


class VehicleInfoResponse(BaseModel):
    brand: Optional[str] = None
    color: Optional[str] = None
    license_plate: Optional[str] = None
    model: Optional[str] = None


class LocationEntryResponse(BaseModel):
    created_at: Optional[datetime] = None
    longitude: Optional[float] = None
    latitude: Optional[float] = None


# ─── Response DTOs ────────────────────────────────────────────────────────────

class DeviceResponse(BaseModel):
    """Response trả về thông tin Device đầy đủ với embedded sub-documents."""
    id: str
    name: str
    status: int
    user_id: Optional[str] = None
    verification_code: str
    config: DeviceConfigResponse = DeviceConfigResponse()
    properties: DevicePropertiesResponse = DevicePropertiesResponse()
    vehicle: VehicleInfoResponse = VehicleInfoResponse()
    locations: List[LocationEntryResponse] = []

