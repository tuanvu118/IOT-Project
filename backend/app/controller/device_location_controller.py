from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, Query, status

from app.core.dependencies import get_current_user
from app.entity.user import UserEntity
from app.service.device_location_service import DeviceLocationService
from app.dto.device_location_dto import CreateDeviceLocationRequest, DeviceLocationResponse

router = APIRouter(prefix="/device-locations", tags=["Device Locations"])


@router.post(
    "",
    response_model=DeviceLocationResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Ghi nhận vị trí GPS",
    description="Thiết bị IoT gọi endpoint này để gửi dữ liệu GPS lên Backend.",
)
def record_location(
    payload: CreateDeviceLocationRequest,
    current_user: UserEntity = Depends(get_current_user),
):
    service = DeviceLocationService()
    location = service.record_location(payload)

    return DeviceLocationResponse(
        id=location.id,
        device_id=location.device_id,
        latitude=location.latitude,
        longitude=location.longitude,
        accuracy=location.accuracy,
        speed=location.speed,
        battery_level=location.battery_level,
        recorded_at=location.recorded_at,
    )


@router.get(
    "/{device_id}/latest",
    response_model=DeviceLocationResponse,
    summary="Lấy vị trí mới nhất của Device",
    description="Trả về bản ghi vị trí GPS gần nhất của thiết bị.",
)
def get_latest_location(
    device_id: str,
    current_user: UserEntity = Depends(get_current_user),
):
    service = DeviceLocationService()
    location = service.get_latest_location(device_id)

    return DeviceLocationResponse(
        id=location.id,
        device_id=location.device_id,
        latitude=location.latitude,
        longitude=location.longitude,
        accuracy=location.accuracy,
        speed=location.speed,
        battery_level=location.battery_level,
        recorded_at=location.recorded_at,
    )


@router.get(
    "/{device_id}/history",
    response_model=List[DeviceLocationResponse],
    summary="Lấy lịch sử vị trí của Device",
    description="Trả về lịch sử GPS của thiết bị, hỗ trợ lọc theo khoảng thời gian.",
)
def get_location_history(
    device_id: str,
    limit: int = Query(default=100, ge=1, le=500, description="Số bản ghi tối đa"),
    start_time: Optional[datetime] = Query(default=None, description="Thời điểm bắt đầu (ISO 8601)"),
    end_time: Optional[datetime] = Query(default=None, description="Thời điểm kết thúc (ISO 8601)"),
    current_user: UserEntity = Depends(get_current_user),
):
    service = DeviceLocationService()
    locations = service.get_location_history(device_id, limit, start_time, end_time)

    return [
        DeviceLocationResponse(
            id=loc.id,
            device_id=loc.device_id,
            latitude=loc.latitude,
            longitude=loc.longitude,
            accuracy=loc.accuracy,
            speed=loc.speed,
            battery_level=loc.battery_level,
            recorded_at=loc.recorded_at,
        )
        for loc in locations
    ]
