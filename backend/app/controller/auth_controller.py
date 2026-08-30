from fastapi import APIRouter, Depends, status

from app.core.config import settings
from app.core.dependencies import get_current_user
from app.core.security import create_access_token
from app.dto.user_dto import AuthResponse, ChangePasswordRequest, LoginRequest, RegisterUserRequest, UserResponse
from app.entity.user import UserEntity
from app.service.user_service import UserService

router = APIRouter(prefix="/auth", tags=["Auth"])


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


def _to_auth_response(user: UserEntity) -> AuthResponse:
    access_token = create_access_token(
        subject=user.id,
        extra_claims={
            "email": user.email,
            "is_admin": user.is_admin,
        },
    )
    return AuthResponse(
        access_token=access_token,
        expires_in=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=_to_response(user),
    )


@router.post(
    "/register",
    response_model=AuthResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Đăng ký tài khoản mới",
    description="Tạo user trong Firestore, hash mật khẩu, và trả về JWT. Tài khoản mới mặc định isAdmin=false.",
)
def register(payload: RegisterUserRequest):
    service = UserService()
    user = service.register(payload)
    return _to_auth_response(user)


@router.post(
    "/login",
    response_model=AuthResponse,
    summary="Đăng nhập",
    description="Kiểm tra email/password và trả về JWT do backend tự ký.",
)
def login(payload: LoginRequest):
    service = UserService()
    user = service.login(payload)
    return _to_auth_response(user)


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Lấy thông tin tài khoản hiện tại",
    description="Trả về user từ JWT trong header Authorization: Bearer <token>.",
)
def get_me(current_user: UserEntity = Depends(get_current_user)):
    return _to_response(current_user)


@router.post(
    "/change-password",
    status_code=status.HTTP_200_OK,
    summary="Đổi mật khẩu",
    description="Đổi mật khẩu cho người dùng hiện tại.",
)
def change_password(
    payload: ChangePasswordRequest,
    current_user: UserEntity = Depends(get_current_user),
):
    service = UserService()
    service.change_password(current_user.id, payload.current_password, payload.new_password)
    return {"message": "Đổi mật khẩu thành công."}
