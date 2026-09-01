import { apiRequest } from "./api";

export async function getDeviceLocation(deviceId, signal) {
  const device = await apiRequest(
    `/devices/${deviceId}`,
    {
      method: "GET",
      signal,
    }
  );

  const latestLocation =
    Array.isArray(device.locations) && device.locations.length > 0
      ? device.locations[0]
      : null;

  if (!latestLocation) {
    return {
      device,
      location: null,
    };
  }

  const latitude = latestLocation.latitude;
  const longitude = latestLocation.longitude;

  const hasValidCoordinates =
    typeof latitude === "number" &&
    typeof longitude === "number" &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180;

  if (!hasValidCoordinates) {
    return {
      device,
      location: null,
    };
  }

  return {
    device,
    location: {
      latitude,
      longitude,
      createdAt: latestLocation.created_at ?? null,
    },
  };
}