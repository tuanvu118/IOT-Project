from datetime import datetime, timezone
from typing import List, Optional
from fastapi import HTTPException, status

from app.core.firebase import get_firestore_client
from app.entity.user_device import UserDeviceEntity
from app.dto.user_device_dto import LinkDeviceRequest


class UserDeviceService:
    """
    Service xử lý nghiệp vụ liên kết/huỷ liên kết User - Device.
    Tương tác với Firestore collection: user_devices/{id}

    Ràng buộc quan trọng:
    - Tại một thời điểm chỉ được phép có MỘT bản ghi active (unlinked_at IS NULL) cho mỗi Device.
    """

    def __init__(self):
        self.db = get_firestore_client()
        self.collection = self.db.collection("user_devices")
        self.devices_collection = self.db.collection("devices")

    # ─── Helper ───────────────────────────────────────────────────────────────

    def _doc_to_entity(self, doc_id: str, data: dict) -> UserDeviceEntity:
        return UserDeviceEntity(id=doc_id, **data)

    def _get_active_link(self, device_id: str) -> Optional[UserDeviceEntity]:
        """Lấy bản ghi liên kết đang active của Device (nếu có)."""
        docs = (
            self.collection
            .where("device_id", "==", device_id)
            .where("unlinked_at", "==", None)
            .limit(1)
            .get()
        )
        docs_list = list(docs)
        if not docs_list:
            return None
        doc = docs_list[0]
        return self._doc_to_entity(doc.id, doc.to_dict())

    # ─── Public Methods ───────────────────────────────────────────────────────

    def link_device(self, user_id: str, payload: LinkDeviceRequest) -> UserDeviceEntity:
        """
        Liên kết Device với User hiện tại bằng device_code + verification_code.
        - Kiểm tra Device tồn tại và verification_code hợp lệ.
        - Kiểm tra Device chưa có ai đang liên kết (active link).
        """
        # Tìm Device theo device_code
        device_docs = (
            self.devices_collection
            .where("device_code", "==", payload.device_code)
            .limit(1)
            .get()
        )
        device_docs_list = list(device_docs)
        if not device_docs_list:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Không tìm thấy thiết bị với mã này.",
            )

        device_doc = device_docs_list[0]
        device_data = device_doc.to_dict()

        # Kiểm tra verification_code
        if device_data.get("verification_code") != payload.verification_code:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Mã xác thực thiết bị không đúng.",
            )

        device_id = device_doc.id

        # Kiểm tra ràng buộc: chỉ 1 active link per device
        active_link = self._get_active_link(device_id)
        if active_link:
            if active_link.user_id == user_id:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Bạn đã liên kết với thiết bị này rồi.",
                )
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Thiết bị này đang được sử dụng bởi tài khoản khác.",
            )

        now = datetime.now(timezone.utc)
        data = {
            "user_id": user_id,
            "device_id": device_id,
            "linked_at": now,
            "unlinked_at": None,
        }

        _, doc_ref = self.collection.add(data)
        return self._doc_to_entity(doc_ref.id, data)

    def unlink_device(self, user_id: str, device_id: str) -> UserDeviceEntity:
        """Huỷ liên kết Device của User hiện tại."""
        active_link = self._get_active_link(device_id)

        if not active_link:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Thiết bị không có liên kết đang active.",
            )

        if active_link.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Bạn không có quyền huỷ liên kết thiết bị này.",
            )

        now = datetime.now(timezone.utc)
        self.collection.document(active_link.id).update({"unlinked_at": now})
        active_link.unlinked_at = now
        return active_link

    def get_user_links(self, user_id: str) -> List[UserDeviceEntity]:
        """Lấy toàn bộ lịch sử liên kết của User."""
        docs = self.collection.where("user_id", "==", user_id).order_by("linked_at").get()
        return [self._doc_to_entity(doc.id, doc.to_dict()) for doc in docs]

    def get_active_link_for_device(self, device_id: str) -> Optional[UserDeviceEntity]:
        """Lấy liên kết đang active của Device."""
        return self._get_active_link(device_id)
