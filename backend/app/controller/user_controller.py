from fastapi import APIRouter, Depends, status

from app.core.dependencies import get_current_user
from app.entity.user import UserEntity
from app.service.user_service import UserService
from app.dto.user_dto import (
    UpdateUserRequest,
    AddSosNumberRequest,
    RemoveSosNumberRequest,
    RegisterFcmTokenRequest,
    UserResponse,
)

router = APIRouter(prefix="/users", tags=["Users"])


def _to_response(user: UserEntity) -> UserResponse:
    return UserResponse(
        id=user.id,
        name=user.name,
        phone_number=user.phone_number,
        avatar_url=user.avatar_url,
        address=user.address,
        date_of_birth=user.date_of_birth,
        citizen_number=user.citizen_number,
        sos_numbers=user.sos_numbers,
        fcm_tokens=user.fcm_tokens,
        last_sign_in=user.last_sign_in,
    )


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Lấy thông tin cá nhân",
    description="Trả về thông tin đầy đủ của User hiện đang đăng nhập.",
)
def get_my_profile(current_user: UserEntity = Depends(get_current_user)):
    return _to_response(current_user)


@router.put(
    "/me",
    response_model=UserResponse,
    summary="Cập nhật thông tin cá nhân",
    description="Cập nhật partial thông tin cá nhân (name, avatarUrl, address, dateOfBirth, citizenNumber).",
)
def update_my_profile(
    payload: UpdateUserRequest,
    current_user: UserEntity = Depends(get_current_user),
):
    service = UserService()
    return _to_response(service.update(current_user.id, payload))


@router.get(
    "/{user_id}",
    response_model=UserResponse,
    summary="Lấy thông tin User theo ID",
)
def get_user_by_id(
    user_id: str,
    current_user: UserEntity = Depends(get_current_user),
):
    service = UserService()
    return _to_response(service.get_by_id(user_id))


# ─── SOS Numbers ───────────────────────────────────────────────────────────────

@router.post(
    "/me/sos-numbers",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
    summary="Thêm số SOS",
    description="Thêm một SĐT vào danh sách sosNumbers[] của User. Không trùng lặp.",
)
def add_sos_number(
    payload: AddSosNumberRequest,
    current_user: UserEntity = Depends(get_current_user),
):
    service = UserService()
    return _to_response(service.add_sos_number(current_user.id, payload.phone_number))


@router.delete(
    "/me/sos-numbers",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
    summary="Xóa số SOS",
    description="Xóa một SĐT khỏi danh sách sosNumbers[] của User.",
)
def remove_sos_number(
    payload: RemoveSosNumberRequest,
    current_user: UserEntity = Depends(get_current_user),
):
    service = UserService()
    return _to_response(service.remove_sos_number(current_user.id, payload.phone_number))


# ─── FCM Tokens ────────────────────────────────────────────────────────────────

@router.post(
    "/me/fcm-tokens",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Đăng ký FCM token",
    description="Thêm FCM token khi user đăng nhập trên thiết bị mới.",
)
def register_fcm_token(
    payload: RegisterFcmTokenRequest,
    current_user: UserEntity = Depends(get_current_user),
):
    service = UserService()
    service.register_fcm_token(current_user.id, payload.token)


@router.delete(
    "/me/fcm-tokens",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Huỷ FCM token",
    description="Xóa FCM token khi user logout.",
)
def unregister_fcm_token(
    payload: RegisterFcmTokenRequest,
    current_user: UserEntity = Depends(get_current_user),
):
    service = UserService()
    service.unregister_fcm_token(current_user.id, payload.token)

