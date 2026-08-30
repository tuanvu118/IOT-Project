import { apiRequest } from "./api";

export function getRecentAlerts(limit = 3) {
  return apiRequest(`/notifications?limit=${limit}`);
}

export function getAlerts({ unreadOnly = false, limit = 50 } = {}) {
  const params = new URLSearchParams({
    unread_only: String(unreadOnly),
    limit: String(limit),
  });

  return apiRequest(`/notifications?${params.toString()}`);
}

export function getAlertDetail(id) {
  return apiRequest(`/notifications/${id}`);
}

export function getUnreadNotificationCount() {
  return apiRequest("/notifications/unread-count");
}

export function markAllNotificationsAsRead() {
  return apiRequest("/notifications/read-all", {
    method: "PUT",
  });
}

export function markNotificationAsRead(id) {
  return apiRequest(`/notifications/${id}/read`, {
    method: "PUT",
  });
}
