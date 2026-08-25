from fastapi import HTTPException, UploadFile, status
import cloudinary
import cloudinary.uploader

from app.core.config import settings


class CloudinaryService:
    def __init__(self):
        if not all(
            [
                settings.CLOUDINARY_CLOUD_NAME,
                settings.CLOUDINARY_API_KEY,
                settings.CLOUDINARY_API_SECRET,
            ]
        ):
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Cloudinary chưa được cấu hình. Vui lòng kiểm tra file .env.",
            )

        cloudinary.config(
            cloud_name=settings.CLOUDINARY_CLOUD_NAME,
            api_key=settings.CLOUDINARY_API_KEY,
            api_secret=settings.CLOUDINARY_API_SECRET,
            secure=True,
            timeout=settings.CLOUDINARY_TIMEOUT,
        )

    def upload_avatar(self, uid: str, file: UploadFile) -> str:
        if not file.content_type or not file.content_type.startswith("image/"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File avatar phải là ảnh.",
            )

        public_id = f"{settings.CLOUDINARY_AVATAR_FOLDER}/{uid}"

        try:
            file.file.seek(0)
            result = cloudinary.uploader.upload(
                file.file,
                public_id=public_id,
                overwrite=True,
                resource_type="image",
                transformation=[
                    {"width": 512, "height": 512, "crop": "fill", "gravity": "face"},
                    {"quality": "auto", "fetch_format": "auto"},
                ],
                timeout=settings.CLOUDINARY_TIMEOUT,
            )
        except Exception as exc:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Upload avatar lên Cloudinary thất bại: {exc}",
            ) from exc

        avatar_url = result.get("secure_url")
        if not avatar_url:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Cloudinary không trả về secure_url cho avatar.",
            )

        return avatar_url
