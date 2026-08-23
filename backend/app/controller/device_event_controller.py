from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status

from app.core.dependencies import get_current_user
from app.entity.user import UserEntity
from app.service.device_event_service import DeviceEventService
from app.service.notification_service import NotificationService
from app.service.user_device_service import UserDeviceService
from app.dto.device_event_dto import CreateDeviceEventRequest, ResolveDeviceEventRequest, DeviceEventResponse
from app.dto.notification_dto import CreateNotificationRequest

router = APIRouter(prefix="/device-events", tags=["Device Events"])

# Mapping loại sự kiện sang tiêu đề thông báo
EVENT_NOTIFICATION_MAP = {
    "ACCIDENT": ("🚨 Phát hiện tai nạn!", "Thiết bị của bạn đã phát hiện dấu hiệu tai nạn. Vui lòng kiểm tra ngay."),
    "THEFT": ("⚠️ Cảnh báo mất trộm!", "Thiết bị của bạn đã phát hiện dấu hiệu mất trộm xe."),
    "SOS": ("🆘 Tín hiệu SOS!", "Thiết bị của bạn đã gửi tín hiệu SOS khẩn cấp."),
}


@router.post(
    "",
    response_model=DeviceEventResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Tạo sự kiện mới (IoT Device)",
    description=(
        "Thiết bị IoT gọi endpoint này khi phát hiện tai nạn/mất trộm/SOS. "
        "Backend sẽ tự động tạo thông báo cho User đang liên kết với Device."
    ),
)
def create_event(
    payload: CreateDeviceEventRequest,
    current_user: UserEntity = Depends(get_current_user),
):
    event_service = DeviceEventService()
    event = event_service.create_event(payload)

    # Tự động tạo notification cho User đang liên kết với Device
    user_device_service = UserDeviceService()
    active_link = user_device_service.get_active_link_for_device(payload.device_id)

    if active_link:
        notification_service = NotificationService()
        title, content = EVENT_NOTIFICATION_MAP.get(
            payload.event_type,
            ("📢 Thông báo từ thiết bị", "Thiết bị của bạn có sự kiện mới."),
        )
        notification_service.create_notification(
            CreateNotificationRequest(
                user_id=active_link.user_id,
                device_id=payload.device_id,
                event_id=event.id,
                type=payload.event_type,
                title=title,
                content=content,
            )
        )

    return DeviceEventResponse(
        id=event.id,
        device_id=event.device_id,
        event_type=event.event_type,
        status=event.status,
        latitude=event.latitude,
        longitude=event.longitude,
        detected_at=event.detected_at,
        resolved_at=event.resolved_at,
    )


@router.get(
    "/my-events",
    response_model=List[DeviceEventResponse],
    summary="Lịch sử sự kiện của tôi",
    description="Lấy lịch sử sự kiện của tất cả Device đang liên kết với tài khoản hiện tại.",
)
def get_my_events(
    limit: int = Query(default=50, ge=1, le=200),
    current_user: UserEntity = Depends(get_current_user),
):
    service = DeviceEventService()
    events = service.get_events_by_user(current_user.id, limit)

    return [
        DeviceEventResponse(
            id=e.id,
            device_id=e.device_id,
            event_type=e.event_type,
            status=e.status,
            latitude=e.latitude,
            longitude=e.longitude,
            detected_at=e.detected_at,
            resolved_at=e.resolved_at,
        )
        for e in events
    ]


@router.get(
    "/by-device/{device_id}",
    response_model=List[DeviceEventResponse],
    summary="Lịch sử sự kiện theo Device",
    description="Lấy lịch sử sự kiện của một thiết bị cụ thể, có thể lọc theo loại và trạng thái.",
)
def get_events_by_device(
    device_id: str,
    event_type: Optional[str] = Query(default=None, description="ACCIDENT | THEFT | SOS"),
    event_status: Optional[str] = Query(default=None, description="ACTIVE | RESOLVED"),
    limit: int = Query(default=50, ge=1, le=200),
    current_user: UserEntity = Depends(get_current_user),
):
    service = DeviceEventService()
    events = service.get_events_by_device(device_id, event_type, event_status, limit)

    return [
        DeviceEventResponse(
            id=e.id,
            device_id=e.device_id,
            event_type=e.event_type,
            status=e.status,
            latitude=e.latitude,
            longitude=e.longitude,
            detected_at=e.detected_at,
            resolved_at=e.resolved_at,
        )
        for e in events
    ]


@router.get(
    "/{event_id}",
    response_model=DeviceEventResponse,
    summary="Lấy chi tiết sự kiện theo ID",
)
def get_event(
    event_id: str,
    current_user: UserEntity = Depends(get_current_user),
):
    service = DeviceEventService()
    event = service.get_by_id(event_id)

    return DeviceEventResponse(
        id=event.id,
        device_id=event.device_id,
        event_type=event.event_type,
        status=event.status,
        latitude=event.latitude,
        longitude=event.longitude,
        detected_at=event.detected_at,
        resolved_at=event.resolved_at,
    )


@router.put(
    "/{event_id}/resolve",
    response_model=DeviceEventResponse,
    summary="Xác nhận xử lý sự kiện",
    description="Đánh dấu sự kiện đã được xử lý/giải quyết.",
)
def resolve_event(
    event_id: str,
    payload: ResolveDeviceEventRequest,
    current_user: UserEntity = Depends(get_current_user),
):
    service = DeviceEventService()
    event = service.resolve_event(event_id, payload)

    return DeviceEventResponse(
        id=event.id,
        device_id=event.device_id,
        event_type=event.event_type,
        status=event.status,
        latitude=event.latitude,
        longitude=event.longitude,
        detected_at=event.detected_at,
        resolved_at=event.resolved_at,
    )
