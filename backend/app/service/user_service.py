from typing import List, Optional
from fastapi import HTTPException, status
from google.cloud.firestore_v1 import ArrayUnion, ArrayRemove

from app.core.firebase import get_firestore_client
from app.entity.user import UserEntity
from app.dto.user_dto import RegisterUserRequest, UpdateUserRequest


# Mapping Firestore camelCase → Python snake_case
def _doc_to_entity(doc_id: str, data: dict) -> UserEntity:
    return UserEntity(
        id=doc_id,
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


class UserService:
    """
    Service xử lý nghiệp vụ liên quan đến User.
    Tương tác với Firestore collection: users/{uid}

    Firestore document dùng camelCase:
      phoneNumber, avatarUrl, dateOfBirth, citizenNumber,
      sosNumbers[], fcmTokens[], lastSignIn
    """

    def __init__(self):
        self.db = get_firestore_client()
        self.collection = self.db.collection("users")

    # ─── Public Methods ───────────────────────────────────────────────────────

    def register(self, uid: str, payload: RegisterUserRequest) -> UserEntity:
        """
        Tạo document user mới trong Firestore sau khi Firebase Auth đã tạo account.
        Kiểm tra phoneNumber không trùng.
        """
        existing = self.collection.where("phoneNumber", "==", payload.phone_number).limit(1).get()
        if list(existing):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Số điện thoại đã được sử dụng bởi tài khoản khác.",
            )

        data = {
            "name": payload.name,
            "phoneNumber": payload.phone_number,
            "avatarUrl": payload.avatar_url,
            "address": payload.address,
            "dateOfBirth": payload.date_of_birth,
            "citizenNumber": payload.citizen_number,
            "sosNumbers": [],
            "fcmTokens": [],
            "lastSignIn": None,
        }

        self.collection.document(uid).set(data)
        return _doc_to_entity(uid, data)

    def get_by_id(self, uid: str) -> UserEntity:
        """Lấy thông tin User theo Firebase UID."""
        doc = self.collection.document(uid).get()
        if not doc.exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Không tìm thấy người dùng.",
            )
        return _doc_to_entity(uid, doc.to_dict())

    def update(self, uid: str, payload: UpdateUserRequest) -> UserEntity:
        """Cập nhật thông tin cá nhân của User (partial update)."""
        doc_ref = self.collection.document(uid)
        if not doc_ref.get().exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Không tìm thấy người dùng.",
            )

        update_data: dict = {}
        if payload.name is not None:
            update_data["name"] = payload.name
        if payload.avatar_url is not None:
            update_data["avatarUrl"] = payload.avatar_url
        if payload.address is not None:
            update_data["address"] = payload.address
        if payload.date_of_birth is not None:
            update_data["dateOfBirth"] = payload.date_of_birth
        if payload.citizen_number is not None:
            update_data["citizenNumber"] = payload.citizen_number

        if update_data:
            doc_ref.update(update_data)

        return _doc_to_entity(uid, doc_ref.get().to_dict())

    def add_sos_number(self, uid: str, phone_number: str) -> UserEntity:
        """Thêm SĐT vào danh sách sosNumbers[] (không trùng lặp)."""
        doc_ref = self.collection.document(uid)
        if not doc_ref.get().exists:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy người dùng.")
        doc_ref.update({"sosNumbers": ArrayUnion([phone_number])})
        return _doc_to_entity(uid, doc_ref.get().to_dict())

    def remove_sos_number(self, uid: str, phone_number: str) -> UserEntity:
        """Xóa SĐT khỏi danh sách sosNumbers[]."""
        doc_ref = self.collection.document(uid)
        if not doc_ref.get().exists:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy người dùng.")
        doc_ref.update({"sosNumbers": ArrayRemove([phone_number])})
        return _doc_to_entity(uid, doc_ref.get().to_dict())

    def register_fcm_token(self, uid: str, token: str) -> None:
        """Thêm FCM token vào fcmTokens[] (dùng khi user login trên thiết bị mới)."""
        doc_ref = self.collection.document(uid)
        if not doc_ref.get().exists:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy người dùng.")
        doc_ref.update({"fcmTokens": ArrayUnion([token])})

    def unregister_fcm_token(self, uid: str, token: str) -> None:
        """Xóa FCM token khỏi fcmTokens[] (dùng khi user logout)."""
        doc_ref = self.collection.document(uid)
        if not doc_ref.get().exists:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy người dùng.")
        doc_ref.update({"fcmTokens": ArrayRemove([token])})

    def update_last_sign_in(self, uid: str, sign_in_time: str) -> None:
        """Cập nhật lastSignIn sau khi user đăng nhập thành công."""
        self.collection.document(uid).update({"lastSignIn": sign_in_time})

    def get_sos_numbers(self, uid: str) -> List[str]:
        """Lấy danh sách SĐT SOS của User."""
        doc = self.collection.document(uid).get()
        if not doc.exists:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy người dùng.")
        return doc.to_dict().get("sosNumbers", [])

