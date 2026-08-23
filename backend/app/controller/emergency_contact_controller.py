from typing import List
from fastapi import APIRouter, Depends, status

from app.core.dependencies import get_current_user
from app.entity.user import UserEntity
from app.service.emergency_contact_service import EmergencyContactService
from app.dto.emergency_contact_dto import (
    CreateEmergencyContactRequest,
    UpdateEmergencyContactRequest,
    EmergencyContactResponse,
)

router = APIRouter(prefix="/emergency-contacts", tags=["Emergency Contacts"])


@router.post(
    "",
    response_model=EmergencyContactResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Thêm số liên hệ khẩn cấp",
    description="Thêm số điện thoại SOS vào danh sách liên hệ khẩn cấp của User.",
)
def create_contact(
    payload: CreateEmergencyContactRequest,
    current_user: UserEntity = Depends(get_current_user),
):
    service = EmergencyContactService()
    contact = service.create(current_user.id, payload)

    return EmergencyContactResponse(
        id=contact.id,
        user_id=contact.user_id,
        name=contact.name,
        phone_number=contact.phone_number,
        relationship=contact.relationship,
        priority=contact.priority,
        is_active=contact.is_active,
        created_at=contact.created_at,
        updated_at=contact.updated_at,
    )


@router.get(
    "",
    response_model=List[EmergencyContactResponse],
    summary="Lấy danh sách số liên hệ khẩn cấp",
    description="Trả về danh sách số SOS của User, sắp xếp theo thứ tự ưu tiên.",
)
def get_contacts(
    current_user: UserEntity = Depends(get_current_user),
):
    service = EmergencyContactService()
    contacts = service.get_user_contacts(current_user.id, active_only=True)

    return [
        EmergencyContactResponse(
            id=c.id,
            user_id=c.user_id,
            name=c.name,
            phone_number=c.phone_number,
            relationship=c.relationship,
            priority=c.priority,
            is_active=c.is_active,
            created_at=c.created_at,
            updated_at=c.updated_at,
        )
        for c in contacts
    ]


@router.get(
    "/{contact_id}",
    response_model=EmergencyContactResponse,
    summary="Lấy chi tiết số liên hệ khẩn cấp",
)
def get_contact(
    contact_id: str,
    current_user: UserEntity = Depends(get_current_user),
):
    service = EmergencyContactService()
    contact = service.get_by_id(contact_id, current_user.id)

    return EmergencyContactResponse(
        id=contact.id,
        user_id=contact.user_id,
        name=contact.name,
        phone_number=contact.phone_number,
        relationship=contact.relationship,
        priority=contact.priority,
        is_active=contact.is_active,
        created_at=contact.created_at,
        updated_at=contact.updated_at,
    )


@router.put(
    "/{contact_id}",
    response_model=EmergencyContactResponse,
    summary="Cập nhật số liên hệ khẩn cấp",
)
def update_contact(
    contact_id: str,
    payload: UpdateEmergencyContactRequest,
    current_user: UserEntity = Depends(get_current_user),
):
    service = EmergencyContactService()
    contact = service.update(contact_id, current_user.id, payload)

    return EmergencyContactResponse(
        id=contact.id,
        user_id=contact.user_id,
        name=contact.name,
        phone_number=contact.phone_number,
        relationship=contact.relationship,
        priority=contact.priority,
        is_active=contact.is_active,
        created_at=contact.created_at,
        updated_at=contact.updated_at,
    )


@router.delete(
    "/{contact_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Xoá số liên hệ khẩn cấp",
)
def delete_contact(
    contact_id: str,
    current_user: UserEntity = Depends(get_current_user),
):
    service = EmergencyContactService()
    service.delete(contact_id, current_user.id)
