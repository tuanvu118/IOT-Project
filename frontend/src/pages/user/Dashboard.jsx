import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import useAuth from "../../hooks/useAuth";
import { getRecentAlerts } from "../../services/alertService";
import { getMyDevices } from "../../services/deviceService";

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

  return {
    id: device?.id,
    name: [vehicle.brand, vehicle.model].filter(Boolean).join(" ") || device?.name,
    plateNumber: vehicle.license_plate || vehicle.licensePlate,
    status: device?.status || "Chưa có trạng thái",
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

function Dashboard() {
  const { user } = useAuth();
  const [myDevices, setMyDevices] = useState([]);
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [loadError, setLoadError] = useState("");

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
  const backendVehicles = myDevices.map(mapDeviceToVehicle);
  const vehicles = user?.vehicles || user?.vehicleList || backendVehicles;
  const devices = user?.devices || user?.deviceList || myDevices;
  const alerts = user?.alerts || user?.recentAlerts || recentAlerts;
  const currentVehicle = user?.currentVehicle || getFirstItem(vehicles);
  const currentDevice = user?.currentDevice || getFirstItem(devices);
  const isDeviceOnline = getDeviceOnline(currentDevice);
  const batteryLevel = currentDevice?.batteryLevel ?? currentDevice?.battery ?? null;
  const currentAddress = getLocationText(currentDevice, currentVehicle, user);
  const antiTheftEnabled = Boolean(
    currentVehicle?.antiTheftEnabled ??
      currentVehicle?.antiThief ??
      currentDevice?.antiTheftEnabled ??
      currentDevice?.config?.antiThief,
  );
  const plateText =
    currentVehicle?.plateNumber ||
    currentVehicle?.licensePlate ||
    currentVehicle?.plate ||
    "Chưa có biển số";

  const stats = [
    {
      label: "PHƯƠNG TIỆN",
      value:
        currentVehicle?.statusText ||
        (currentVehicle?.status === 1 ? "Đang hoạt động" : currentVehicle?.status) ||
        "Chưa liên kết",
      type: "bike",
    },
    {
      label: currentDevice?.name || currentDevice?.id || "THIẾT BỊ IOT",
      value: currentDevice ? (isDeviceOnline ? "Trực tuyến" : "Ngoại tuyến") : "Chưa kết nối",
      type: "device",
      online: isDeviceOnline,
    },
    {
      label: "DUNG LƯỢNG PIN",
      value: batteryLevel === null ? "Chưa có dữ liệu" : `${batteryLevel}%`,
      type: "battery",
    },
    {
      label: "TÍN HIỆU GPS",
      value: currentDevice?.gpsStatus || currentVehicle?.gpsStatus || "Chưa có dữ liệu",
      type: "gps",
    },
  ];

  return (
    <div className="dashboard-page">
      <div className="dashboard-heading-row">
        <div>
          <h1>Xin chào, {displayName}</h1>
          <p>Đây là tình trạng phương tiện của bạn hôm nay.</p>
        </div>

        <select aria-label="Chọn phương tiện" disabled={vehicles.length === 0}>
          {vehicles.length > 0 ? (
            vehicles.map((vehicle, index) => (
              <option key={vehicle.id || vehicle.plateNumber || index}>
                {getVehicleLabel(vehicle)}
              </option>
            ))
          ) : (
            <option>Chưa có phương tiện</option>
          )}
        </select>
      </div>

      <section className="dashboard-stats" aria-label="Tổng quan thiết bị">
        {stats.map((stat) => (
          <article className={`dashboard-stat-card ${stat.type}`} key={stat.label}>
            <span className="dashboard-stat-icon">
              <DashboardIcon type={stat.type} />
            </span>
            <div>
              <small>{stat.label}</small>
              <strong className={stat.online ? "is-online" : ""}>
                {stat.online && <span aria-hidden="true" />}
                {stat.value}
              </strong>
            </div>
          </article>
        ))}
      </section>

      {loadError && <p className="dashboard-load-error">{loadError}</p>}

      <div className="dashboard-grid">
        <section className="dashboard-map-card">
          <div className="dashboard-card-title">
            <div>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 21s7-4.5 7-11a7 7 0 0 0-14 0c0 6.5 7 11 7 11z" />
                <circle cx="12" cy="10" r="2.4" />
              </svg>
              <h2>Vị trí phương tiện</h2>
            </div>
            <button type="button" disabled={!currentVehicle}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="12" r="8" />
                <path d="M14.5 9.5 10 14l-.5.5.5-4.5 4.5-.5z" />
              </svg>
              Theo dõi vị trí
            </button>
          </div>

          <div className={`dashboard-map ${!currentVehicle ? "is-empty" : ""}`}>
            <div className="map-river" />
            <div className="map-road road-main" />
            <div className="map-road road-second" />
            <div className="map-road road-third" />
            <div className="map-area area-a">Khu vực gần đây</div>
            <div className="map-area area-b">Điểm GPS</div>
            <div className="map-area area-c">Vùng an toàn</div>
            <div className="map-area area-d">Khu dân cư</div>
            <div className="map-city">{currentVehicle?.city || "Bản đồ"}</div>
            <div className="map-plate">{plateText}</div>
            <div className="map-bike">
              <DashboardIcon type="bike" />
            </div>
            <div className="map-controls">
              <button type="button">+</button>
              <button type="button">−</button>
              <button type="button">◇</button>
            </div>
          </div>

          <div className="dashboard-address">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 21s7-4.5 7-11a7 7 0 0 0-14 0c0 6.5 7 11 7 11z" />
              <circle cx="12" cy="10" r="2.4" />
            </svg>
            <div>
              <small>Địa chỉ hiện tại</small>
              <strong>{currentAddress}</strong>
            </div>
          </div>
        </section>

        <aside className="dashboard-side">
          <section className="anti-theft-card">
            <div className="anti-theft-top">
              <span>
                <DashboardIcon type="shield" />
              </span>
              <div>
                <h2>Chống trộm</h2>
                <small className={antiTheftEnabled ? "is-on" : "is-off"}>
                  {antiTheftEnabled ? "Đang bật" : "Đang tắt"}
                </small>
              </div>
              <button
                className={antiTheftEnabled ? "is-enabled" : ""}
                type="button"
                aria-label="Bật tắt chống trộm"
              >
                <span />
              </button>
            </div>
            <p>
              Hệ thống sẽ gửi thông báo và kích hoạt còi báo động nếu phát hiện
              rung lắc hoặc di chuyển bất thường.
            </p>
          </section>

          <section className="recent-alerts-card">
            <div className="recent-alerts-title">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 4 21 20H3z" />
                <path d="M12 9v5M12 17h.01" />
              </svg>
              <h2>Cảnh báo gần đây</h2>
            </div>

            <div className="recent-alert-list">
              {alerts.length > 0 ? (
                alerts.map((alert, index) => (
                  <article
                    className={`recent-alert-item ${alert.tone || alert.type || "muted"}`}
                    key={alert.id || alert.title || index}
                  >
                    <span className="recent-alert-icon">
                      <DashboardIcon type={alert.type === "battery" ? "battery" : "device"} />
                    </span>
                    <div>
                      <div>
                        <strong>{alert.title || alert.message || "Cảnh báo"}</strong>
                        <time>{alert.time || alert.createdAt || ""}</time>
                      </div>
                      <p>{alert.description || alert.detail || "Chưa có mô tả chi tiết."}</p>
                    </div>
                  </article>
                ))
              ) : (
                <p className="recent-alert-empty">Chưa có cảnh báo nào cho tài khoản này.</p>
              )}
            </div>

            <Link className="all-alerts-link" to="/alerts">
              Xem tất cả cảnh báo →
            </Link>
          </section>
        </aside>
      </div>
    </div>
  );
}

export default Dashboard;
