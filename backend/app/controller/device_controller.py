from typing import List
from fastapi import APIRouter, Depends, status

from app.core.dependencies import get_current_user
from app.entity.user import UserEntity
from app.service.device_service import DeviceService
from app.service.user_device_service import UserDeviceService
from app.dto.device_dto import CreateDeviceRequest, UpdateDeviceStatusRequest, DeviceResponse
from app.dto.user_device_dto import LinkDeviceRequest, UnlinkDeviceRequest, UserDeviceResponse

router = APIRouter(prefix="/devices", tags=["Devices"])


@router.post(
    "",
    response_model=DeviceResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Tạo Device mới",
    description="Đăng ký một thiết bị IoT mới vào hệ thống (thường dành cho admin/provisioning).",
)
def create_device(
    payload: CreateDeviceRequest,
    current_user: UserEntity = Depends(get_current_user),
):
    service = DeviceService()
    device = service.create(payload)

    return DeviceResponse(
        id=device.id,
        device_code=device.device_code,
        status=device.status,
        anti_theft_enabled=device.anti_theft_enabled,
        battery_level=device.battery_level,
        is_charging=device.is_charging,
        last_connected_at=device.last_connected_at,
        created_at=device.created_at,
        updated_at=device.updated_at,
    )


@router.get(
    "/my-devices",
    response_model=List[DeviceResponse],
    summary="Lấy danh sách Device của tôi",
    description="Trả về danh sách các thiết bị đang liên kết với tài khoản hiện tại.",
)
def get_my_devices(
    current_user: UserEntity = Depends(get_current_user),
):
    service = DeviceService()
    devices = service.get_devices_by_user(current_user.id)

    return [
        DeviceResponse(
            id=d.id,
            device_code=d.device_code,
            status=d.status,
            anti_theft_enabled=d.anti_theft_enabled,
            battery_level=d.battery_level,
            is_charging=d.is_charging,
            last_connected_at=d.last_connected_at,
            created_at=d.created_at,
            updated_at=d.updated_at,
        )
        for d in devices
    ]


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
    device = service.get_by_id(device_id)

    return DeviceResponse(
        id=device.id,
        device_code=device.device_code,
        status=device.status,
        anti_theft_enabled=device.anti_theft_enabled,
        battery_level=device.battery_level,
        is_charging=device.is_charging,
        last_connected_at=device.last_connected_at,
        created_at=device.created_at,
        updated_at=device.updated_at,
    )


@router.put(
    "/{device_id}/status",
    response_model=DeviceResponse,
    summary="Cập nhật trạng thái Device",
    description="Thiết bị IoT gọi endpoint này để cập nhật status, pin, v.v.",
)
def update_device_status(
    device_id: str,
    payload: UpdateDeviceStatusRequest,
    current_user: UserEntity = Depends(get_current_user),
):
    service = DeviceService()
    device = service.update_status(device_id, payload)

    return DeviceResponse(
        id=device.id,
        device_code=device.device_code,
        status=device.status,
        anti_theft_enabled=device.anti_theft_enabled,
        battery_level=device.battery_level,
        is_charging=device.is_charging,
        last_connected_at=device.last_connected_at,
        created_at=device.created_at,
        updated_at=device.updated_at,
    )


# ─── Device Linking ────────────────────────────────────────────────────────────

@router.post(
    "/link",
    response_model=UserDeviceResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Liên kết Device với tài khoản",
    description="Liên kết thiết bị IoT với tài khoản User bằng device_code và verification_code.",
)
def link_device(
    payload: LinkDeviceRequest,
    current_user: UserEntity = Depends(get_current_user),
):
    service = UserDeviceService()
    link = service.link_device(current_user.id, payload)

    return UserDeviceResponse(
        id=link.id,
        user_id=link.user_id,
        device_id=link.device_id,
        linked_at=link.linked_at,
        unlinked_at=link.unlinked_at,
    )


@router.post(
    "/unlink",
    response_model=UserDeviceResponse,
    summary="Huỷ liên kết Device",
    description="Huỷ liên kết thiết bị IoT khỏi tài khoản hiện tại.",
)
def unlink_device(
    payload: UnlinkDeviceRequest,
    current_user: UserEntity = Depends(get_current_user),
):
    service = UserDeviceService()
    link = service.unlink_device(current_user.id, payload.device_id)

    return UserDeviceResponse(
        id=link.id,
        user_id=link.user_id,
        device_id=link.device_id,
        linked_at=link.linked_at,
        unlinked_at=link.unlinked_at,
    )


@router.get(
    "/link-history",
    response_model=List[UserDeviceResponse],
    summary="Lịch sử liên kết Device",
    description="Trả về toàn bộ lịch sử liên kết Device của User hiện tại.",
)
def get_link_history(
    current_user: UserEntity = Depends(get_current_user),
):
    service = UserDeviceService()
    links = service.get_user_links(current_user.id)

    return [
        UserDeviceResponse(
            id=link.id,
            user_id=link.user_id,
            device_id=link.device_id,
            linked_at=link.linked_at,
            unlinked_at=link.unlinked_at,
        )
        for link in links
    ]
