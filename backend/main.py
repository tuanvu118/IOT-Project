from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.core.firebase import initialize_firebase
from app.core.exceptions import http_exception_handler, generic_exception_handler

# ─── Controllers ──────────────────────────────────────────────────────────────
from app.controller.auth_controller import router as auth_router
from app.controller.user_controller import router as user_router
from app.controller.device_controller import router as device_router
from app.controller.vehicle_controller import router as vehicle_router
from app.controller.device_location_controller import router as device_location_router
from app.controller.device_event_controller import router as device_event_router
from app.controller.notification_controller import router as notification_router
from app.controller.emergency_contact_controller import router as emergency_contact_router

# ─── Firebase Init ────────────────────────────────────────────────────────────
initialize_firebase()

# ─── App ──────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="IoT Motorcycle Safety API",
    description=(
        "Backend API cho hệ thống IoT phát hiện và cảnh báo mất trộm, tai nạn xe máy.\n\n"
        "**Authentication**: Tất cả endpoint (trừ `/auth/register` và `/auth/me`) yêu cầu "
        "Firebase ID Token trong header `Authorization: Bearer <token>`."
    ),
    version="1.0.0",
    contact={
        "name": "Đào Bá Khánh",
    },
)

# ─── CORS ─────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # TODO: Giới hạn origins trong production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Exception Handlers ───────────────────────────────────────────────────────
app.add_exception_handler(HTTPException, http_exception_handler)
app.add_exception_handler(Exception, generic_exception_handler)

# ─── Routers ──────────────────────────────────────────────────────────────────
API_PREFIX = "/api/v1"

app.include_router(auth_router, prefix=API_PREFIX)
app.include_router(user_router, prefix=API_PREFIX)
app.include_router(device_router, prefix=API_PREFIX)
app.include_router(vehicle_router, prefix=API_PREFIX)
app.include_router(device_location_router, prefix=API_PREFIX)
app.include_router(device_event_router, prefix=API_PREFIX)
app.include_router(notification_router, prefix=API_PREFIX)
app.include_router(emergency_contact_router, prefix=API_PREFIX)


# ─── Health Check ─────────────────────────────────────────────────────────────
@app.get("/", tags=["Health"])
def root():
    return {
        "message": "IoT Motorcycle Safety Backend is running 🚀",
        "version": "1.0.0",
        "docs": "/docs",
    }


@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "ok"}