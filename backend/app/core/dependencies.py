from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.firebase import get_firestore_client
from app.core.security import decode_access_token
from app.entity.user import UserEntity

http_bearer = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(http_bearer),
) -> UserEntity:
    token = credentials.credentials
    decoded_token = decode_access_token(token)

    uid = decoded_token.get("sub")
    if not uid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token không chứa user id.",
        )

    db = get_firestore_client()
    user_doc = db.collection("users").document(uid).get()

    if not user_doc.exists:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Người dùng không tồn tại trong hệ thống.",
        )

    data = user_doc.to_dict()
    return UserEntity(
        id=uid,
        email=data.get("email", ""),
        name=data.get("name", ""),
        phone_number=data.get("phoneNumber", ""),
        password_hash=data.get("passwordHash"),
        avatar_url=data.get("avatarUrl"),
        address=data.get("address"),
        date_of_birth=data.get("dateOfBirth"),
        citizen_number=data.get("citizenNumber"),
        is_admin=data.get("isAdmin", False),
        sos_numbers=data.get("sosNumbers", []),
        fcm_tokens=data.get("fcmTokens", []),
        last_sign_in=data.get("lastSignIn"),
    )


def require_admin(current_user: UserEntity = Depends(get_current_user)) -> UserEntity:
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Chỉ admin mới được thực hiện thao tác này.",
        )

    return current_user
