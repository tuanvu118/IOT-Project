from datetime import datetime, timezone
from typing import List, Optional
from fastapi import HTTPException, status

from app.core.firebase import get_firestore_client
from app.entity.device_location import DeviceLocationEntity
from app.dto.device_location_dto import CreateDeviceLocationRequest


class DeviceLocationService:
    """
    Service xử lý nghiệp vụ lưu trữ và truy vấn lịch sử vị trí GPS.
    Tương tác với Firestore collection: device_locations/{id}
    """

    def __init__(self):
        self.db = get_firestore_client()
        self.collection = self.db.collection("device_locations")

    # ─── Helper ───────────────────────────────────────────────────────────────

    def _doc_to_entity(self, doc_id: str, data: dict) -> DeviceLocationEntity:
        return DeviceLocationEntity(id=doc_id, **data)

    # ─── Public Methods ───────────────────────────────────────────────────────

    def record_location(self, payload: CreateDeviceLocationRequest) -> DeviceLocationEntity:
        """Ghi nhận vị trí GPS mới từ thiết bị IoT."""
        data = {
            "device_id": payload.device_id,
            "latitude": payload.latitude,
            "longitude": payload.longitude,
            "accuracy": payload.accuracy,
            "speed": payload.speed,
            "battery_level": payload.battery_level,
            "recorded_at": payload.recorded_at,
        }

        _, doc_ref = self.collection.add(data)
        return self._doc_to_entity(doc_ref.id, data)

    def get_latest_location(self, device_id: str) -> DeviceLocationEntity:
        """Lấy vị trí mới nhất của Device."""
        docs = (
            self.collection
            .where("device_id", "==", device_id)
            .order_by("recorded_at", direction="DESCENDING")
            .limit(1)
            .get()
        )
        docs_list = list(docs)
        if not docs_list:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Chưa có dữ liệu vị trí cho thiết bị này.",
            )
        doc = docs_list[0]
        return self._doc_to_entity(doc.id, doc.to_dict())

    def get_location_history(
        self,
        device_id: str,
        limit: int = 100,
        start_time: Optional[datetime] = None,
        end_time: Optional[datetime] = None,
    ) -> List[DeviceLocationEntity]:
        """
        Lấy lịch sử vị trí của Device theo thời gian.
        Kết quả sắp xếp theo recorded_at giảm dần (mới nhất trước).
        """
        query = (
            self.collection
            .where("device_id", "==", device_id)
            .order_by("recorded_at", direction="DESCENDING")
        )

        if start_time:
            query = query.where("recorded_at", ">=", start_time)
        if end_time:
            query = query.where("recorded_at", "<=", end_time)

        query = query.limit(limit)
        docs = query.get()

        return [self._doc_to_entity(doc.id, doc.to_dict()) for doc in docs]
