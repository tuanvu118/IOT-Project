from datetime import datetime, timezone
from typing import List, Optional
from fastapi import HTTPException, status

from app.core.firebase import get_firestore_client
from app.entity.device_event import DeviceEventEntity
from app.dto.device_event_dto import CreateDeviceEventRequest, ResolveDeviceEventRequest


class DeviceEventService:
    """
    Service xử lý nghiệp vụ sự kiện nghiệp vụ (tai nạn, mất trộm, SOS).
    Tương tác với Firestore collection: device_events/{id}
    """

    def __init__(self):
        self.db = get_firestore_client()
        self.collection = self.db.collection("device_events")

    # ─── Helper ───────────────────────────────────────────────────────────────

    def _doc_to_entity(self, doc_id: str, data: dict) -> DeviceEventEntity:
        return DeviceEventEntity(id=doc_id, **data)

    # ─── Public Methods ───────────────────────────────────────────────────────

    def create_event(self, payload: CreateDeviceEventRequest) -> DeviceEventEntity:
        """
        Tạo sự kiện mới (tai nạn / mất trộm / SOS) từ thiết bị IoT.
        Sau khi tạo, nên trigger notification cho User liên kết với Device.
        """
        valid_event_types = {"ACCIDENT", "THEFT", "SOS"}
        if payload.event_type not in valid_event_types:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"event_type không hợp lệ. Chấp nhận: {', '.join(valid_event_types)}",
            )

        data = {
            "device_id": payload.device_id,
            "event_type": payload.event_type,
            "status": "ACTIVE",
            "latitude": payload.latitude,
            "longitude": payload.longitude,
            "detected_at": payload.detected_at,
            "resolved_at": None,
        }

        _, doc_ref = self.collection.add(data)
        return self._doc_to_entity(doc_ref.id, data)

    def get_by_id(self, event_id: str) -> DeviceEventEntity:
        """Lấy sự kiện theo ID."""
        doc = self.collection.document(event_id).get()
        if not doc.exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Không tìm thấy sự kiện.",
            )
        return self._doc_to_entity(event_id, doc.to_dict())

    def get_events_by_device(
        self,
        device_id: str,
        event_type: Optional[str] = None,
        event_status: Optional[str] = None,
        limit: int = 50,
    ) -> List[DeviceEventEntity]:
        """Lấy lịch sử sự kiện của Device."""
        query = (
            self.collection
            .where("device_id", "==", device_id)
            .order_by("detected_at", direction="DESCENDING")
        )

        if event_type:
            query = query.where("event_type", "==", event_type)
        if event_status:
            query = query.where("status", "==", event_status)

        query = query.limit(limit)
        docs = query.get()

        return [self._doc_to_entity(doc.id, doc.to_dict()) for doc in docs]

    def get_events_by_user(self, user_id: str, limit: int = 50) -> List[DeviceEventEntity]:
        """
        Lấy lịch sử sự kiện của tất cả Device mà User đang liên kết.
        """
        # Lấy danh sách device_id của user
        user_devices_ref = self.db.collection("user_devices")
        links = (
            user_devices_ref
            .where("user_id", "==", user_id)
            .where("unlinked_at", "==", None)
            .get()
        )

        device_ids = [link.to_dict().get("device_id") for link in links]
        if not device_ids:
            return []

        # Firestore không hỗ trợ IN query với > 10 items, nhưng MVP chỉ có 1 device
        # Nếu nhiều devices, cần query từng cái hoặc dùng Firebase Composite query
        all_events = []
        for device_id in device_ids:
            events = self.get_events_by_device(device_id, limit=limit)
            all_events.extend(events)

        # Sắp xếp lại theo detected_at giảm dần
        all_events.sort(key=lambda e: e.detected_at, reverse=True)
        return all_events[:limit]

    def resolve_event(self, event_id: str, payload: ResolveDeviceEventRequest) -> DeviceEventEntity:
        """Đánh dấu sự kiện đã được xử lý/giải quyết."""
        doc_ref = self.collection.document(event_id)
        doc = doc_ref.get()
        if not doc.exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Không tìm thấy sự kiện.",
            )

        event_data = doc.to_dict()
        if event_data.get("status") == "RESOLVED":
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Sự kiện đã được xử lý trước đó.",
            )

        resolved_at = payload.resolved_at or datetime.now(timezone.utc)
        doc_ref.update({
            "status": "RESOLVED",
            "resolved_at": resolved_at,
        })

        updated_doc = doc_ref.get()
        return self._doc_to_entity(event_id, updated_doc.to_dict())
