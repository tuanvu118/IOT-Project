import { apiRequest } from "./api";

export function getVehicleDevices() {
  return apiRequest("/devices/my-devices");
}

export function getVehicleDeviceById(deviceId) {
  return apiRequest(`/devices/${deviceId}`);
}

export function updateVehicle(deviceId, vehicleData) {
  return apiRequest(`/devices/${deviceId}/vehicle`, {
    method: "PATCH",
    body: JSON.stringify(vehicleData),
  });
}

export function unlinkVehicleDevice(deviceId) {
  return apiRequest("/devices/unlink", {
    method: "POST",
    body: JSON.stringify({ device_id: deviceId }),
  });
}
