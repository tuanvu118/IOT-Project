from typing import List
from fastapi import APIRouter, Depends, File, UploadFile, status

from app.core.dependencies import get_current_user, require_admin
from app.dto.user_dto import (
    AddSosNumberRequest,
    RegisterFcmTokenRequest,
    RemoveSosNumberRequest,
    ToggleLockRequest,
    UpdateUserRequest,
    UserResponse,
)
from app.entity.user import UserEntity
from app.service.cloudinary_service import CloudinaryService
from app.service.user_service import UserService

router = APIRouter(prefix="/users", tags=["Users"])


def _to_response(user: UserEntity) -> UserResponse:
    return UserResponse(
        id=user.id,
        email=user.email,
        name=user.name,
        phone_number=user.phone_number,
        avatar_url=user.avatar_url,
        address=user.address,
        date_of_birth=user.date_of_birth,
        citizen_number=user.citizen_number,
        is_admin=user.is_admin,
        sos_numbers=user.sos_numbers,
        fcm_tokens=user.fcm_tokens,
        last_sign_in=user.last_sign_in,
    )


@router.get(
    "",
    response_model=List[UserResponse],
    summary="Lấy danh sách tất cả người dùng (Admin)",
    description="Chỉ dành cho quản trị viên.",
)
def get_all_users(current_user: UserEntity = Depends(require_admin)):
    service = UserService()
    return [_to_response(u) for u in service.get_all()]


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Lấy thông tin cá nhân",
    description="Trả về thông tin đầy đủ của user hiện đang đăng nhập.",
)
def get_my_profile(current_user: UserEntity = Depends(get_current_user)):
    return _to_response(current_user)



@router.put(
    "/me",
    response_model=UserResponse,
    summary="Cập nhật thông tin cá nhân",
    description="Cập nhật một phần thông tin cá nhân: name, avatarUrl, address, dateOfBirth, citizenNumber.",
)
def update_my_profile(
    payload: UpdateUserRequest,
    current_user: UserEntity = Depends(get_current_user),
):
    service = UserService()
    return _to_response(service.update(current_user.id, payload))


@router.post(
    "/me/avatar",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
    summary="Upload avatar cá nhân",
    description="Upload avatar lên Cloudinary, sau đó lưu secure_url vào Firestore field avatarUrl.",
)
def upload_my_avatar(
    file: UploadFile = File(...),
    current_user: UserEntity = Depends(get_current_user),
):
    cloudinary_service = CloudinaryService()
    avatar_url = cloudinary_service.upload_avatar(current_user.id, file)

    service = UserService()
    payload = UpdateUserRequest(avatar_url=avatar_url)
    return _to_response(service.update(current_user.id, payload))


@router.get(
    "/{user_id}",
    response_model=UserResponse,
    summary="Lấy thông tin user theo ID",
)
def get_user_by_id(
    user_id: str,
    current_user: UserEntity = Depends(get_current_user),
):
    service = UserService()
    return _to_response(service.get_by_id(user_id))


@router.post(
    "/me/sos-numbers",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
    summary="Thêm số SOS",
    description="Thêm một số điện thoại vào danh sách sosNumbers của user. Không thêm trùng lặp.",
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
    description="Xóa một số điện thoại khỏi danh sách sosNumbers của user.",
)
def remove_sos_number(
    payload: RemoveSosNumberRequest,
    current_user: UserEntity = Depends(get_current_user),
):
    service = UserService()
    return _to_response(service.remove_sos_number(current_user.id, payload.phone_number))


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
    summary="Hủy FCM token",
    description="Xóa FCM token khi user logout.",
)
def unregister_fcm_token(
    payload: RegisterFcmTokenRequest,
    current_user: UserEntity = Depends(get_current_user),
):
    service = UserService()
    service.unregister_fcm_token(current_user.id, payload.token)


@router.delete(
    "/me",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Xóa tài khoản hiện tại",
    description="Xóa vĩnh viễn tài khoản của người dùng đang đăng nhập.",
)
def delete_my_account(
    current_user: UserEntity = Depends(get_current_user),
):
    service = UserService()
    service.delete_user(current_user.id)


@router.delete(
    "/{user_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Xóa người dùng (Admin)",
    description="Chỉ dành cho quản trị viên.",
)
def delete_user_by_admin(
    user_id: str,
    current_user: UserEntity = Depends(require_admin),
):
    service = UserService()
    service.delete_user(user_id)



@router.put(
    "/{user_id}/lock",
    response_model=UserResponse,
    summary="Khóa / Mở khóa tài khoản người dùng (Admin)",
    description="Chỉ dành cho quản trị viên.",
)
def toggle_user_lock(
    user_id: str,
    payload: ToggleLockRequest,
    current_user: UserEntity = Depends(require_admin),
):
    service = UserService()
    return _to_response(service.toggle_lock(user_id, payload.is_locked))


