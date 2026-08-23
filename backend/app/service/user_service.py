from datetime import datetime, timezone
from typing import Optional
from fastapi import HTTPException, status
from google.cloud import firestore as fs

from app.core.firebase import get_firestore_client
from app.entity.user import UserEntity
from app.dto.user_dto import RegisterUserRequest, UpdateUserRequest


class UserService:
    """
    Service xử lý nghiệp vụ liên quan đến User.
    Tương tác trực tiếp với Firestore collection: users/{uid}
    """

    def __init__(self):
        self.db = get_firestore_client()
        self.collection = self.db.collection("users")

    # ─── Helper ───────────────────────────────────────────────────────────────

    def _doc_to_entity(self, doc_id: str, data: dict) -> UserEntity:
        return UserEntity(id=doc_id, **data)

    # ─── Public Methods ───────────────────────────────────────────────────────

    def register(self, uid: str, payload: RegisterUserRequest) -> UserEntity:
        """
        Tạo document user mới trong Firestore sau khi Firebase Auth đã tạo account.
        Kiểm tra phone_number và citizen_number không trùng.
        """
        # Kiểm tra phone_number đã tồn tại chưa
        existing = self.collection.where("phone_number", "==", payload.phone_number).limit(1).get()
        if list(existing):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Số điện thoại đã được sử dụng bởi tài khoản khác.",
            )

        # Kiểm tra citizen_number nếu có
        if payload.citizen_number:
            existing_cn = self.collection.where("citizen_number", "==", payload.citizen_number).limit(1).get()
            if list(existing_cn):
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Số CCCD/CMND đã được sử dụng bởi tài khoản khác.",
                )

        now = datetime.now(timezone.utc)
        data = {
            "phone_number": payload.phone_number,
            "name": payload.name,
            "avatar_url": payload.avatar_url,
            "address": payload.address,
            "date_of_birth": payload.date_of_birth.isoformat() if payload.date_of_birth else None,
            "citizen_number": payload.citizen_number,
            "status": "ACTIVE",
            "created_at": now,
            "updated_at": now,
        }

        self.collection.document(uid).set(data)
        return self._doc_to_entity(uid, data)

    def get_by_id(self, uid: str) -> UserEntity:
        """Lấy thông tin User theo Firebase UID."""
        doc = self.collection.document(uid).get()
        if not doc.exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Không tìm thấy người dùng.",
            )
        return self._doc_to_entity(uid, doc.to_dict())

    def update(self, uid: str, payload: UpdateUserRequest) -> UserEntity:
        """Cập nhật thông tin cá nhân của User (partial update)."""
        doc_ref = self.collection.document(uid)
        doc = doc_ref.get()
        if not doc.exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Không tìm thấy người dùng.",
            )

        update_data: dict = {"updated_at": datetime.now(timezone.utc)}

        if payload.name is not None:
            update_data["name"] = payload.name
        if payload.avatar_url is not None:
            update_data["avatar_url"] = payload.avatar_url
        if payload.address is not None:
            update_data["address"] = payload.address
        if payload.date_of_birth is not None:
            update_data["date_of_birth"] = payload.date_of_birth.isoformat()
        if payload.citizen_number is not None:
            # Kiểm tra citizen_number không trùng với user khác
            existing_cn = self.collection.where("citizen_number", "==", payload.citizen_number).limit(1).get()
            for doc_snap in existing_cn:
                if doc_snap.id != uid:
                    raise HTTPException(
                        status_code=status.HTTP_409_CONFLICT,
                        detail="Số CCCD/CMND đã được sử dụng bởi tài khoản khác.",
                    )
            update_data["citizen_number"] = payload.citizen_number

        doc_ref.update(update_data)
        updated_doc = doc_ref.get()
        return self._doc_to_entity(uid, updated_doc.to_dict())

    def deactivate(self, uid: str) -> None:
        """Vô hiệu hóa tài khoản User."""
        doc_ref = self.collection.document(uid)
        doc_ref.update({
            "status": "INACTIVE",
            "updated_at": datetime.now(timezone.utc),
        })
