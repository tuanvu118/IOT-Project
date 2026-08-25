from typing import List
from fastapi import APIRouter, Depends, status

from app.core.dependencies import get_current_user, require_admin
from app.entity.user import UserEntity
from app.service.device_service import DeviceService
from app.dto.device_dto import (
    CreateDeviceRequest,
    LinkDeviceRequest,
    UnlinkDeviceRequest,
    UpdateDeviceConfigRequest,
    UpdateVehicleRequest,
    UpdateLocationRequest,
    DeviceResponse,
    DeviceConfigResponse,
    DevicePropertiesResponse,
    VehicleInfoResponse,
    LocationEntryResponse,
)

router = APIRouter(prefix="/devices", tags=["Devices"])


def _to_response(device) -> DeviceResponse:
    return DeviceResponse(
        id=device.id,
        name=device.name,
        status=device.status,
        user_id=device.user_id,
        verification_code=device.verification_code,
        config=DeviceConfigResponse(anti_thief=device.config.anti_thief),
        properties=DevicePropertiesResponse(
            last_make_call_time=device.properties.last_make_call_time,
            last_send_sms_time=device.properties.last_send_sms_time,
            last_push_notification_time=device.properties.last_push_notification_time,
        ),
        vehicle=VehicleInfoResponse(
            brand=device.vehicle.brand,
            color=device.vehicle.color,
            license_plate=device.vehicle.license_plate,
            model=device.vehicle.model,
        ),
        locations=[
            LocationEntryResponse(
                created_at=loc.created_at,
                longitude=loc.longitude,
                latitude=loc.latitude,
            )
            for loc in device.locations
        ],
    )


# ─── CRUD ──────────────────────────────────────────────────────────────────────

@router.post(
    "",
    response_model=DeviceResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Tạo Device mới",
    description="Đăng ký một thiết bị IoT mới vào hệ thống (thường dành cho admin/provisioning).",
)
def create_device(
    payload: CreateDeviceRequest,
    current_user: UserEntity = Depends(require_admin),
):
    service = DeviceService()
    return _to_response(service.create(payload))


@router.get(
    "/my-devices",
    response_model=List[DeviceResponse],
    summary="Lấy danh sách Device của tôi",
    description="Trả về các thiết bị đang liên kết với tài khoản hiện tại (userId == uid).",
)
def get_my_devices(current_user: UserEntity = Depends(get_current_user)):
    service = DeviceService()
    return [_to_response(d) for d in service.get_by_user(current_user.id)]


@router.get(
    "/{device_id}",
    response_model=DeviceResponse,
    summary="Lấy thông tin Device theo ID",
)
def get_device(
    device_id: str,
    current_user: UserEntity = Depends(get_current_user),
):
    service = DeviceService()
    return _to_response(service.get_by_id(device_id))


# ─── Link / Unlink ─────────────────────────────────────────────────────────────

@router.post(
    "/link",
    response_model=DeviceResponse,
    status_code=status.HTTP_200_OK,
    summary="Liên kết Device với tài khoản",
    description="Liên kết thiết bị IoT với tài khoản User bằng verificationCode. Device phải chưa được ai sở hữu.",
)
def link_device(
    payload: LinkDeviceRequest,
    current_user: UserEntity = Depends(get_current_user),
):
    service = DeviceService()
    return _to_response(service.link_device(current_user.id, payload.verification_code))


@router.post(
    "/unlink",
    response_model=DeviceResponse,
    status_code=status.HTTP_200_OK,
    summary="Huỷ liên kết Device",
    description="Huỷ liên kết thiết bị khỏi tài khoản hiện tại. Chỉ owner mới được thực hiện.",
)
def unlink_device(
    payload: UnlinkDeviceRequest,
    current_user: UserEntity = Depends(get_current_user),
):
    service = DeviceService()
    return _to_response(service.unlink_device(current_user.id, payload.device_id))


# ─── Config ────────────────────────────────────────────────────────────────────

@router.patch(
    "/{device_id}/config",
    response_model=DeviceResponse,
    summary="Cập nhật cấu hình thiết bị",
    description="Bật/tắt chế độ chống trộm (antiThief). Chỉ owner mới được cập nhật.",
)
def update_config(
    device_id: str,
    payload: UpdateDeviceConfigRequest,
    current_user: UserEntity = Depends(get_current_user),
):
    service = DeviceService()
    return _to_response(service.update_config(current_user.id, device_id, payload))


# ─── Vehicle ───────────────────────────────────────────────────────────────────

@router.patch(
    "/{device_id}/vehicle",
    response_model=DeviceResponse,
    summary="Cập nhật thông tin xe",
    description="Cập nhật brand/color/licensePlate/model của xe gắn với thiết bị.",
)
def update_vehicle(
    device_id: str,
    payload: UpdateVehicleRequest,
    current_user: UserEntity = Depends(get_current_user),
):
    service = DeviceService()
    return _to_response(service.update_vehicle(current_user.id, device_id, payload))


# ─── Location ──────────────────────────────────────────────────────────────────

@router.put(
    "/{device_id}/location",
    response_model=DeviceResponse,
    summary="Cập nhật vị trí GPS",
    description="Thiết bị IoT gọi endpoint này để cập nhật vị trí mới nhất (replace locations[0]).",
)
def update_location(
    device_id: str,
    payload: UpdateLocationRequest,
):
    """Không cần auth — thiết bị IoT gọi trực tiếp."""
    service = DeviceService()
    return _to_response(service.update_location(device_id, payload))


