from typing import List
from fastapi import APIRouter, Depends, status

from app.core.dependencies import get_current_user, require_admin
from app.entity.user import UserEntity
from app.service.device_service import DeviceService
from app.dto.device_dto import (
    CreateDeviceRequest,
    AddUserDeviceRequest,
    LinkDeviceRequest,
    UnlinkDeviceRequest,
    UpdateDeviceConfigRequest,
    UpdateDeviceStatusRequest,
    UpdateVehicleRequest,
    UpdateLocationRequest,
    UpdateDeviceBasicRequest,
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

@router.get(
    "",
    response_model=List[DeviceResponse],
    summary="Lấy danh sách toàn bộ thiết bị (Admin)",
    description="Trả về tất cả thiết bị IoT trong hệ thống (chỉ dành cho Quản trị viên).",
)
def get_all_devices(current_user: UserEntity = Depends(require_admin)):
    service = DeviceService()
    return [_to_response(d) for d in service.get_all_devices()]


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


@router.post(
    "/user-add",
    response_model=DeviceResponse,
    status_code=status.HTTP_200_OK,
    summary="Người dùng thêm thiết bị bằng mã",
    description="Cho phép người dùng thêm thiết bị IoT vào tài khoản bằng mã xác thực (verificationCode) được in trên thiết bị. Hệ thống sẽ đối chiếu với cơ sở dữ liệu để kích hoạt.",
)
def add_user_device(
    payload: AddUserDeviceRequest,
    current_user: UserEntity = Depends(get_current_user),
):
    service = DeviceService()
    return _to_response(service.add_device_by_user(current_user.id, payload))


@router.post(
    "/user-create",
    response_model=DeviceResponse,
    status_code=status.HTTP_200_OK,
    include_in_schema=False,
)
def user_create_device_alias(
    payload: AddUserDeviceRequest,
    current_user: UserEntity = Depends(get_current_user),
):
    service = DeviceService()
    return _to_response(service.add_device_by_user(current_user.id, payload))


@router.get(
    "/my-devices",
    response_model=List[DeviceResponse],
    summary="Lấy danh sách Device của tôi",
    description="Trả về các thiết bị đang thuộc quyền sở hữu của tài khoản hiện tại (userId == uid).",
)
def get_my_devices(current_user: UserEntity = Depends(get_current_user)):
    service = DeviceService()
    return [_to_response(d) for d in service.get_by_user(current_user.id)]


@router.get(
    "/available",
    response_model=List[DeviceResponse],
    summary="Lấy danh sách thiết bị chưa liên kết (Admin)",
    description="Trả về các thiết bị IoT chưa thuộc về user nào trong kho (chỉ dành cho Quản trị viên).",
)
def get_available_devices(current_user: UserEntity = Depends(require_admin)):
    service = DeviceService()
    return [_to_response(d) for d in service.get_unlinked_devices()]


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
    return _to_response(
        service.get_by_id(
            device_id=device_id,
            user_id=None if current_user.is_admin else current_user.id,
        )
    )


# ─── Link / Unlink ─────────────────────────────────────────────────────────────

@router.post(
    "/link",
    response_model=DeviceResponse,
    status_code=status.HTTP_200_OK,
    summary="Liên kết Device với phương tiện",
    description="Liên kết thiết bị IoT thuộc sở hữu của User với một phương tiện.",
)
def link_device(
    payload: LinkDeviceRequest,
    current_user: UserEntity = Depends(get_current_user),
):
    service = DeviceService()
    target_id = payload.device_id or payload.verification_code
    return _to_response(
        service.link_device_to_vehicle(
            user_id=current_user.id,
            device_id_or_code=target_id,
            brand=payload.brand,
            model=payload.model,
            license_plate=payload.license_plate,
            color=payload.color,
        )
    )


@router.post(
    "/unlink",
    response_model=DeviceResponse,
    status_code=status.HTTP_200_OK,
    summary="Huỷ liên kết phương tiện khỏi thiết bị",
    description="Huỷ liên kết phương tiện khỏi thiết bị (giữ nguyên quyền sở hữu thiết bị của user).",
)
def unlink_device(
    payload: UnlinkDeviceRequest,
    current_user: UserEntity = Depends(get_current_user),
):
    service = DeviceService()
    return _to_response(service.unlink_device(current_user.id, payload.device_id))


@router.post(
    "/remove",
    response_model=DeviceResponse,
    status_code=status.HTTP_200_OK,
    summary="Gỡ thiết bị khỏi tài khoản",
    description="Gỡ quyền sở hữu thiết bị khỏi tài khoản (trả về kho).",
)
def remove_device(
    payload: UnlinkDeviceRequest,
    current_user: UserEntity = Depends(get_current_user),
):
    service = DeviceService()
    return _to_response(service.remove_device_from_user(current_user.id, payload.device_id))


@router.delete(
    "/{device_id}",
    response_model=DeviceResponse,
    status_code=status.HTTP_200_OK,
    summary="Xóa/Gỡ thiết bị khỏi tài khoản",
    description="Gỡ quyền sở hữu thiết bị khỏi tài khoản người dùng.",
)
def delete_device(
    device_id: str,
    current_user: UserEntity = Depends(get_current_user),
):
    service = DeviceService()
    return _to_response(service.remove_device_from_user(current_user.id, device_id))



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


@router.patch(
    "/{device_id}/status",
    response_model=DeviceResponse,
    summary="Cập nhật trạng thái trực tuyến / ngoại tuyến",
    description="Chuyển trạng thái hoạt động của thiết bị (1: Trực tuyến, 0: Ngoại tuyến). Chỉ owner mới được cập nhật.",
)
def update_status(
    device_id: str,
    payload: UpdateDeviceStatusRequest,
    current_user: UserEntity = Depends(get_current_user),
):
    service = DeviceService()
    return _to_response(service.update_status(current_user.id, device_id, payload))


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


@router.put(
    "/{device_id}",
    response_model=DeviceResponse,
    summary="Cập nhật thông tin cơ bản của thiết bị",
    description="Cập nhật tên thiết bị, mã xác minh bí mật (Admin hoặc Owner).",
)
def update_device_basic(
    device_id: str,
    payload: UpdateDeviceBasicRequest,
    current_user: UserEntity = Depends(get_current_user),
):
    service = DeviceService()
    return _to_response(service.update_device(device_id, name=payload.name, secret_code=payload.secret_code))

