import { apiRequest } from "./api";

export function loginUser(payload) {
  return apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function registerUser(payload) {
  return apiRequest("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getMe(token) {
  return apiRequest("/users/me", { token });
}

export function updateMyProfile(payload) {
  return apiRequest("/users/me", {
    method: "PUT",
    body: JSON.stringify(payload),
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

export function changePassword(payload) {
  return apiRequest("/auth/change-password", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
