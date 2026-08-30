from datetime import datetime, timezone
from typing import List, Optional
from fastapi import HTTPException, status
import uuid

from app.core.firebase import get_firestore_client
from app.entity.device import DeviceEntity, DeviceConfig, DeviceProperties, VehicleInfo, LocationEntry
from app.dto.device_dto import (
    CreateDeviceRequest,
    AddUserDeviceRequest,
    UpdateDeviceConfigRequest,
    UpdateDeviceStatusRequest,
    UpdateVehicleRequest,
    UpdateLocationRequest,
)


# ─── Firestore camelCase ↔ Python snake_case mapping ─────────────────────────

def _parse_config(raw: dict) -> DeviceConfig:
    return DeviceConfig(anti_thief=raw.get("antiThief", False)) if raw else DeviceConfig()


def _parse_properties(raw: dict) -> DeviceProperties:
    if not raw:
        return DeviceProperties()
    return DeviceProperties(
        last_make_call_time=raw.get("lastMakeCallTime"),
        last_send_sms_time=raw.get("lastSendSmsTime"),
        last_push_notification_time=raw.get("lastPushNotificationTime"),
    )


def _parse_vehicle(raw: dict) -> VehicleInfo:
    if not raw:
        return VehicleInfo()
    return VehicleInfo(
        brand=raw.get("brand"),
        color=raw.get("color"),
        license_plate=raw.get("licensePlate"),
        model=raw.get("model"),
    )


def _parse_locations(raw: list) -> List[LocationEntry]:
    if not raw:
        return []
    result = []
    for item in raw:
        result.append(LocationEntry(
            created_at=item.get("createdAt"),
            longitude=item.get("longitude"),
            latitude=item.get("latitude"),
        ))
    return result


def _doc_to_entity(doc_id: str, data: dict) -> DeviceEntity:
    return DeviceEntity(
        id=doc_id,
        name=data.get("name", ""),
        status=data.get("status", 0),
        user_id=data.get("userId"),
        verification_code=data.get("verificationCode", ""),
        config=_parse_config(data.get("config", {})),
        properties=_parse_properties(data.get("properties", {})),
        vehicle=_parse_vehicle(data.get("vehicle", {})),
        locations=_parse_locations(data.get("locations", [])),
    )


class DeviceService:
    """
    Service xử lý nghiệp vụ liên quan đến Device.
    Tương tác với Firestore collection: devices/{id}

    Firestore document dùng camelCase:
      userId, verificationCode, config.antiThief,
      properties.lastMakeCallTime/lastSendSmsTime/lastPushNotificationTime,
      vehicle.brand/color/licensePlate/model,
      locations[].createdAt/longitude/latitude
    """

    def __init__(self):
        self.db = get_firestore_client()
        self.collection = self.db.collection("devices")

    # ─── CRUD ─────────────────────────────────────────────────────────────────

    def create(self, payload: CreateDeviceRequest) -> DeviceEntity:
        """Tạo Device mới. verificationCode phải UNIQUE."""
        existing = self.collection.where("verificationCode", "==", payload.verification_code).limit(1).get()
        if list(existing):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="verificationCode đã tồn tại trong hệ thống.",
            )

        data = {
            "name": payload.name,
            "status": 0,
            "userId": None,
            "verificationCode": payload.verification_code,
            "config": {"antiThief": False},
            "properties": {
                "lastMakeCallTime": None,
                "lastSendSmsTime": None,
                "lastPushNotificationTime": None,
            },
            "vehicle": {
                "brand": None,
                "color": None,
                "licensePlate": None,
                "model": None,
            },
            "locations": [],
        }

        _, doc_ref = self.collection.add(data)
        return _doc_to_entity(doc_ref.id, data)

    def add_device_by_user(self, user_id: str, payload: AddUserDeviceRequest) -> DeviceEntity:
        """
        Người dùng thêm thiết bị vào tài khoản bằng mã thiết bị (verificationCode).
        Hệ thống đối chiếu với cơ sở dữ liệu:
        - Nếu mã không tồn tại: Báo lỗi 404
        - Nếu thiết bị đã được kích hoạt bởi tài khoản khác: Báo lỗi 409
        - Nếu hợp lệ: Liên kết với user_id và cập nhật tên/thông tin phương tiện
        """
        code = (payload.verification_code or "").strip()
        if not code:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Mã thiết bị không được để trống.",
            )

        docs = self.collection.where("verificationCode", "==", code).limit(1).get()
        docs_list = list(docs)
        if not docs_list:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Mã thiết bị không tồn tại trong hệ thống. Vui lòng kiểm tra lại mã in trên thiết bị hoặc liên hệ quản trị viên.",
            )

        doc = docs_list[0]
        data = doc.to_dict()

        current_owner = data.get("userId")
        if current_owner is not None:
            if current_owner == user_id:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Thiết bị này đã được liên kết với tài khoản của bạn trước đó.",
                )
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Thiết bị này đã được kích hoạt / liên kết với một tài khoản khác.",
            )

        update_data = {
            "userId": user_id,
        }

        if payload.name and payload.name.strip():
            update_data["name"] = payload.name.strip()

        vehicle_data = data.get("vehicle", {}) or {}
        has_vehicle_update = False
        if payload.brand is not None:
            vehicle_data["brand"] = payload.brand.strip() or None
            has_vehicle_update = True
        if payload.model is not None:
            vehicle_data["model"] = payload.model.strip() or None
            has_vehicle_update = True
        if payload.color is not None:
            vehicle_data["color"] = payload.color.strip() or None
            has_vehicle_update = True
        if payload.license_plate is not None:
            vehicle_data["licensePlate"] = payload.license_plate.strip() or None
            has_vehicle_update = True

        if has_vehicle_update:
            update_data["vehicle"] = vehicle_data

        self.collection.document(doc.id).update(update_data)
        updated_doc = self.collection.document(doc.id).get()
        return _doc_to_entity(doc.id, updated_doc.to_dict())

    def get_by_id(self, device_id: str) -> DeviceEntity:
        """Lấy thông tin Device theo ID."""
        doc = self.collection.document(device_id).get()
        if not doc.exists:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy thiết bị.")
        return _doc_to_entity(device_id, doc.to_dict())

    def get_by_user(self, user_id: str) -> List[DeviceEntity]:
        """Lấy danh sách Device đang thuộc về User (userId == user_id)."""
        docs = self.collection.where("userId", "==", user_id).get()
        return [_doc_to_entity(d.id, d.to_dict()) for d in docs]

    def get_unlinked_devices(self) -> List[DeviceEntity]:
        """Lấy danh sách Device chưa được liên kết (userId == None)."""
        docs = self.collection.where("userId", "==", None).get()
        return [_doc_to_entity(d.id, d.to_dict()) for d in docs]

    # ─── Link / Unlink ────────────────────────────────────────────────────────

    def link_device(self, user_id: str, verification_code: str) -> DeviceEntity:
        """
        Liên kết Device với User bằng verificationCode.
        Device phải chưa được liên kết (userId == None).
        """
        docs = self.collection.where("verificationCode", "==", verification_code).limit(1).get()
        docs_list = list(docs)
        if not docs_list:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy thiết bị với mã xác thực này.")

        doc = docs_list[0]
        data = doc.to_dict()
        if data.get("userId") is not None:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Thiết bị đã được liên kết với tài khoản khác.")

        self.collection.document(doc.id).update({"userId": user_id})
        data["userId"] = user_id
        return _doc_to_entity(doc.id, data)

    def unlink_device(self, user_id: str, device_id: str) -> DeviceEntity:
        """Huỷ liên kết Device. Chỉ owner mới được huỷ."""
        doc_ref = self.collection.document(device_id)
        doc = doc_ref.get()
        if not doc.exists:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy thiết bị.")

        data = doc.to_dict()
        if data.get("userId") != user_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Bạn không có quyền huỷ liên kết thiết bị này.")

        doc_ref.update({"userId": None})
        data["userId"] = None
        return _doc_to_entity(device_id, data)

    # ─── Config & Status ──────────────────────────────────────────────────────

    def update_config(self, user_id: str, device_id: str, payload: UpdateDeviceConfigRequest) -> DeviceEntity:
        """Cập nhật config.antiThief. Chỉ owner mới được cập nhật."""
        doc_ref = self.collection.document(device_id)
        doc = doc_ref.get()
        if not doc.exists:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy thiết bị.")
        if doc.to_dict().get("userId") != user_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Bạn không có quyền cập nhật thiết bị này.")

        doc_ref.update({"config.antiThief": payload.anti_thief})
        return _doc_to_entity(device_id, doc_ref.get().to_dict())

    def update_status(self, user_id: str, device_id: str, payload: UpdateDeviceStatusRequest) -> DeviceEntity:
        """Cập nhật trạng thái status (0 = offline, 1 = online). Chỉ owner mới được cập nhật."""
        doc_ref = self.collection.document(device_id)
        doc = doc_ref.get()
        if not doc.exists:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy thiết bị.")
        if doc.to_dict().get("userId") != user_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Bạn không có quyền cập nhật thiết bị này.")

        # Status: 1 (Online) hoặc 0 (Offline)
        new_status = 1 if payload.status == 1 else 0
        doc_ref.update({"status": new_status})
        return _doc_to_entity(device_id, doc_ref.get().to_dict())

    # ─── Vehicle ──────────────────────────────────────────────────────────────

    def update_vehicle(self, user_id: str, device_id: str, payload: UpdateVehicleRequest) -> DeviceEntity:
        """Cập nhật thông tin xe embedded. Chỉ owner mới được cập nhật."""
        doc_ref = self.collection.document(device_id)
        doc = doc_ref.get()
        if not doc.exists:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy thiết bị.")
        if doc.to_dict().get("userId") != user_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Bạn không có quyền cập nhật thiết bị này.")

        vehicle_update: dict = {}
        if payload.brand is not None:
            vehicle_update["vehicle.brand"] = payload.brand
        if payload.color is not None:
            vehicle_update["vehicle.color"] = payload.color
        if payload.license_plate is not None:
            vehicle_update["vehicle.licensePlate"] = payload.license_plate
        if payload.model is not None:
            vehicle_update["vehicle.model"] = payload.model

        if vehicle_update:
            doc_ref.update(vehicle_update)
        return _doc_to_entity(device_id, doc_ref.get().to_dict())

    # ─── Location ─────────────────────────────────────────────────────────────

    def update_location(self, device_id: str, payload: UpdateLocationRequest) -> DeviceEntity:
        """
        Cập nhật vị trí GPS mới nhất (replace toàn bộ mảng locations[]).
        Mảng luôn chỉ có 1 phần tử – vị trí mới nhất.
        """
        doc_ref = self.collection.document(device_id)
        if not doc_ref.get().exists:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy thiết bị.")

        new_location = {
            "createdAt": datetime.now(timezone.utc),
            "latitude": payload.latitude,
            "longitude": payload.longitude,
        }
        doc_ref.update({"locations": [new_location]})
        return _doc_to_entity(device_id, doc_ref.get().to_dict())

    # ─── Properties (gọi từ system khi gửi notification) ─────────────────────

    def update_properties(self, device_id: str, field: str, value: datetime) -> None:
        """
        Cập nhật một trường trong properties (lastMakeCallTime / lastSendSmsTime / lastPushNotificationTime).
        Gọi bởi NotificationService sau khi gửi thông báo thành công.
        """
        self.collection.document(device_id).update({f"properties.{field}": value})

