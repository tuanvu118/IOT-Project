import { apiRequest } from "./api";

export function getMyDevices() {
  return apiRequest("/devices/my-devices");
}

export function addUserDevice(deviceData) {
  return apiRequest("/devices/user-add", {
    method: "POST",
    body: JSON.stringify(deviceData),
  });
}

export function createDevice(deviceData) {
  return addUserDevice(deviceData);
}

export function adminCreateDevice(payload) {
  return apiRequest("/devices", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getAvailableDevices() {
  return apiRequest("/devices/available");
}

export function getDeviceById(deviceId) {
  return apiRequest(`/devices/${deviceId}`);
}

export function linkDevice(verificationCode) {
  return apiRequest("/devices/link", {
    method: "POST",
    body: JSON.stringify({ verification_code: verificationCode }),
  });
}

export function unlinkDevice(deviceId) {
  return apiRequest("/devices/unlink", {
    method: "POST",
    body: JSON.stringify({ device_id: deviceId }),
  });
}

export function updateDeviceConfig(deviceId, config) {
  return apiRequest(`/devices/${deviceId}/config`, {
    method: "PATCH",
    body: JSON.stringify(config),
  });
}

export function updateDeviceStatus(deviceId, status) {
  return apiRequest(`/devices/${deviceId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status: Number(status) }),
  });
}

export function updateVehicle(deviceId, vehicleData) {
  return apiRequest(`/devices/${deviceId}/vehicle`, {
    method: "PATCH",
    body: JSON.stringify(vehicleData),
  });
}
