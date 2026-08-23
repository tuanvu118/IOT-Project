from fastapi import APIRouter, Depends, status

from app.core.dependencies import get_current_user
from app.entity.user import UserEntity
from app.service.vehicle_service import VehicleService
from app.dto.vehicle_dto import CreateVehicleRequest, UpdateVehicleRequest, VehicleResponse

router = APIRouter(prefix="/vehicles", tags=["Vehicles"])


@router.post(
    "",
    response_model=VehicleResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Tạo thông tin phương tiện",
    description="Gắn thông tin phương tiện với một Device. Mỗi Device chỉ có tối đa một phương tiện.",
)
def create_vehicle(
    payload: CreateVehicleRequest,
    current_user: UserEntity = Depends(get_current_user),
):
    service = VehicleService()
    vehicle = service.create(payload)

    return VehicleResponse(
        id=vehicle.id,
        device_id=vehicle.device_id,
        brand=vehicle.brand,
        model=vehicle.model,
        color=vehicle.color,
        license_plate=vehicle.license_plate,
        created_at=vehicle.created_at,
        updated_at=vehicle.updated_at,
    )


@router.get(
    "/{vehicle_id}",
    response_model=VehicleResponse,
    summary="Lấy thông tin phương tiện theo ID",
)
def get_vehicle(
    vehicle_id: str,
    current_user: UserEntity = Depends(get_current_user),
):
    service = VehicleService()
    vehicle = service.get_by_id(vehicle_id)

    return VehicleResponse(
        id=vehicle.id,
        device_id=vehicle.device_id,
        brand=vehicle.brand,
        model=vehicle.model,
        color=vehicle.color,
        license_plate=vehicle.license_plate,
        created_at=vehicle.created_at,
        updated_at=vehicle.updated_at,
    )


@router.get(
    "/by-device/{device_id}",
    response_model=VehicleResponse,
    summary="Lấy thông tin phương tiện theo Device ID",
)
def get_vehicle_by_device(
    device_id: str,
    current_user: UserEntity = Depends(get_current_user),
):
    service = VehicleService()
    vehicle = service.get_by_device_id(device_id)

    return VehicleResponse(
        id=vehicle.id,
        device_id=vehicle.device_id,
        brand=vehicle.brand,
        model=vehicle.model,
        color=vehicle.color,
        license_plate=vehicle.license_plate,
        created_at=vehicle.created_at,
        updated_at=vehicle.updated_at,
    )


@router.put(
    "/{vehicle_id}",
    response_model=VehicleResponse,
    summary="Cập nhật thông tin phương tiện",
)
def update_vehicle(
    vehicle_id: str,
    payload: UpdateVehicleRequest,
    current_user: UserEntity = Depends(get_current_user),
):
    service = VehicleService()
    vehicle = service.update(vehicle_id, payload)

    return VehicleResponse(
        id=vehicle.id,
        device_id=vehicle.device_id,
        brand=vehicle.brand,
        model=vehicle.model,
        color=vehicle.color,
        license_plate=vehicle.license_plate,
        created_at=vehicle.created_at,
        updated_at=vehicle.updated_at,
    )


@router.delete(
    "/{vehicle_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Xoá thông tin phương tiện",
)
def delete_vehicle(
    vehicle_id: str,
    current_user: UserEntity = Depends(get_current_user),
):
    service = VehicleService()
    service.delete(vehicle_id)
