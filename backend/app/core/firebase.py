import firebase_admin
from firebase_admin import credentials, firestore, auth
from app.core.config import settings

_app = None


def initialize_firebase() -> None:
    """Khởi tạo Firebase Admin SDK. Chỉ gọi một lần khi app startup."""
    global _app
    if _app is not None:
        return

    cred = credentials.Certificate(settings.FIREBASE_CREDENTIALS_PATH)
    _app = firebase_admin.initialize_app(cred, {
        "projectId": settings.FIREBASE_PROJECT_ID,
    })


def get_firestore_client() -> firestore.Client:
    """Trả về Firestore client đã được khởi tạo."""
    return firestore.client()


def get_auth_client():
    """Trả về Firebase Auth module."""
    return auth
