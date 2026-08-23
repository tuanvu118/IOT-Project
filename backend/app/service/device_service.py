from datetime import datetime, timezone
from typing import List, Optional
from fastapi import HTTPException, status

from app.core.firebase import get_firestore_client
from app.entity.device import DeviceEntity
from app.dto.device_dto import CreateDeviceRequest, UpdateDeviceStatusRequest


class DeviceService:
    """
    Service xử lý nghiệp vụ liên quan đến Device.
    Tương tác trực tiếp với Firestore collection: devices/{id}
    """

    def __init__(self):
        self.db = get_firestore_client()
        self.collection = self.db.collection("devices")

    # ─── Helper ───────────────────────────────────────────────────────────────

    def _doc_to_entity(self, doc_id: str, data: dict) -> DeviceEntity:
        return DeviceEntity(id=doc_id, **data)

    # ─── Public Methods ───────────────────────────────────────────────────────

    def create(self, payload: CreateDeviceRequest) -> DeviceEntity:
        """
        Tạo Device mới trong hệ thống.
        Kiểm tra device_code và verification_code phải UNIQUE.
        """
        # Kiểm tra device_code
        existing_code = self.collection.where("device_code", "==", payload.device_code).limit(1).get()
        if list(existing_code):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="device_code đã tồn tại trong hệ thống.",
            )

        # Kiểm tra verification_code
        existing_vc = self.collection.where("verification_code", "==", payload.verification_code).limit(1).get()
        if list(existing_vc):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="verification_code đã tồn tại trong hệ thống.",
            )

        now = datetime.now(timezone.utc)
        data = {
            "device_code": payload.device_code,
            "verification_code": payload.verification_code,
            "status": "OFFLINE",
            "anti_theft_enabled": payload.anti_theft_enabled,
            "battery_level": None,
            "is_charging": payload.is_charging,
            "last_connected_at": None,
            "created_at": now,
            "updated_at": now,
        }

        _, doc_ref = self.collection.add(data)
        return self._doc_to_entity(doc_ref.id, data)

    def get_by_id(self, device_id: str) -> DeviceEntity:
        """Lấy thông tin Device theo ID."""
        doc = self.collection.document(device_id).get()
        if not doc.exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Không tìm thấy thiết bị.",
            )
        return self._doc_to_entity(device_id, doc.to_dict())

    def get_by_device_code(self, device_code: str) -> DeviceEntity:
        """Lấy Device theo device_code."""
        docs = self.collection.where("device_code", "==", device_code).limit(1).get()
        docs_list = list(docs)
        if not docs_list:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Không tìm thấy thiết bị với device_code này.",
            )
        doc = docs_list[0]
        return self._doc_to_entity(doc.id, doc.to_dict())

    def get_devices_by_user(self, user_id: str) -> List[DeviceEntity]:
        """Lấy danh sách Device đang active của User (thông qua user_devices)."""
        # Query user_devices để tìm device_id của user
        user_devices_ref = self.db.collection("user_devices")
        links = user_devices_ref.where("user_id", "==", user_id).where("unlinked_at", "==", None).get()

        devices = []
        for link in links:
            link_data = link.to_dict()
            device_id = link_data.get("device_id")
            try:
                device = self.get_by_id(device_id)
                devices.append(device)
            except HTTPException:
                pass  # Skip nếu device không tồn tại

        return devices

    def update_status(self, device_id: str, payload: UpdateDeviceStatusRequest) -> DeviceEntity:
        """Cập nhật trạng thái Device từ thiết bị IoT."""
        doc_ref = self.collection.document(device_id)
        doc = doc_ref.get()
        if not doc.exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Không tìm thấy thiết bị.",
            )

        update_data: dict = {
            "updated_at": datetime.now(timezone.utc),
            "last_connected_at": datetime.now(timezone.utc),
        }

        if payload.status is not None:
            update_data["status"] = payload.status
        if payload.anti_theft_enabled is not None:
            update_data["anti_theft_enabled"] = payload.anti_theft_enabled
        if payload.battery_level is not None:
            update_data["battery_level"] = payload.battery_level
        if payload.is_charging is not None:
            update_data["is_charging"] = payload.is_charging

        doc_ref.update(update_data)
        updated_doc = doc_ref.get()
        return self._doc_to_entity(device_id, updated_doc.to_dict())
