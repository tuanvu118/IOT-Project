from typing import List
from fastapi import APIRouter, Depends, Query, status
from fastapi.responses import JSONResponse

from app.core.dependencies import get_current_user
from app.entity.user import UserEntity
from app.service.notification_service import NotificationService
from app.dto.notification_dto import NotificationResponse

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get(
    "",
    response_model=List[NotificationResponse],
    summary="Lấy danh sách thông báo",
    description="Trả về danh sách thông báo của User hiện tại, sắp xếp mới nhất trước.",
)
def get_notifications(
    unread_only: bool = Query(default=False, description="Chỉ lấy thông báo chưa đọc"),
    limit: int = Query(default=50, ge=1, le=200),
    current_user: UserEntity = Depends(get_current_user),
):
    service = NotificationService()
    notifications = service.get_user_notifications(current_user.id, unread_only, limit)

    return [
        NotificationResponse(
            id=n.id,
            user_id=n.user_id,
            device_id=n.device_id,
            event_id=n.event_id,
            type=n.type,
            title=n.title,
            content=n.content,
            is_read=n.is_read,
            read_at=n.read_at,
            created_at=n.created_at,
        )
        for n in notifications
    ]


@router.get(
    "/unread-count",
    summary="Đếm số thông báo chưa đọc",
    description="Trả về số lượng thông báo chưa đọc của User hiện tại.",
)
def get_unread_count(
    current_user: UserEntity = Depends(get_current_user),
):
    service = NotificationService()
    count = service.get_unread_count(current_user.id)
    return {"unread_count": count}


@router.put(
    "/{notification_id}/read",
    response_model=NotificationResponse,
    summary="Đánh dấu thông báo đã đọc",
)
def mark_as_read(
    notification_id: str,
    current_user: UserEntity = Depends(get_current_user),
):
    service = NotificationService()
    notification = service.mark_as_read(notification_id, current_user.id)

    return NotificationResponse(
        id=notification.id,
        user_id=notification.user_id,
        device_id=notification.device_id,
        event_id=notification.event_id,
        type=notification.type,
        title=notification.title,
        content=notification.content,
        is_read=notification.is_read,
        read_at=notification.read_at,
        created_at=notification.created_at,
    )


@router.put(
    "/read-all",
    summary="Đánh dấu tất cả đã đọc",
    description="Đánh dấu tất cả thông báo chưa đọc của User là đã đọc.",
)
def mark_all_as_read(
    current_user: UserEntity = Depends(get_current_user),
):
    service = NotificationService()
    count = service.mark_all_as_read(current_user.id)
    return {"message": f"Đã đánh dấu {count} thông báo là đã đọc.", "updated_count": count}
