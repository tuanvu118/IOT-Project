import { useState } from "react";
import { Link } from "react-router-dom";
import { updateDeviceConfig, unlinkDevice } from "../../services/deviceService";

function getDeviceOnline(device) {
  if (!device?.name || device?.status === "unlinked") return false;
  return Boolean(
    device?.isOnline ||
      device?.online ||
      device?.status === 1 ||
      device?.status === "online" ||
      device?.status === "active" ||
      device?.status === "Trực tuyến"
  );
}

function getAntiTheftActive(device) {
  return Boolean(device?.config?.anti_thief || device?.config?.antiThief);
}

function VehicleCard({ device, onUpdate, onDelete }) {
  const vehicle = device?.vehicle || {};
  const isOnline = getDeviceOnline(device);

  const [isLocked, setIsLocked] = useState(getAntiTheftActive(device));
  const [isTogglingLock, setIsTogglingLock] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const vehicleName =
    [vehicle.brand, vehicle.model].filter(Boolean).join(" ") ||
    device?.name ||
    "Phương tiện";
  const plate = vehicle.license_plate || vehicle.licensePlate || "Chưa có";
  const brand = vehicle.brand || "—";
  const color = vehicle.color || "—";

  // Check if this vehicle is actually linked to an IoT device
  const hasDeviceIdentifier = Boolean(
    device?.verification_code ||
      device?.name ||
      device?.deviceId ||
      (device?.id && !String(device.id).startsWith("veh-"))
  );
  const isLinked = hasDeviceIdentifier && device?.status !== "unlinked" && device?.status !== "Chưa liên kết";
  const deviceName = isLinked
    ? (device.verification_code || device.name || device.deviceId || "Thiết bị IoT")
    : "Chưa liên kết";
  const firmwareVersion = isLinked ? (device?.firmwareVersion || device?.firmware || "v2.4") : "";

  const handleToggleLock = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isLinked) {
      alert("Phương tiện này chưa liên kết với thiết bị IoT để bật/tắt chống trộm.");
      return;
    }

    if (!device?.id) return;
    const newLockState = !isLocked;

    setIsTogglingLock(true);
    try {
      await updateDeviceConfig(device.id, { anti_thief: newLockState });
      setIsLocked(newLockState);
      if (onUpdate) {
        onUpdate(device.id, newLockState);
      }
    } catch (err) {
      alert("Không thể thay đổi trạng thái khóa: " + (err?.message || "Lỗi kết nối."));
    } finally {
      setIsTogglingLock(false);
    }
  };

  const handleDeleteVehicle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!window.confirm(`Bạn có chắc chắn muốn xóa phương tiện "${vehicleName} (${plate})"?`)) {
      return;
    }

    setDeleting(true);
    try {
      // 1. If linked to an API device, unlink it
      if (device?.id && !String(device.id).startsWith("veh-")) {
        try {
          await unlinkDevice(device.id);
        } catch {
          // Backend optional
        }
      }

      // 2. Remove from custom_vehicles
      const normalize = (str) => (str || "").toString().trim().toLowerCase().replace(/[\s.-]/g, "");
      const targetPlate = normalize(plate);

      const customVehicles = JSON.parse(localStorage.getItem("custom_vehicles") || "[]");
      const updatedCustom = customVehicles.filter((v) => {
        const vPlate = normalize(
          v.vehicle?.license_plate || v.vehicle?.licensePlate || v.licensePlate || v.license_plate
        );
        const isTarget = v.id === device.id || (targetPlate && vPlate === targetPlate);
        return !isTarget;
      });
      localStorage.setItem("custom_vehicles", JSON.stringify(updatedCustom));

      // 3. Remove from custom_linked_devices if any
      const customLinked = JSON.parse(localStorage.getItem("custom_linked_devices") || "[]");
      const updatedLinked = customLinked.filter((d) => d.id !== device.id);
      localStorage.setItem("custom_linked_devices", JSON.stringify(updatedLinked));

      if (onDelete) {
        onDelete(device.id || targetPlate);
      }
    } catch (err) {
      alert("Không thể xóa phương tiện: " + (err?.message || "Lỗi không xác định"));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <article className="vehicle-card">
      {/* Vehicle image area */}
      <div className="vehicle-card-image">
        {/* Interactive Lock / Unlock Badge */}
        {isLinked ? (
          <button
            type="button"
            className={`vehicle-card-lock-badge ${isLocked ? "locked" : "unlocked"}`}
            onClick={handleToggleLock}
            disabled={isTogglingLock}
            title={isLocked ? "Bấm để mở khóa (tắt chống trộm)" : "Bấm để khóa xe (bật chống trộm)"}
          >
            {isTogglingLock ? (
              <span className="lock-spinner" />
            ) : isLocked ? (
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 9.9-1" />
              </svg>
            )}
            <span>{isLocked ? "Đã khóa" : "Chưa khóa"}</span>
          </button>
        ) : null}

        {device?.image || vehicle?.image ? (
          <img
            src={device?.image || vehicle?.image}
            alt={vehicleName}
            className="vehicle-card-real-img"
          />
        ) : (
          <div className="vehicle-card-image-placeholder">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M5 16h2l2.5-4h5L17 16h2" />
              <circle cx="6" cy="17" r="2.2" />
              <circle cx="18" cy="17" r="2.2" />
              <path d="M10 12 9 9h3M15 12l2-3h2" />
            </svg>
          </div>
        )}
      </div>

      {/* Vehicle info */}
      <div className="vehicle-card-body">
        <h3 className="vehicle-card-name">{vehicleName}</h3>

        <span className="vehicle-card-plate">{plate}</span>

        <div className="vehicle-card-details">
          <div className="vehicle-card-detail">
            <small>THƯƠNG HIỆU</small>
            <strong>{brand}</strong>
          </div>
          <div className="vehicle-card-detail">
            <small>MÀU SẮC</small>
            <strong>
              <span
                className="vehicle-card-color-dot"
                style={{
                  background:
                    color === "Trắng"
                      ? "#e5e7eb"
                      : color === "Đen"
                        ? "#111827"
                        : color === "Đỏ"
                          ? "#dc2626"
                          : color === "Xám đậm"
                            ? "#4b5563"
                            : color === "Xám"
                              ? "#9ca3af"
                              : color === "Xanh"
                                ? "#2563eb"
                                : "#9ca3af",
                }}
              />
              {color}
            </strong>
          </div>
        </div>

        <div className="vehicle-card-device">
          <div className="vehicle-card-device-info">
            <small>THIẾT BỊ IOT</small>
            <strong>
              {deviceName}{" "}
              {firmwareVersion && <span className="vehicle-card-device-ver">{firmwareVersion}</span>}
            </strong>
          </div>
          <span
            className={`vehicle-card-status ${!isLinked ? "unlinked" : isOnline ? "online" : "offline"}`}
          >
            {!isLinked ? "Chưa liên kết" : isOnline ? "Trực tuyến" : "Ngoại tuyến"}
          </span>
        </div>

        {/* Action buttons */}
        <div className="vehicle-card-actions">
          {isLinked ? (
            <Link
              className="vehicle-card-action-btn"
              to={isOnline ? "/tracking" : `/alerts`}
            >
              {isOnline ? (
                <>
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 21s7-4.5 7-11a7 7 0 0 0-14 0c0 6.5 7 11 7 11z" />
                    <circle cx="12" cy="10" r="2.5" />
                  </svg>
                  Xem vị trí
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  Lịch sử
                </>
              )}
            </Link>
          ) : (
            <Link
              className="vehicle-card-action-btn unlinked-action"
              to="/devices/link"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
              Liên kết IoT
            </Link>
          )}

          <div className="vehicle-card-button-group">
            <Link
              className="vehicle-card-edit-btn"
              to={`/vehicles/${device?.id}/edit`}
              title="Chỉnh sửa phương tiện"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                <path d="m15 5 4 4" />
              </svg>
            </Link>
            <button
              type="button"
              className="vehicle-card-delete-btn"
              onClick={handleDeleteVehicle}
              disabled={deleting}
              title="Xóa phương tiện"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

export default VehicleCard;
