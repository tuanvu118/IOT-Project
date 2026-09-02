import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { getMyDevices } from "../../services/deviceService";
import MapView from "../../components/map/MapView";
import useLocation from "../../hooks/useLocation";
import CustomSelect from "../../components/common/CustomSelect";
import "../../styles/pwa-mobile.css";

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

function getVehicleName(device) {
  const vehicle = device?.vehicle || {};
  return [vehicle.brand, vehicle.model].filter(Boolean).join(" ") || device?.name || "Chưa có phương tiện";
}

function getLicensePlate(device) {
  const vehicle = device?.vehicle || {};
  return vehicle.license_plate || vehicle.licensePlate || "Chưa có biển số";
}

function getLatestLocation(device) {
  return Array.isArray(device?.locations) && device.locations.length > 0 ? device.locations[0] : null;
}

function TrackingIcon({ type }) {
  if (type === "pin") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 21s7-4.5 7-11a7 7 0 0 0-14 0c0 6.5 7 11 7 11z" />
        <circle cx="12" cy="10" r="2.4" />
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

  if (type === "device") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 15h16v5H4z" />
        <path d="M8 15v-4a4 4 0 0 1 8 0v4" />
        <path d="M7 18h.01M17 18h.01M12 7V4" />
      </svg>
    );
  }

  if (type === "clock") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </svg>
    );
  }

  if (type === "refresh") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M20 11a8 8 0 1 0-2.3 5.7" />
        <path d="M20 4v7h-7" />
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

function formatLastUpdated(value) {
  if (!value) return "--";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "--";
  }

  const time = date.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const today = new Date();

  const isToday =
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();

  if (isToday) {
    return `${time} - Hôm nay`;
  }

  const day = date.toLocaleDateString("vi-VN");

  return `${time} - ${day}`;
}

function MobileTracking() {
  const { user } = useAuth();
  const [devices, setDevices] = useState([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const loadDevices = async () => {
    setIsLoading(true);
    setError("");

    try {
      const data = await getMyDevices();
      setDevices(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDevices();
  }, []);

  const userKey = `user_vehicles_${user?.id || user?.uid || "default"}`;
  const localVehicles = useMemo(() => {
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
  }, [userKey]);

  const normalize = (str) => (str || "").toString().trim().toLowerCase().replace(/[\s.-]/g, "");

  // 1. Devices that have an attached vehicle
  const devicesWithVehicle = useMemo(() => {
    return devices.filter((d) => {
      const v = d.vehicle || {};
      return Boolean(v.brand || v.model || v.license_plate || v.licensePlate);
    });
  }, [devices]);

  const devicePlates = useMemo(() => {
    return new Set(
      devicesWithVehicle
        .map((d) => normalize(d.vehicle?.license_plate || d.vehicle?.licensePlate))
        .filter(Boolean)
    );
  }, [devicesWithVehicle]);

  // 2. Strict Vehicle list (only actual vehicles, never raw unlinked IoT devices)
  const vehicles = useMemo(() => {
    return [
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
      // User local vehicles (not duplicated)
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
            ? devices.find(
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
  }, [devicesWithVehicle, localVehicles, devicePlates, devices]);

  const hasVehicles = vehicles.length > 0;
  const currentVehicle = hasVehicles
    ? (vehicles.find((v) => String(v.id) === String(selectedVehicleId)) || vehicles[0])
    : null;

  const currentDevice = currentVehicle?.device || null;
  const selectedDeviceId = currentDevice?.id || "";

  const {
    location: liveLocation,
    device: liveDevice,
    refreshing,
    error: locationError,
    lastUpdated,
    refreshLocation,
  } = useLocation(selectedDeviceId);

  const activeDevice = liveDevice || currentDevice;
  const latestLocation = liveLocation || getLatestLocation(activeDevice);
  const isOnline = getDeviceOnline(activeDevice);
  const vehicleName = currentVehicle?.name || "Chưa có phương tiện";
  const plate = currentVehicle?.plateNumber || "Chưa có biển số";
  const latitude = latestLocation?.latitude ?? "--";
  const longitude = latestLocation?.longitude ?? "--";
  const updatedAt = formatLastUpdated(lastUpdated);
  const hasLinkedDevice = Boolean(currentDevice);

  return (
    <div className="tracking-page pwa-tracking">
      <div className="tracking-heading-row">
        <div className="tracking-heading-left">
          <h1>Theo dõi vị trí</h1>
          <p>Giám sát thời gian thực phương tiện và thiết bị của bạn.</p>
        </div>

        <CustomSelect
          options={vehicles.map((v) => {
            const plateText = v.plateNumber ? ` – ${v.plateNumber}` : "";
            return {
              value: v.id,
              label: `${v.name}${plateText}`,
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

      {error && <p className="dashboard-load-error">{error}</p>}
      {locationError && (
        <p className="dashboard-load-error">
          {locationError}
        </p>
      )}

      {!hasVehicles && !isLoading ? (
        <div className="vehicles-empty" style={{ margin: "40px auto", maxWidth: "480px", textAlign: "center", background: "#ffffff", padding: "36px 24px", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
          <div className="vehicles-empty-icon">
            <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="#64748b" strokeWidth="1.5">
              <circle cx="6" cy="17" r="2.2" />
              <circle cx="18" cy="17" r="2.2" />
              <path d="M5 16h2l2.5-4h5L17 16h2M10 12 9 9h3M15 12l2-3h2" />
            </svg>
          </div>
          <h3 style={{ fontSize: "17px", fontWeight: "700", color: "#0f172a", margin: "14px 0 6px" }}>Chưa có phương tiện theo dõi</h3>
          <p style={{ fontSize: "13.5px", color: "#64748b", margin: "0 0 20px" }}>
            Tài khoản của bạn chưa có phương tiện nào. Hãy thêm phương tiện để bắt đầu theo dõi vị trí trực tuyến.
          </p>
          <Link to="/vehicles/add" className="pwa-continue-btn" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", justifyContent: "center", height: "44px", padding: "0 24px" }}>
            + Thêm phương tiện mới
          </Link>
        </div>
      ) : (
        <div className="tracking-grid">
          <section className="tracking-map-card pwa-tracking-map-card">
            <div className={`tracking-map ${!hasLinkedDevice ? "is-empty" : ""}`}>
              <MapView
                latitude={
                  typeof latestLocation?.latitude === "number"
                    ? latestLocation.latitude
                    : null
                }
                longitude={
                  typeof latestLocation?.longitude === "number"
                    ? latestLocation.longitude
                    : null
                }
                device={activeDevice}
              />
            </div>

            <button
              className="pwa-tracking-refresh-btn"
              type="button"
              onClick={refreshLocation}
              disabled={!hasLinkedDevice || refreshing}
            >
              <TrackingIcon type="refresh" />
              {refreshing ? "Đang cập nhật..." : "Cập nhật vị trí"}
            </button>
          </section>

          <aside className="tracking-side">
            <section className="pwa-tracking-vehicle-card">
              <div className="pwa-t-card-header">
                <h2>{vehicleName}</h2>
                <div className="pwa-t-status-row">
                  <span className="pwa-plate-pill">{plate}</span>
                  <span className={`status-pill ${hasLinkedDevice ? (isOnline ? "online" : "offline") : "offline"}`}>
                    <span className="status-dot" />
                    {hasLinkedDevice ? (isOnline ? "Đang hoạt động" : "Ngoại tuyến") : "Chưa gắn IoT"}
                  </span>
                </div>
              </div>

              <div className="pwa-t-location-block">
                <div className="pwa-t-location-row">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#0066cc" strokeWidth="2.2" aria-hidden="true">
                    <path d="M12 21s7-4.5 7-11a7 7 0 0 0-14 0c0 6.5 7 11 7 11z" />
                    <circle cx="12" cy="10" r="2.5" />
                  </svg>
                  <div>
                    <strong className="pwa-t-address">{latestLocation?.address || (hasLinkedDevice ? "Chưa có dữ liệu địa chỉ" : "Phương tiện chưa liên kết thiết bị IoT")}</strong>
                    <span className="pwa-t-coords">
                      {latitude !== "--" && longitude !== "--"
                        ? `Vĩ độ ${latitude}, Kinh độ ${longitude}`
                        : "Tọa độ: Chưa cập nhật"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pwa-t-signals-grid">
                <div className="pwa-t-signal-col">
                  <small>Tín hiệu GPS</small>
                  <strong className={hasLinkedDevice && (latestLocation || isOnline) ? "is-online" : "is-offline"}>
                    <span className="status-dot" />
                    {hasLinkedDevice ? (activeDevice?.gpsStatus || (latestLocation || isOnline ? "Hoạt động" : "Mất tín hiệu")) : "Chưa kết nối"}
                  </strong>
                </div>
                <div className="pwa-t-signal-col">
                  <small>Thiết bị {currentVehicle?.deviceCode || "--"}</small>
                  <strong className={hasLinkedDevice ? (isOnline ? "is-online" : "is-offline") : "is-offline"}>
                    <span className="status-dot" />
                    {hasLinkedDevice ? (isOnline ? "Trực tuyến" : "Ngoại tuyến") : "Chưa liên kết"}
                  </strong>
                </div>
              </div>

              <div className="pwa-t-footer">
                <small>Cập nhật cuối</small>
                <time>{updatedAt}</time>
              </div>
            </section>
          </aside>
        </div>
      )}
    </div>
  );
}

export default MobileTracking;
