from datetime import datetime, timezone
from typing import List
from fastapi import HTTPException, status

from app.core.firebase import get_firestore_client
from app.entity.notification import NotificationEntity
from app.dto.notification_dto import CreateNotificationRequest


# Firestore camelCase → Python snake_case
def _doc_to_entity(doc_id: str, data: dict) -> NotificationEntity:
    return NotificationEntity(
        id=doc_id,
        title=data.get("title", ""),
        content=data.get("content", ""),
        type=data.get("type", "INFO"),
        status=data.get("status", 0),
        user_id=data.get("userId", ""),
        is_read=data.get("isRead", False),
        device_id=data.get("deviceId", ""),
        created_at=data.get("createdAt", datetime.now(timezone.utc)),
    )


class NotificationService:
    """
    Service xử lý nghiệp vụ thông báo cho User.
    Tương tác với Firestore collection: user-notifications/{id}

    Firestore document dùng camelCase:
      userId, deviceId, isRead, createdAt
    """

    def __init__(self):
        self.db = get_firestore_client()
        self.collection = self.db.collection("user-notifications")

    # ─── Public Methods ───────────────────────────────────────────────────────

    def create_notification(self, payload: CreateNotificationRequest) -> NotificationEntity:
        """Tạo thông báo mới cho User trong collection user-notifications."""
        now = datetime.now(timezone.utc)
        data = {
            "title": payload.title,
            "content": payload.content,
            "type": payload.type,
            "status": payload.status,
            "userId": payload.user_id,
            "isRead": False,
            "deviceId": payload.device_id,
            "createdAt": now,
        }

        _, doc_ref = self.collection.add(data)
        return _doc_to_entity(doc_ref.id, data)

    def get_user_notifications(
        self,
        user_id: str,
        unread_only: bool = False,
        limit: int = 50,
    ) -> List[NotificationEntity]:
        """
        Lấy danh sách thông báo của User.
        Sắp xếp theo createdAt giảm dần (mới nhất trước).
        """
        query = self.collection.where("userId", "==", user_id)

        if unread_only:
            query = query.where("isRead", "==", False)

        docs = query.get()
        notifications = [_doc_to_entity(doc.id, doc.to_dict()) for doc in docs]
        notifications.sort(key=lambda item: item.created_at, reverse=True)
        return notifications[:limit]

    def mark_as_read(self, notification_id: str, user_id: str) -> NotificationEntity:
        """Đánh dấu một thông báo là đã đọc."""
        doc_ref = self.collection.document(notification_id)
        doc = doc_ref.get()

        if not doc.exists:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy thông báo.")

        data = doc.to_dict()
        if data.get("userId") != user_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Bạn không có quyền truy cập thông báo này.")

        if data.get("isRead"):
            return _doc_to_entity(notification_id, data)

        doc_ref.update({"isRead": True})
        data["isRead"] = True
        return _doc_to_entity(notification_id, data)

    def get_by_id(self, notification_id: str, user_id: str) -> NotificationEntity:
        doc = self.collection.document(notification_id).get()

        if not doc.exists:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy thông báo.")

        data = doc.to_dict()
        if data.get("userId") != user_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Bạn không có quyền truy cập thông báo này.")

        return _doc_to_entity(notification_id, data)

    def mark_all_as_read(self, user_id: str) -> int:
        """
        Đánh dấu tất cả thông báo chưa đọc của User là đã đọc.
        Trả về số lượng thông báo đã cập nhật.
        """
        unread_docs = (
            self.collection
            .where("userId", "==", user_id)
            .where("isRead", "==", False)
            .get()
        )

        batch = self.db.batch()
        count = 0
        for doc in unread_docs:
            batch.update(self.collection.document(doc.id), {"isRead": True})
            count += 1

        if count > 0:
            batch.commit()
        return count

    def get_unread_count(self, user_id: str) -> int:
        """Đếm số thông báo chưa đọc của User."""
        docs = (
            self.collection
            .where("userId", "==", user_id)
            .where("isRead", "==", False)
            .get()
        )
        return len(list(docs))

