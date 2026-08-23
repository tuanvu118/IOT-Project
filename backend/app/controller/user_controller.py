from fastapi import APIRouter, Depends, status

from app.core.dependencies import get_current_user
from app.entity.user import UserEntity
from app.service.user_service import UserService
from app.dto.user_dto import UpdateUserRequest, UserResponse

router = APIRouter(prefix="/users", tags=["Users"])


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Lấy thông tin cá nhân",
    description="Trả về thông tin đầy đủ của User hiện đang đăng nhập.",
)
def get_my_profile(
    current_user: UserEntity = Depends(get_current_user),
):
    return UserResponse(
        id=current_user.id,
        phone_number=current_user.phone_number,
        name=current_user.name,
        avatar_url=current_user.avatar_url,
        address=current_user.address,
        date_of_birth=current_user.date_of_birth,
        citizen_number=current_user.citizen_number,
        status=current_user.status,
        created_at=current_user.created_at,
        updated_at=current_user.updated_at,
    )


@router.put(
    "/me",
    response_model=UserResponse,
    summary="Cập nhật thông tin cá nhân",
    description="Cập nhật partial thông tin cá nhân của User hiện đang đăng nhập.",
)
def update_my_profile(
    payload: UpdateUserRequest,
    current_user: UserEntity = Depends(get_current_user),
):
    service = UserService()
    updated_user = service.update(current_user.id, payload)

    return UserResponse(
        id=updated_user.id,
        phone_number=updated_user.phone_number,
        name=updated_user.name,
        avatar_url=updated_user.avatar_url,
        address=updated_user.address,
        date_of_birth=updated_user.date_of_birth,
        citizen_number=updated_user.citizen_number,
        status=updated_user.status,
        created_at=updated_user.created_at,
        updated_at=updated_user.updated_at,
    )


@router.get(
    "/{user_id}",
    response_model=UserResponse,
    summary="Lấy thông tin User theo ID",
    description="Lấy thông tin public của một User theo Firebase UID.",
)
def get_user_by_id(
    user_id: str,
    current_user: UserEntity = Depends(get_current_user),
):
    service = UserService()
    user = service.get_by_id(user_id)

    return UserResponse(
        id=user.id,
        phone_number=user.phone_number,
        name=user.name,
        avatar_url=user.avatar_url,
        address=user.address,
        date_of_birth=user.date_of_birth,
        citizen_number=user.citizen_number,
        status=user.status,
        created_at=user.created_at,
        updated_at=user.updated_at,
    )
