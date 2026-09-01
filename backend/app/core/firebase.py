import firebase_admin
from firebase_admin import credentials, firestore, auth
from app.core.config import settings

_app = None


def initialize_firebase() -> None:
    """Khởi tạo Firebase Admin SDK. Chỉ gọi một lần khi app startup."""
    global _app
    if _app is not None:
        return

    import os
    cred_path = settings.FIREBASE_CREDENTIALS_PATH
    if not os.path.exists(cred_path):
        # Fallback to local paths
        candidates = [
            os.path.join(os.path.dirname(__file__), "..", "..", "firebase-credentials.json"),
            os.path.join(os.getcwd(), "firebase-credentials.json"),
            os.path.join(os.getcwd(), "backend", "firebase-credentials.json"),
        ]
        for c in candidates:
            if os.path.exists(c):
                cred_path = os.path.abspath(c)
                break

    cred = credentials.Certificate(cred_path)
    _app = firebase_admin.initialize_app(cred, {
        "projectId": settings.FIREBASE_PROJECT_ID,
    })


def get_firestore_client() -> firestore.Client:
    """Trả về Firestore client đã được khởi tạo."""
    return firestore.client()


def get_auth_client():
    """Trả về Firebase Auth module."""
    return auth
