import { useEffect, useMemo, useState } from "react";
import { getMyDevices } from "../../../services/deviceService";
import MapView from "../../../components/map/MapView";
import useLocation from "../../../hooks/useLocation";

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

function Tracking() {
  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const {
    location: liveLocation,
    device: liveDevice,
    refreshing,
    error: locationError,
    lastUpdated,
    refreshLocation,
  } = useLocation(selectedDeviceId);

  const selectedDevice = useMemo(
    () => devices.find((device) => device.id === selectedDeviceId) || devices[0] || null,
    [devices, selectedDeviceId],
  );
  const currentDevice = liveDevice || selectedDevice;
  const latestLocation =
    liveLocation || getLatestLocation(selectedDevice);
  const isOnline = getDeviceOnline(currentDevice);
  const vehicleName = getVehicleName(currentDevice);
  const plate = getLicensePlate(currentDevice);
  const latitude = latestLocation?.latitude ?? "--";
  const longitude = latestLocation?.longitude ?? "--";
  const updatedAt = formatLastUpdated(lastUpdated);

  const loadDevices = async () => {
    setIsLoading(true);
    setError("");

    try {
      const data = await getMyDevices();
      setDevices(data || []);
      setSelectedDeviceId((currentId) => currentId || data?.[0]?.id || "");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDevices();
  }, []);

  return (
    <div className="tracking-page">
      <div className="tracking-heading-row">
        <div>
          <h1>Theo dõi vị trí</h1>
          <p>Theo dõi vị trí hiện tại của phương tiện.</p>
        </div>

        <div className="tracking-actions">
          <select
            aria-label="Chọn phương tiện"
            value={selectedDevice?.id || ""}
            onChange={(event) => setSelectedDeviceId(event.target.value)}
            disabled={devices.length === 0}
          >
            {devices.length > 0 ? (
              devices.map((device) => (
                <option value={device.id} key={device.id}>
                  {getVehicleName(device)} ({getLicensePlate(device)})
                </option>
              ))
            ) : (
              <option>Chưa có phương tiện</option>
            )}
          </select>

          <button
            className="tracking-refresh-desktop"
            type="button"
            onClick={refreshLocation}
            disabled={!selectedDeviceId || refreshing}
          >
            <TrackingIcon type="refresh" />
            {refreshing ? "Đang cập nhật..." : "Cập nhật vị trí"}
          </button>
        </div>
      </div>

      {error && <p className="dashboard-load-error">{error}</p>}
      {locationError && (
        <p className="dashboard-load-error">
          {locationError}
        </p>
      )}

      <div className="tracking-grid">
        <section className="tracking-map-card">
          <div className="tracking-map-status">
            <span />
            {isOnline ? "Kết nối ổn định" : "Chưa có kết nối"}
          </div>

          <div className={`tracking-map ${!selectedDevice ? "is-empty" : ""}`}>
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
              device={currentDevice}
            />
          </div>
          <button
            className="tracking-refresh-mobile"
            type="button"
            onClick={refreshLocation}
            disabled={!selectedDeviceId || refreshing}
          >
            <TrackingIcon type="refresh" />
              {refreshing ? "Đang cập nhật..." : "Cập nhật vị trí"}
          </button>
        </section>

        <aside className="tracking-side">
          <section className="tracking-vehicle-card">
            <div className="tracking-vehicle-title">
              <h2>{vehicleName}</h2>
              <span className={isOnline ? "online" : ""}>{isOnline ? "Trực tuyến" : "Ngoại tuyến"}</span>
            </div>
            <strong>{plate}</strong>

            <div className="tracking-info-row">
              <span>
                <TrackingIcon type="pin" />
              </span>
              <div>
                <small>VỊ TRÍ HIỆN TẠI</small>
                <p>{latestLocation?.address || "Chưa có địa chỉ"}</p>
              </div>
            </div>

            <div className="tracking-info-row">
              <span>
                <TrackingIcon type="gps" />
              </span>
              <div>
                <small>TỌA ĐỘ</small>
                <p>
                  {latitude} / {longitude}
                </p>
              </div>
            </div>
          </section>

          <div className="tracking-mini-grid">
            <section>
              <TrackingIcon type="gps" />
              <small>TRẠNG THÁI GPS</small>
              <strong>
                {currentDevice?.gpsStatus ||
                (latestLocation ? "Hoạt động" : "Chưa có dữ liệu")}
              </strong>
            </section>
            <section>
              <TrackingIcon type="device" />
              <small>THIẾT BỊ</small>
              <strong>
                {currentDevice?.name || currentDevice?.id || "--"}
              </strong>
            </section>
          </div>

          <section className="tracking-update-card">
            <TrackingIcon type="clock" />
            <div>
              <small>CẬP NHẬT CUỐI</small>
              <strong>{updatedAt}</strong>
            </div>
            <button
              type="button"
              onClick={refreshLocation}
              disabled={!selectedDeviceId || refreshing}
              aria-label="Làm mới vị trí"
            >
              <TrackingIcon type="refresh" />
            </button>
          </section>
        </aside>
      </div>
    </div>
  );
}

export default Tracking;
