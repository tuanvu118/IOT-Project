from typing import List, Optional
from pydantic import BaseModel


class UserEntity(BaseModel):
    """
    Đại diện cho document trong Firestore collection: users/{uid}
    Document ID = Firebase Auth UID

    NoSQL schema:
      - sosNumbers[]: danh sách SĐT SOS embedded trực tiếp
      - fcmTokens[]: FCM push tokens embedded
      - lastSignIn: lần đăng nhập cuối
    """
    id: str  # Firebase UID

    name: str
    phone_number: str
    avatar_url: Optional[str] = None
    address: Optional[str] = None
    date_of_birth: Optional[str] = None       # Lưu dạng string (ISO date)
    citizen_number: Optional[str] = None
    sos_numbers: List[str] = []               # Danh sách SĐT SOS (embedded)
    fcm_tokens: List[str] = []                # FCM push tokens (embedded)
    last_sign_in: Optional[str] = None        # Lần đăng nhập cuối (ISO string)

    class Config:
        from_attributes = True
