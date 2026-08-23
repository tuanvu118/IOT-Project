from fastapi import APIRouter, Depends, status
from firebase_admin import auth as firebase_auth
from fastapi import HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.core.firebase import get_firestore_client
from app.service.user_service import UserService
from app.dto.user_dto import RegisterUserRequest, UserResponse

router = APIRouter(prefix="/auth", tags=["Auth"])
http_bearer = HTTPBearer()


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Đăng ký tài khoản mới",
    description=(
        "Tạo document User trong Firestore sau khi Firebase Auth đã tạo account. "
        "Gửi kèm Firebase ID Token trong header Authorization."
    ),
)
def register(
    payload: RegisterUserRequest,
    credentials: HTTPAuthorizationCredentials = Depends(http_bearer),
):
    """
    Luồng đăng ký:
    1. Client tạo account trên Firebase Auth (email/phone).
    2. Client nhận Firebase ID Token.
    3. Client gọi API này với ID Token + thông tin bổ sung.
    4. Backend verify token → lấy UID → tạo document trong Firestore.
    """
    token = credentials.credentials
    try:
        decoded_token = firebase_auth.verify_id_token(token)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token không hợp lệ hoặc đã hết hạn.",
        )

    uid = decoded_token.get("uid")

    # Kiểm tra user đã tồn tại chưa
    db = get_firestore_client()
    user_doc = db.collection("users").document(uid).get()
    if user_doc.exists:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Tài khoản đã được đăng ký trong hệ thống.",
        )

    service = UserService()
    user = service.register(uid, payload)

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


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Lấy thông tin tài khoản hiện tại",
    description="Trả về thông tin User tương ứng với Firebase ID Token trong header.",
)
def get_me(
    credentials: HTTPAuthorizationCredentials = Depends(http_bearer),
):
    token = credentials.credentials
    try:
        decoded_token = firebase_auth.verify_id_token(token)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token không hợp lệ hoặc đã hết hạn.",
        )

    uid = decoded_token.get("uid")
    service = UserService()
    user = service.get_by_id(uid)

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
