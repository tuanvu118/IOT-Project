from datetime import datetime, timezone
from typing import List
from fastapi import HTTPException, status

from app.core.firebase import get_firestore_client
from app.entity.emergency_contact import EmergencyContactEntity
from app.dto.emergency_contact_dto import CreateEmergencyContactRequest, UpdateEmergencyContactRequest


class EmergencyContactService:
    """
    Service xử lý nghiệp vụ danh sách số liên hệ SOS của User.
    Tương tác với Firestore collection: emergency_contacts/{id}
    """

    def __init__(self):
        self.db = get_firestore_client()
        self.collection = self.db.collection("emergency_contacts")

    # ─── Helper ───────────────────────────────────────────────────────────────

    def _doc_to_entity(self, doc_id: str, data: dict) -> EmergencyContactEntity:
        return EmergencyContactEntity(id=doc_id, **data)

    # ─── Public Methods ───────────────────────────────────────────────────────

    def create(self, user_id: str, payload: CreateEmergencyContactRequest) -> EmergencyContactEntity:
        """Tạo số liên hệ khẩn cấp mới cho User."""
        now = datetime.now(timezone.utc)
        data = {
            "user_id": user_id,
            "name": payload.name,
            "phone_number": payload.phone_number,
            "relationship": payload.relationship,
            "priority": payload.priority,
            "is_active": True,
            "created_at": now,
            "updated_at": now,
        }

        _, doc_ref = self.collection.add(data)
        return self._doc_to_entity(doc_ref.id, data)

    def get_by_id(self, contact_id: str, user_id: str) -> EmergencyContactEntity:
        """Lấy contact theo ID, kiểm tra ownership."""
        doc = self.collection.document(contact_id).get()
        if not doc.exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Không tìm thấy số liên hệ khẩn cấp.",
            )

        data = doc.to_dict()
        if data.get("user_id") != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Bạn không có quyền truy cập số liên hệ này.",
            )

        return self._doc_to_entity(contact_id, data)

    def get_user_contacts(self, user_id: str, active_only: bool = True) -> List[EmergencyContactEntity]:
        """
        Lấy danh sách số liên hệ khẩn cấp của User.
        Sắp xếp theo priority tăng dần (ưu tiên cao hơn trước).
        """
        query = self.collection.where("user_id", "==", user_id)

        if active_only:
            query = query.where("is_active", "==", True)

        docs = query.order_by("priority").get()
        return [self._doc_to_entity(doc.id, doc.to_dict()) for doc in docs]

    def update(self, contact_id: str, user_id: str, payload: UpdateEmergencyContactRequest) -> EmergencyContactEntity:
        """Cập nhật thông tin số liên hệ khẩn cấp."""
        doc_ref = self.collection.document(contact_id)
        doc = doc_ref.get()

        if not doc.exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Không tìm thấy số liên hệ khẩn cấp.",
            )

        data = doc.to_dict()
        if data.get("user_id") != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Bạn không có quyền chỉnh sửa số liên hệ này.",
            )

        update_data: dict = {"updated_at": datetime.now(timezone.utc)}

        if payload.name is not None:
            update_data["name"] = payload.name
        if payload.phone_number is not None:
            update_data["phone_number"] = payload.phone_number
        if payload.relationship is not None:
            update_data["relationship"] = payload.relationship
        if payload.priority is not None:
            update_data["priority"] = payload.priority
        if payload.is_active is not None:
            update_data["is_active"] = payload.is_active

        doc_ref.update(update_data)
        updated_doc = doc_ref.get()
        return self._doc_to_entity(contact_id, updated_doc.to_dict())

    def delete(self, contact_id: str, user_id: str) -> None:
        """Xoá số liên hệ khẩn cấp."""
        doc = self.collection.document(contact_id).get()
        if not doc.exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Không tìm thấy số liên hệ khẩn cấp.",
            )

        if doc.to_dict().get("user_id") != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Bạn không có quyền xoá số liên hệ này.",
            )

        self.collection.document(contact_id).delete()

    def get_active_contacts_for_sos(self, user_id: str) -> List[EmergencyContactEntity]:
        """
        Lấy danh sách số SOS active của User, sắp xếp theo priority.
        Dùng khi cần gửi cảnh báo tai nạn.
        """
        return self.get_user_contacts(user_id, active_only=True)
