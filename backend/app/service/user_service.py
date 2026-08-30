from datetime import datetime, timezone
from typing import List
from uuid import uuid4

from fastapi import HTTPException, status
from google.cloud.firestore_v1 import ArrayRemove, ArrayUnion

from app.core.firebase import get_firestore_client
from app.core.security import hash_password, verify_password
from app.dto.user_dto import LoginRequest, RegisterUserRequest, UpdateUserRequest
from app.entity.user import UserEntity


def _doc_to_entity(doc_id: str, data: dict) -> UserEntity:
    return UserEntity(
        id=doc_id,
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


class UserService:
    def __init__(self):
        self.db = get_firestore_client()
        self.collection = self.db.collection("users")

    def register(self, payload: RegisterUserRequest) -> UserEntity:
        existing_email = self.collection.where("email", "==", payload.email).limit(1).get()
        if list(existing_email):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email đã được sử dụng bởi tài khoản khác.",
            )

        existing_phone = self.collection.where("phoneNumber", "==", payload.phone_number).limit(1).get()
        if list(existing_phone):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Số điện thoại đã được sử dụng bởi tài khoản khác.",
            )

        uid = str(uuid4())
        data = {
            "email": payload.email,
            "name": payload.name,
            "phoneNumber": payload.phone_number,
            "passwordHash": hash_password(payload.password),
            "avatarUrl": payload.avatar_url,
            "address": payload.address,
            "dateOfBirth": payload.date_of_birth,
            "citizenNumber": payload.citizen_number,
            "isAdmin": False,
            "sosNumbers": [],
            "fcmTokens": [],
            "lastSignIn": None,
        }

        self.collection.document(uid).set(data)
        return _doc_to_entity(uid, data)

    def login(self, payload: LoginRequest) -> UserEntity:
        docs = list(self.collection.where("email", "==", payload.email).limit(1).get())
        if not docs:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Email hoặc mật khẩu không đúng.",
            )

        doc = docs[0]
        data = doc.to_dict()
        if not verify_password(payload.password, data.get("passwordHash", "")):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Email hoặc mật khẩu không đúng.",
            )

        sign_in_time = datetime.now(timezone.utc).isoformat()
        self.update_last_sign_in(doc.id, sign_in_time)
        data["lastSignIn"] = sign_in_time
        return _doc_to_entity(doc.id, data)

    def get_by_id(self, uid: str) -> UserEntity:
        doc = self.collection.document(uid).get()
        if not doc.exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Không tìm thấy người dùng.",
            )
        return _doc_to_entity(uid, doc.to_dict())

    def update(self, uid: str, payload: UpdateUserRequest) -> UserEntity:
        doc_ref = self.collection.document(uid)
        if not doc_ref.get().exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Không tìm thấy người dùng.",
            )

        update_data: dict = {}
        if payload.name is not None:
            update_data["name"] = payload.name
        if payload.phone_number is not None:
            existing_phone = self.collection.where("phoneNumber", "==", payload.phone_number).limit(1).get()
            for phone_doc in existing_phone:
                if phone_doc.id != uid:
                    raise HTTPException(
                        status_code=status.HTTP_409_CONFLICT,
                        detail="Số điện thoại đã được sử dụng bởi tài khoản khác.",
                    )
            update_data["phoneNumber"] = payload.phone_number
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

    def change_password(self, uid: str, current_password: str, new_password: str) -> None:
        doc_ref = self.collection.document(uid)
        doc = doc_ref.get()
        if not doc.exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Không tìm thấy người dùng.",
            )

        data = doc.to_dict()
        if not verify_password(current_password, data.get("passwordHash", "")):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Mật khẩu hiện tại không chính xác.",
            )

        doc_ref.update({"passwordHash": hash_password(new_password)})

    def add_sos_number(self, uid: str, phone_number: str) -> UserEntity:
        doc_ref = self.collection.document(uid)
        if not doc_ref.get().exists:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy người dùng.")
        doc_ref.update({"sosNumbers": ArrayUnion([phone_number])})
        return _doc_to_entity(uid, doc_ref.get().to_dict())

    def remove_sos_number(self, uid: str, phone_number: str) -> UserEntity:
        doc_ref = self.collection.document(uid)
        if not doc_ref.get().exists:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy người dùng.")
        doc_ref.update({"sosNumbers": ArrayRemove([phone_number])})
        return _doc_to_entity(uid, doc_ref.get().to_dict())

    def register_fcm_token(self, uid: str, token: str) -> None:
        doc_ref = self.collection.document(uid)
        if not doc_ref.get().exists:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy người dùng.")
        doc_ref.update({"fcmTokens": ArrayUnion([token])})

    def unregister_fcm_token(self, uid: str, token: str) -> None:
        doc_ref = self.collection.document(uid)
        if not doc_ref.get().exists:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy người dùng.")
        doc_ref.update({"fcmTokens": ArrayRemove([token])})

    def update_last_sign_in(self, uid: str, sign_in_time: str) -> None:
        self.collection.document(uid).update({"lastSignIn": sign_in_time})

    def get_sos_numbers(self, uid: str) -> List[str]:
        doc = self.collection.document(uid).get()
        if not doc.exists:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy người dùng.")
        return doc.to_dict().get("sosNumbers", [])
