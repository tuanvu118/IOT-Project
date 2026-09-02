import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import useAuth from "../../hooks/useAuth";
import { getRecentAlerts } from "../../services/alertService";
import { getMyDevices, updateDeviceConfig } from "../../services/deviceService";
import MapView from "../../components/map/MapView";
import CustomSelect from "../../components/common/CustomSelect";
import "../../styles/pwa-mobile.css";

function getFirstItem(value) {
  return Array.isArray(value) && value.length > 0 ? value[0] : null;
}

function getVehicleLabel(vehicle) {
  if (!vehicle) return "Chưa có phương tiện";

  const name = vehicle.name || vehicle.model || vehicle.vehicleName || "Phương tiện";
  const plate = vehicle.plateNumber || vehicle.licensePlate || vehicle.plate;

  return plate ? `${name} - ${plate}` : name;
}

function getDeviceOnline(device) {
  return Boolean(
    device?.isOnline ||
      device?.online ||
      device?.status === 1 ||
      device?.status === "online" ||
      device?.status === "active" ||
      device?.status === "Trực tuyến",
  );
}

function mapDeviceToVehicle(device) {
  const vehicle = device?.vehicle || {};
  const hasVehicle = Boolean(
    vehicle.brand || vehicle.model || vehicle.license_plate || vehicle.licensePlate
  );
  const isOnline = getDeviceOnline(device);

  return {
    id: device?.id,
    name: [vehicle.brand, vehicle.model].filter(Boolean).join(" ") || device?.name || "Phương tiện",
    plateNumber: vehicle.license_plate || vehicle.licensePlate,
    hasVehicle,
    status: hasVehicle
      ? (isOnline ? "Đang hoạt động" : "Đang dừng/đỗ")
      : "Chưa gắn xe",
    statusText: hasVehicle
      ? (isOnline ? "Đang hoạt động" : "Đang dừng/đỗ")
      : "Chưa gắn xe",
    antiThief: device?.config?.anti_thief ?? device?.config?.antiThief,
    locations: device?.locations || [],
  };
}

function getLocationText(device, vehicle, user) {
  const location = vehicle?.location || device?.locations?.[0];

  if (vehicle?.address || location?.address) {
    return vehicle?.address || location.address;
  }

  if (location?.latitude && location?.longitude) {
    return `${location.latitude}, ${location.longitude}`;
  }

  return user?.currentAddress || user?.address || "Chưa có dữ liệu vị trí";
}

function mapNotificationToAlert(notification) {
  const type = notification.type || "";
  const tone = type.includes("accident") || type.includes("danger") ? "danger" : "muted";

  return {
    id: notification.id,
    tone,
    type,
    title: notification.title || "Cảnh báo",
    time: notification.created_at || notification.createdAt || "",
    description: notification.content || notification.description || "Chưa có mô tả chi tiết.",
  };
}

function DashboardIcon({ type }) {
  if (type === "device") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 15h16v5H4z" />
        <path d="M8 15v-4a4 4 0 0 1 8 0v4" />
        <path d="M7 18h.01M17 18h.01M12 7V4" />
      </svg>
    );
  }

  if (type === "battery") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M9 5h6v3H9zM8 8h8v12H8z" />
        <path d="M11 11h2M11 14h2" />
      </svg>
    );
  }

  if (type === "gps") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 3v3m0 12v3M3 12h3m12 0h3" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2.4" />
      </svg>
    );
  }

  if (type === "shield") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 3 20 6v6c0 5-3.2 8.1-8 10-4.8-1.9-8-5-8-10V6z" />
        <path d="M9 12h6M15 12v5" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 16h2l2.5-4h5L17 16h2" />
      <circle cx="6" cy="17" r="2.2" />
      <circle cx="18" cy="17" r="2.2" />
      <path d="M10 12 9 9h3M15 12l2-3h2" />
    </svg>
  );
}

function MobileDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [myDevices, setMyDevices] = useState([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [loadError, setLoadError] = useState("");
  const [togglingAntiTheft, setTogglingAntiTheft] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadDashboardData() {
      if (!user) return;

      setLoadError("");

      const [devicesResult, alertsResult] = await Promise.allSettled([
        getMyDevices(),
        getRecentAlerts(3),
      ]);

      if (!isMounted) return;

      if (devicesResult.status === "fulfilled") {
        setMyDevices(devicesResult.value || []);
      }

      if (alertsResult.status === "fulfilled") {
        setRecentAlerts((alertsResult.value || []).map(mapNotificationToAlert));
      }

      if (devicesResult.status === "rejected" || alertsResult.status === "rejected") {
        setLoadError("Chưa tải được một số dữ liệu tổng quan.");
      }
    }

    loadDashboardData();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const displayName = user?.name || user?.email?.split("@")[0] || "người dùng";
  const alerts = user?.alerts || user?.recentAlerts || recentAlerts;

  const userKey = `user_vehicles_${user?.id || user?.uid || "default"}`;
  const localVehicles = (() => {
    try {
      const userVehicles = JSON.parse(localStorage.getItem(userKey) || "[]");
      const customVehicles = JSON.parse(localStorage.getItem("custom_vehicles") || "[]");
      const map = new Map();
      [...customVehicles, ...userVehicles].forEach((v) => {
        if (v && v.id) map.set(v.id, v);
      });
      return Array.from(map.values());
    } catch {
      return [];
    }
  })();

  const normalize = (str) => (str || "").toString().trim().toLowerCase().replace(/[\s.-]/g, "");

  // 1. Backend devices that actually have an attached vehicle
  const devicesWithVehicle = myDevices.filter((d) => {
    const v = d.vehicle || {};
    return Boolean(v.brand || v.model || v.license_plate || v.licensePlate);
  });

  const devicePlates = new Set(
    devicesWithVehicle
      .map((d) => normalize(d.vehicle?.license_plate || d.vehicle?.licensePlate))
      .filter(Boolean)
  );

  // 2. Strict Vehicle list (only vehicles, never unlinked standalone devices)
  const vehicles = [
    // Vehicles from API devices that have vehicle info attached
    ...devicesWithVehicle.map((d) => {
      const v = d.vehicle || {};
      const brand = v.brand || "";
      const model = v.model || "";
      const fullName = [brand, model].filter(Boolean).join(" ") || "Phương tiện";
      const plate = v.license_plate || v.licensePlate || "";
      return {
        id: String(d.id),
        name: fullName,
        brand,
        model,
        plateNumber: plate,
        isLinked: true,
        deviceId: d.id,
        deviceCode: d.verification_code || d.id,
        device: d,
      };
    }),
    // User local vehicles (not duplicated with backend)
    ...localVehicles
      .filter((lv) => {
        const plate = normalize(
          lv.vehicle?.license_plate || lv.vehicle?.licensePlate || lv.licensePlate || lv.license_plate
        );
        return !plate || !devicePlates.has(plate);
      })
      .map((lv) => {
        const v = lv.vehicle || lv;
        const brand = v.brand || lv.brand || "";
        const model = v.model || lv.model || "";
        const fullName = [brand, model].filter(Boolean).join(" ") || lv.name || "Phương tiện";
        const plate = v.license_plate || v.licensePlate || lv.licensePlate || lv.license_plate || "";

        const linkedDev = lv.deviceId
          ? myDevices.find(
              (d) => String(d.id) === String(lv.deviceId) || String(d.verification_code) === String(lv.deviceId)
            )
          : null;

        return {
          id: String(lv.id),
          name: fullName,
          brand,
          model,
          plateNumber: plate,
          isLinked: Boolean(linkedDev),
          deviceId: linkedDev?.id || null,
          deviceCode: linkedDev ? (linkedDev.verification_code || linkedDev.id) : null,
          device: linkedDev,
        };
      }),
  ];

  const hasVehicles = vehicles.length > 0;
  const hasDevices = myDevices.length > 0;
  const currentVehicle = hasVehicles
    ? (vehicles.find((v) => String(v.id) === String(selectedVehicleId)) || vehicles[0])
    : null;
  const currentDevice = currentVehicle?.device || null;
  const hasLinkedDevice = Boolean(currentDevice);

  const isDeviceOnline = currentDevice ? getDeviceOnline(currentDevice) : false;
  const batteryLevel = currentDevice?.batteryLevel ?? currentDevice?.battery ?? null;
  const currentAddress = currentDevice
    ? getLocationText(currentDevice, currentVehicle, user)
    : (hasVehicles ? "Phương tiện chưa gắn thiết bị IoT" : "Chưa có dữ liệu vị trí");
  const antiTheftEnabled = Boolean(
    currentDevice?.config?.anti_thief ??
      currentDevice?.config?.antiThief ??
      currentVehicle?.antiTheftEnabled ??
      currentVehicle?.antiThief,
  );
  const plateText = currentVehicle?.plateNumber || "Chưa có biển số";

  const handleToggleAntiTheft = async () => {
    if (!currentDevice?.id) {
      alert("Phương tiện này chưa được liên kết với thiết bị IoT để bật/tắt chống trộm.");
      return;
    }

    const newAntiTheftState = !antiTheftEnabled;
    setTogglingAntiTheft(true);
    try {
      await updateDeviceConfig(currentDevice.id, { anti_thief: newAntiTheftState });
      setMyDevices((prev) =>
        prev.map((d) =>
          d.id === currentDevice.id
            ? {
                ...d,
                config: {
                  ...d.config,
                  anti_thief: newAntiTheftState,
                  antiThief: newAntiTheftState,
                },
              }
            : d
        )
      );
    } catch (err) {
      alert("Không thể thay đổi trạng thái chống trộm: " + (err?.message || "Lỗi kết nối"));
    } finally {
      setTogglingAntiTheft(false);
    }
  };

  const currentLocation = currentDevice?.locations?.[0] || null;
  const latitude = currentLocation?.latitude ?? null;
  const longitude = currentLocation?.longitude ?? null;
  const vehicleName = currentVehicle?.name || (hasVehicles ? "Phương tiện" : "Chưa có phương tiện");
  const deviceCode = currentVehicle?.deviceCode || (hasVehicles ? "Chưa liên kết" : "Chưa có thiết bị");
  const displayBattery = batteryLevel !== null ? batteryLevel : null;

  // Web-aligned logic for 4 stats
  const vehicleStatusText = hasVehicles
    ? (hasLinkedDevice
        ? (isDeviceOnline ? "Đang hoạt động" : "Đang dừng/đỗ")
        : "Chưa gắn xe")
    : "Chưa có phương tiện";

  const vehicleSubtext = hasVehicles
    ? [vehicleName, currentVehicle?.plateNumber].filter(Boolean).join(" • ")
    : "Chưa có dữ liệu";

  const gpsIsOnline = hasLinkedDevice && (isDeviceOnline || typeof latitude === "number");
  const gpsStatusText = hasLinkedDevice
    ? (currentDevice?.gpsStatus || (gpsIsOnline ? "Hoạt động" : "Mất tín hiệu"))
    : "Chưa kết nối";
  const gpsSubtext = hasLinkedDevice
    ? (typeof latitude === "number" ? `Tọa độ: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}` : (isDeviceOnline ? "Tín hiệu tốt" : "Chưa có vị trí gần nhất"))
    : "Chưa có dữ liệu";

  return (
    <div className="dashboard-page pwa-dashboard">
      {/* Vehicle select row */}
      <div className="dashboard-heading-row">
        <div className="dashboard-welcome-col">
          <h1>Xin chào, {displayName}</h1>
          <p>Đây là tình trạng phương tiện của bạn hôm nay.</p>
        </div>

        <CustomSelect
          options={vehicles.map((v) => {
            const plate = v.plateNumber ? ` - ${v.plateNumber}` : "";
            return {
              value: v.id,
              label: `${v.name}${plate}`,
              sublabel: v.deviceCode ? `Thiết bị: ${v.deviceCode}` : "Chưa liên kết thiết bị IoT",
            };
          })}
          value={currentVehicle?.id ?? ""}
          onChange={(val) => setSelectedVehicleId(val)}
          placeholder="Chưa có phương tiện"
          disabled={!hasVehicles}
          ariaLabel="Chọn phương tiện để theo dõi"
        />
      </div>

      {/* Onboarding Banner when user has no vehicles */}
      {!hasVehicles && (
        <div style={{ background: "#eff6ff", border: "1.5px dashed #93c5fd", borderRadius: "16px", padding: "16px 18px", marginBottom: "20px", display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "#0066cc", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="6" cy="17" r="2.2" />
                <circle cx="18" cy="17" r="2.2" />
                <path d="M5 16h2l2.5-4h5L17 16h2M10 12 9 9h3M15 12l2-3h2" />
              </svg>
            </div>
            <div>
              <strong style={{ fontSize: "14.5px", color: "#0f172a", display: "block" }}>Tài khoản chưa có phương tiện</strong>
              <span style={{ fontSize: "12.5px", color: "#64748b" }}>Thêm phương tiện của bạn để bắt đầu giám sát trạng thái và vị trí theo thời gian thực.</span>
            </div>
          </div>
          <div style={{ display: "flex", gap: "10px", width: "100%", marginTop: "4px" }}>
            <Link to="/vehicles/add" className="pwa-continue-btn" style={{ height: "40px", fontSize: "13.5px", textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center", flex: 1 }}>
              + Thêm phương tiện mới
            </Link>
          </div>
        </div>
      )}

      {/* 2x2 Quick Metrics */}
      <section className="dashboard-stats" aria-label="Tổng quan thiết bị">
        <article className="dashboard-stat-card bike">
          <span className="dashboard-stat-icon">
            <DashboardIcon type="bike" />
          </span>
          <div>
            <small>PHƯƠNG TIỆN</small>
            <strong className={hasLinkedDevice && isDeviceOnline ? "is-online" : ""}>
              {hasLinkedDevice && isDeviceOnline && <span aria-hidden="true" />}
              {vehicleStatusText}
            </strong>
            <span className="stat-subtext">{vehicleSubtext}</span>
          </div>
        </article>

        <article className="dashboard-stat-card device">
          <span className="dashboard-stat-icon">
            <DashboardIcon type="device" />
          </span>
          <div>
            <small>{deviceCode && deviceCode !== "Chưa liên kết" ? `THIẾT BỊ (${deviceCode})` : "THIẾT BỊ IOT"}</small>
            <div className="stat-device-row">
              <strong className={hasLinkedDevice && isDeviceOnline ? "is-online" : ""}>
                {hasLinkedDevice && isDeviceOnline && <span aria-hidden="true" />}
                {hasLinkedDevice ? (isDeviceOnline ? "Trực tuyến" : "Ngoại tuyến") : "Chưa kết nối"}
              </strong>
              {hasLinkedDevice && (
                <span className={`status-pill ${isDeviceOnline ? "online" : "offline"}`}>
                  <span className="status-dot" />
                  {isDeviceOnline ? "Online" : "Offline"}
                </span>
              )}
            </div>
          </div>
        </article>

        <article className="dashboard-stat-card battery">
          <span className="dashboard-stat-icon">
            <DashboardIcon type="battery" />
          </span>
          <div>
            <small>DUNG LƯỢNG PIN</small>
            <strong className="stat-main-val">
              {displayBattery !== null ? (
                <>{displayBattery} <span className="stat-unit">%</span></>
              ) : (
                "Chưa có dữ liệu"
              )}
            </strong>
            {displayBattery !== null ? (
              <div className="pwa-battery-track">
                <div
                  className="pwa-battery-fill"
                  style={{ width: `${Math.min(100, Math.max(0, displayBattery))}%` }}
                />
              </div>
            ) : (
              <span className="stat-subtext">Chưa nhận thông số</span>
            )}
          </div>
        </article>

        <article className="dashboard-stat-card gps">
          <span className="dashboard-stat-icon">
            <DashboardIcon type="gps" />
          </span>
          <div>
            <small>TÍN HIỆU GPS</small>
            <strong className={gpsIsOnline ? "is-online" : ""}>
              {gpsIsOnline && <span aria-hidden="true" />}
              {gpsStatusText}
            </strong>
            <span className="stat-subtext">{gpsSubtext}</span>
          </div>
        </article>
      </section>

      {loadError && <p className="dashboard-load-error">{loadError}</p>}

      <div className="dashboard-grid">
        {/* Map Preview Card */}
        <section className="dashboard-map-card pwa-map-card">
          <div className="dashboard-map">
            <MapView
              latitude={typeof latitude === "number" ? latitude : null}
              longitude={typeof longitude === "number" ? longitude : null}
              device={currentDevice}
            />
          </div>

          <div className="dashboard-address pwa-map-bottom">
            <div className="pwa-map-address-wrap">
              <h2 className="pwa-map-vehicle-name">{hasVehicles ? vehicleName : "Chưa có phương tiện"}</h2>
              <div className="pwa-map-address-row">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#0066cc" strokeWidth="2.2" aria-hidden="true">
                  <path d="M12 21s7-4.5 7-11a7 7 0 0 0-14 0c0 6.5 7 11 7 11z" />
                  <circle cx="12" cy="10" r="2.5" />
                </svg>
                <span>{currentAddress}</span>
              </div>
            </div>

            <div className="pwa-map-bottom-actions">
              <span className="pwa-map-time">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#64748b" strokeWidth="2" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                {hasLinkedDevice ? `Cập nhật ${new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}` : "Chưa có dữ liệu"}
              </span>

              <Link to="/tracking" className="pwa-track-link">
                THEO DÕI VỊ TRÍ →
              </Link>
            </div>
          </div>
        </section>

        {/* Side Panel: Anti-theft & Recent Alerts */}
        <aside className="dashboard-side">
          <section className="anti-theft-card pwa-anti-theft">
            <div className="anti-theft-top">
              <div className="anti-theft-shield-badge">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#0066cc" strokeWidth="2.2" aria-hidden="true">
                  <path d="M12 3 20 6v6c0 5-3.2 8.1-8 10-4.8-1.9-8-5-8-10V6z" />
                </svg>
              </div>
              <div className="anti-theft-text">
                <h2>Chế độ chống trộm</h2>
                <small className={antiTheftEnabled ? "is-on" : "is-off"}>
                  <span className="status-dot" />
                  {antiTheftEnabled ? "Đang bật" : "Đang tắt"}
                </small>
              </div>
              <button
                className={`pwa-toggle-switch ${antiTheftEnabled ? "is-enabled" : ""}`}
                type="button"
                aria-label="Bật tắt chống trộm"
                onClick={handleToggleAntiTheft}
                disabled={togglingAntiTheft || !currentDevice}
                title={
                  !currentDevice
                    ? "Chưa có thiết bị để bật chống trộm"
                    : togglingAntiTheft
                      ? "Đang chuyển trạng thái..."
                      : antiTheftEnabled
                        ? "Nhấn để tắt chống trộm"
                        : "Nhấn để bật chống trộm"
                }
              >
                <span className="toggle-circle" />
              </button>
            </div>
          </section>

          <section className="recent-alerts-card pwa-alerts-card">
            <div className="recent-alerts-title">
              <h2>Cảnh báo gần đây</h2>
              {alerts.length > 0 && <span className="pwa-badge-new">{alerts.length} Mới</span>}
            </div>

            <div className="recent-alert-list">
              {alerts.length > 0 ? (
                alerts.slice(0, 3).map((alert, index) => (
                  <article
                    className="recent-alert-item"
                    key={alert.id || index}
                  >
                    <span className={`recent-alert-icon ${alert.type === "battery" ? "battery" : "device"}`}>
                      <DashboardIcon type={alert.type === "battery" ? "battery" : "device"} />
                    </span>
                    <div className="recent-alert-content">
                      <div className="recent-alert-item-header">
                        <strong>{alert.title || "Cảnh báo"}</strong>
                        {alert.time && <time>{alert.time}</time>}
                      </div>
                      <p>{alert.description || "Chưa có mô tả chi tiết."}</p>
                    </div>
                  </article>
                ))
              ) : (
                <p className="recent-alert-empty">Chưa có cảnh báo nào.</p>
              )}
            </div>

            <Link className="all-alerts-link" to="/alerts">
              XEM TẤT CẢ →
            </Link>
          </section>
        </aside>
      </div>
    </div>
  );
}

export default MobileDashboard;
