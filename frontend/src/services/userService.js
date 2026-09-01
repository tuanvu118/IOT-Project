import { apiRequest } from "./api";

export function getMyProfile() {
  return apiRequest("/users/me");
}

export function updateMyProfile(payload) {
  return apiRequest("/users/me", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteMyAccount() {
  return apiRequest("/users/me", {
    method: "DELETE",
  });
}

export function uploadAvatar(file) {
  const formData = new FormData();
  formData.append("file", file);
  return apiRequest("/users/me/avatar", {
    method: "POST",
    body: formData,
  });
}

export function addSosNumber(phoneNumber) {
  return apiRequest("/users/me/sos-numbers", {
    method: "POST",
    body: JSON.stringify({ phone_number: phoneNumber }),
  });
}

export function removeSosNumber(phoneNumber) {
  return apiRequest("/users/me/sos-numbers", {
    method: "DELETE",
    body: JSON.stringify({ phone_number: phoneNumber }),
  });
}

export function getAllUsers() {
  return apiRequest("/users");
}

export function getUserById(userId) {
  return apiRequest(`/users/${userId}`);
}

export function deleteUserByAdmin(userId) {
  return apiRequest(`/users/${userId}`, {
    method: "DELETE",
  });
}

export function toggleUserLock(userId, isLocked) {
  return apiRequest(`/users/${userId}/lock`, {
    method: "PUT",
    body: JSON.stringify({ is_locked: isLocked }),
  });
}


