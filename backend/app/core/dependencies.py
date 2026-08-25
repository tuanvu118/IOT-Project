from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from firebase_admin import auth
from app.core.firebase import get_firestore_client
from app.entity.user import UserEntity

http_bearer = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(http_bearer),
) -> UserEntity:
    """
    Dependency: Xác thực Firebase ID Token từ header Authorization.
    Trả về UserEntity của người dùng hiện tại.
    """
    token = credentials.credentials
    try:
        decoded_token = auth.verify_id_token(token)
    except auth.ExpiredIdTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token đã hết hạn.",
        )
    except auth.InvalidIdTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token không hợp lệ.",
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Không thể xác thực token.",
        )

    uid = decoded_token.get("uid")
    if not uid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token không chứa uid.",
        )

    db = get_firestore_client()
    user_doc = db.collection("users").document(uid).get()

    if not user_doc.exists:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Người dùng không tồn tại trong hệ thống. Vui lòng đăng ký trước.",
        )

    data = user_doc.to_dict()
    return UserEntity(
        id=uid,
        name=data.get("name", ""),
        phone_number=data.get("phoneNumber", ""),
        avatar_url=data.get("avatarUrl"),
        address=data.get("address"),
        date_of_birth=data.get("dateOfBirth"),
        citizen_number=data.get("citizenNumber"),
        sos_numbers=data.get("sosNumbers", []),
        fcm_tokens=data.get("fcmTokens", []),
        last_sign_in=data.get("lastSignIn"),
    )

