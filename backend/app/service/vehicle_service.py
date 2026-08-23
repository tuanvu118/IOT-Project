from datetime import datetime, timezone
from typing import List, Optional
from fastapi import HTTPException, status

from app.core.firebase import get_firestore_client
from app.entity.vehicle import VehicleEntity
from app.dto.vehicle_dto import CreateVehicleRequest, UpdateVehicleRequest


class VehicleService:
    """
    Service xử lý nghiệp vụ liên quan đến Vehicle.
    Tương tác với Firestore collection: vehicles/{id}
    Ràng buộc: mỗi Device chỉ gắn tối đa một Vehicle (device_id UNIQUE).
    """

    def __init__(self):
        self.db = get_firestore_client()
        self.collection = self.db.collection("vehicles")

    # ─── Helper ───────────────────────────────────────────────────────────────

    def _doc_to_entity(self, doc_id: str, data: dict) -> VehicleEntity:
        return VehicleEntity(id=doc_id, **data)

    # ─── Public Methods ───────────────────────────────────────────────────────

    def create(self, payload: CreateVehicleRequest) -> VehicleEntity:
        """Tạo Vehicle mới gắn với Device."""
        # Kiểm tra device_id chưa có Vehicle nào
        existing = self.collection.where("device_id", "==", payload.device_id).limit(1).get()
        if list(existing):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Thiết bị này đã có thông tin phương tiện. Hãy cập nhật thay vì tạo mới.",
            )

        # Kiểm tra license_plate không trùng nếu có
        if payload.license_plate:
            existing_plate = self.collection.where("license_plate", "==", payload.license_plate).limit(1).get()
            if list(existing_plate):
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Biển số xe đã tồn tại trong hệ thống.",
                )

        now = datetime.now(timezone.utc)
        data = {
            "device_id": payload.device_id,
            "brand": payload.brand,
            "model": payload.model,
            "color": payload.color,
            "license_plate": payload.license_plate,
            "created_at": now,
            "updated_at": now,
        }

        _, doc_ref = self.collection.add(data)
        return self._doc_to_entity(doc_ref.id, data)

    def get_by_id(self, vehicle_id: str) -> VehicleEntity:
        """Lấy Vehicle theo ID."""
        doc = self.collection.document(vehicle_id).get()
        if not doc.exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Không tìm thấy phương tiện.",
            )
        return self._doc_to_entity(vehicle_id, doc.to_dict())

    def get_by_device_id(self, device_id: str) -> VehicleEntity:
        """Lấy Vehicle theo device_id."""
        docs = self.collection.where("device_id", "==", device_id).limit(1).get()
        docs_list = list(docs)
        if not docs_list:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Thiết bị này chưa có thông tin phương tiện.",
            )
        doc = docs_list[0]
        return self._doc_to_entity(doc.id, doc.to_dict())

    def update(self, vehicle_id: str, payload: UpdateVehicleRequest) -> VehicleEntity:
        """Cập nhật thông tin Vehicle."""
        doc_ref = self.collection.document(vehicle_id)
        doc = doc_ref.get()
        if not doc.exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Không tìm thấy phương tiện.",
            )

        update_data: dict = {"updated_at": datetime.now(timezone.utc)}

        if payload.brand is not None:
            update_data["brand"] = payload.brand
        if payload.model is not None:
            update_data["model"] = payload.model
        if payload.color is not None:
            update_data["color"] = payload.color
        if payload.license_plate is not None:
            # Kiểm tra biển số không trùng với xe khác
            existing_plate = self.collection.where("license_plate", "==", payload.license_plate).limit(1).get()
            for plate_doc in existing_plate:
                if plate_doc.id != vehicle_id:
                    raise HTTPException(
                        status_code=status.HTTP_409_CONFLICT,
                        detail="Biển số xe đã tồn tại trong hệ thống.",
                    )
            update_data["license_plate"] = payload.license_plate

        doc_ref.update(update_data)
        updated_doc = doc_ref.get()
        return self._doc_to_entity(vehicle_id, updated_doc.to_dict())

    def delete(self, vehicle_id: str) -> None:
        """Xoá thông tin Vehicle."""
        doc = self.collection.document(vehicle_id).get()
        if not doc.exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Không tìm thấy phương tiện.",
            )
        self.collection.document(vehicle_id).delete()
