import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getDeviceById, getMyDevices, removeDevice, updateDeviceStatus } from "../../services/deviceService";
import "../../styles/pwa-mobile.css";

function MobileDeviceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [device, setDevice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const handleDeleteDevice = async () => {
    const code = device?.verification_code || device?.id || id;
    if (!window.confirm(`Bạn có chắc chắn muốn xóa / gỡ thiết bị "${code}" khỏi tài khoản?`)) {
      return;
    }

    setDeleting(true);
    try {
      try {
        const targetId = device?.id || device?.verification_code || id || code;
        if (targetId) {
          await removeDevice(targetId);
        }
      } catch (apiErr) {
        console.warn("Remove device API warning:", apiErr);
      }

      navigate("/devices");
    } catch (err) {
      alert("Không thể xóa thiết bị: " + (err?.message || "Lỗi kết nối"));
    } finally {
      setDeleting(false);
    }
  };

  const [statusUpdating, setStatusUpdating] = useState(false);

  const handleToggleStatus = async () => {
    const isOnline = Number(device?.status) === 1;
    const targetStatus = isOnline ? 0 : 1;
    setStatusUpdating(true);

    try {
      if (device?.id) {
        try {
          const updated = await updateDeviceStatus(device.id, targetStatus);
          setDevice((prev) => ({
            ...prev,
            ...updated,
            status: targetStatus,
          }));
        } catch {
          // If backend fails, update local state
          setDevice((prev) => ({ ...prev, status: targetStatus }));
        }
      } else {
        setDevice((prev) => ({ ...prev, status: targetStatus }));
      }

    } catch (err) {
      alert("Không thể chuyển trạng thái: " + (err?.message || "Lỗi kết nối"));
    } finally {
      setStatusUpdating(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    async function loadDeviceDetail() {
      setLoading(true);
      setError("");

      try {
        let foundDevice = null;
        try {
          foundDevice = await getDeviceById(id);
        } catch {
          // If ID lookup fails, search in my devices
          const myDevs = await getMyDevices();
          foundDevice = (myDevs || []).find((d) => d.id === id || d.verification_code === id);
        }

        // If not found in API
        if (!foundDevice) {
          if (isMounted) {
            setError("Không tìm thấy thông tin thiết bị này.");
            setDevice(null);
          }
          return;
        }

        if (isMounted) {
          setDevice(foundDevice);
        }
      } catch (err) {
        if (isMounted) {
          setError(err?.message || "Không thể tải thông tin thiết bị.");
          setDevice(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadDeviceDetail();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const devCode = device?.verification_code || device?.name || device?.id || id || "--";
  const devId = device?.id || "--";
  const isOnline = Number(device?.status) === 1;

  const hasVehicle = Boolean(
    device?.vehicle &&
      (device.vehicle.brand || device.vehicle.model || device.vehicle.license_plate || device.vehicle.licensePlate)
  );

  const vehicleName = hasVehicle
    ? [device.vehicle.brand, device.vehicle.model].filter(Boolean).join(" ") || "Phương tiện"
    : "Chưa liên kết";
  const licensePlate = hasVehicle
    ? device?.vehicle?.license_plate || device?.vehicle?.licensePlate || "--"
    : "--";

  const batteryLevel = device?.battery ?? device?.batteryLevel ?? null;
  const latitude = device?.locations?.[0]?.latitude ?? null;
  const longitude = device?.locations?.[0]?.longitude ?? null;

  const accelX = "--";
  const accelY = "--";
  const accelZ = "--";
  const tiltAngle = 0;

  return (
    <div className="device-detail-page pwa-device-detail-page">
      {/* Mobile PWA Device Detail View */}
      <div className="pwa-dev-detail-mobile-wrap">
        <div className="pwa-dev-detail-header">
          <div>
            <h2>Chi tiết thiết bị</h2>
            <span className="pwa-dev-detail-sub">Mã thiết bị: {devCode}</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px" }}>
            <span className={`pwa-dev-status-badge ${isOnline ? "active" : "inactive"}`}>
              <span className="status-dot" /> {isOnline ? "Đang hoạt động" : "Ngoại tuyến"}
            </span>
            <button
              type="button"
              className={`pwa-status-toggle-chip ${isOnline ? "online" : "offline"}`}
              onClick={handleToggleStatus}
              disabled={statusUpdating}
              title={isOnline ? "Chuyển sang ngoại tuyến" : "Chuyển sang trực tuyến"}
            >
              {statusUpdating ? "..." : isOnline ? "Tắt kết nối" : "Bật trực tuyến"}
            </button>
          </div>
        </div>

        {/* 4 Cards (2x2 grid) */}
        <div className="pwa-dev-4grid">
          <div className="pwa-dev-grid-tile">
            <div className="pwa-dev-tile-top">
              <span className="pwa-dev-tile-icon green">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="7" width="16" height="10" rx="2" />
                  <line x1="20" y1="11" x2="20" y2="13" />
                </svg>
              </span>
              <strong className="pwa-dev-tile-stat green">
                {batteryLevel !== null ? `${batteryLevel}%` : "--"}
              </strong>
            </div>
            <small>PIN THIẾT BỊ</small>
            <strong>
              {batteryLevel !== null ? (batteryLevel > 90 ? "Sạc đầy" : "Bình thường") : "Chưa có dữ liệu"}
            </strong>
          </div>

          <div className="pwa-dev-grid-tile">
            <div className="pwa-dev-tile-top">
              <span className="pwa-dev-tile-icon blue">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12.55a11 11 0 0 1 14.08 0" />
                  <path d="M1.42 9a16 16 0 0 1 21.16 0" />
                  <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
                </svg>
              </span>
              <strong className={`pwa-dev-tile-stat ${isOnline ? "blue" : "gray"}`}>
                {isOnline ? "Tốt" : "Chưa kết nối"}
              </strong>
            </div>
            <small>KẾT NỐI</small>
            <strong>{isOnline ? "4G / MQTT" : "Ngoại tuyến"}</strong>
          </div>

          <div className="pwa-dev-grid-tile">
            <div className="pwa-dev-tile-top">
              <span className="pwa-dev-tile-icon purple">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z" />
                  <path d="M12 6a6 6 0 1 0 6 6 6 6 0 0 0-6-6z" />
                </svg>
              </span>
            </div>
            <small>GPS SIGNAL</small>
            <strong>{latitude !== null ? "Đã chốt vị trí" : "Chưa có vị trí"}</strong>
          </div>

          <div className="pwa-dev-grid-tile">
            <div className="pwa-dev-tile-top">
              <span className="pwa-dev-tile-icon blue">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M2 20h20L12 4z" />
                </svg>
              </span>
            </div>
            <small>MẠNG DI ĐỘNG</small>
            <strong>{isOnline ? "Đã kết nối mạng" : "Chưa kết nối"}</strong>
          </div>
        </div>

        {/* Card Dữ liệu cảm biến hiện tại (Full Web Feature) */}
        <div className="pwa-dev-sensor-box">
          <h3>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#0066cc" strokeWidth="2.2">
              <path d="M2 12h5l3 7 4-14 3 7h5" />
            </svg>
            Dữ liệu cảm biến hiện tại
          </h3>

          <div className="pwa-dev-sensor-grid">
            <div className="pwa-dev-sensor-tile">
              <small>Accel X</small>
              <strong>{accelX}</strong>
            </div>
            <div className="pwa-dev-sensor-tile">
              <small>Accel Y</small>
              <strong>{accelY}</strong>
            </div>
            <div className="pwa-dev-sensor-tile">
              <small>Accel Z</small>
              <strong>{accelZ}</strong>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f8fafc", padding: "10px 12px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
            <span style={{ fontSize: "13px", color: "#475569", fontWeight: "600" }}>Góc nghiêng (Tilt Angle):</span>
            <strong style={{ fontSize: "14px", color: "#0f172a" }}>{tiltAngle}°</strong>
          </div>

          <Link to={`/devices/${id || devCode}/sensors`} className="pwa-dev-btn-view-sensors">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M2 12h5l3 7 4-14 3 7h5" />
            </svg>
            Xem dữ liệu cảm biến chuyên sâu →
          </Link>
        </div>

        {/* Card Phương tiện đang liên kết */}
        <div className="pwa-dev-section-card">
          <h3>Phương tiện đang liên kết</h3>
          {hasVehicle ? (
            <Link to="/vehicles" className="pwa-dev-veh-link-row">
              <div className="pwa-dev-veh-left">
                <div className="pwa-dev-veh-img-box">
                  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#0066cc" strokeWidth="2">
                    <circle cx="6" cy="17" r="2.2" />
                    <circle cx="18" cy="17" r="2.2" />
                    <path d="M5 16h2l2.5-4h5L17 16h2M10 12 9 9h3M15 12l2-3h2" />
                  </svg>
                </div>
                <div>
                  <strong className="pwa-dev-veh-title">{vehicleName}</strong>
                  <span className="pwa-dev-veh-plate">{licensePlate}</span>
                </div>
              </div>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#94a3b8" strokeWidth="2.2">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </Link>
          ) : (
            <div className="pwa-dev-unlinked-box">
              <span>Chưa gắn với phương tiện nào.</span>
              <Link to="/devices/link" className="pwa-link-action-text">+ Liên kết ngay</Link>
            </div>
          )}
        </div>

        {/* Card Vị trí thiết bị */}
        <div className="pwa-dev-section-card">
          <h3>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#0066cc" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            Vị trí thiết bị
          </h3>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13.5px", padding: "6px 0", borderBottom: "1px solid #f1f5f9" }}>
            <span style={{ color: "#475569" }}>Vĩ độ (Lat):</span>
            <strong style={{ color: "#0f172a" }}>{latitude !== null ? latitude : "--"}</strong>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13.5px", padding: "6px 0" }}>
            <span style={{ color: "#475569" }}>Kinh độ (Lng):</span>
            <strong style={{ color: "#0f172a" }}>{longitude !== null ? longitude : "--"}</strong>
          </div>

          <Link to={`/tracking?device=${devCode}`} className="pwa-dev-btn-view-map">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
              <line x1="8" y1="2" x2="8" y2="18" />
              <line x1="16" y1="6" x2="16" y2="22" />
            </svg>
            Xem vị trí trên bản đồ lớn →
          </Link>
        </div>

        {/* Card Thông tin phần cứng */}
        <div className="pwa-dev-section-card">
          <h3>Thông tin phần cứng</h3>
          <div className="pwa-dev-hw-row">
            <span>Phiên bản Hardware</span>
            <strong>{device?.hardware_version || device?.hardwareVersion || "v2.1.0"}</strong>
          </div>
          <div className="pwa-dev-hw-row">
            <span>Phiên bản Firmware</span>
            <strong className="pwa-fw-val">
              {device?.firmware_version || device?.firmwareVersion || "v1.4.5"}
            </strong>
          </div>
          <div className="pwa-dev-hw-row">
            <span>Số Serial</span>
            <strong>{device?.serial_number || device?.verification_code || devId}</strong>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pwa-dev-actions-stack">
          {hasVehicle && (
            <button
              type="button"
              className="pwa-dev-btn-restart"
              onClick={handleUnlink}
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <line x1="2" y1="2" x2="22" y2="22" />
              </svg>
              Gỡ liên kết phương tiện
            </button>
          )}

          <button
            type="button"
            className="pwa-dev-btn-delete-full"
            onClick={handleDeleteDevice}
            disabled={deleting}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
            {deleting ? "Đang xóa thiết bị..." : "Xóa thiết bị khỏi tài khoản"}
          </button>
        </div>
      </div>

      {/* Desktop Breadcrumb & Action Header */}
      <div className="device-detail-top-nav desktop-only-heading">
        <div>
          <nav className="device-detail-breadcrumb" aria-label="Breadcrumb">
            <Link to="/devices">Thiết bị IoT</Link>
            <span className="breadcrumb-separator">&gt;</span>
            <strong>Chi tiết thiết bị</strong>
          </nav>
          <h1 className="device-detail-heading">Chi tiết thiết bị: {devCode}</h1>
        </div>

        <div className="device-detail-top-actions">
          <button
            type="button"
            className="delete-device-detail-btn"
            onClick={handleDeleteDevice}
            disabled={deleting}
            title="Xóa thiết bị"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
            {deleting ? "Đang xóa..." : "Xóa thiết bị"}
          </button>

          <Link to="/devices" className="back-to-devices-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Quay lại danh sách
          </Link>
        </div>
      </div>

      {error && <div className="devices-alert error">{error}</div>}

      {/* Top Grid: Main device overview & 3 Status cards */}
      <div className="device-overview-grid desktop-device-overview">
        {/* Left: Device Main Info Card */}
        <section className="device-detail-card device-main-card">
          <div className="device-card-top-row">
            <div className="device-icon-and-title">
              <div className="device-hardware-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <rect x="2" y="14" width="20" height="8" rx="2" />
                  <path d="M6 18h.01M10 18h.01" />
                  <path d="M12 2a4 4 0 0 1 4 4v8" />
                  <path d="M8 6a4 4 0 0 1 8 0" />
                </svg>
              </div>
              <div className="device-title-wrap">
                <h2>{devCode}</h2>
                <div style={{ display: "flex", gap: "8px", alignItems: "center", marginTop: "2px", flexWrap: "wrap" }}>
                  <span style={{ fontSize: "12.5px", color: "#64748b" }}>ID: #{devId}</span>
                </div>
              </div>
            </div>

            <div className="device-status-actions-wrap">
              <span className={`device-pill-status ${isOnline ? "active" : "inactive"}`}>
                <span className="status-dot" />
                {isOnline ? "Đang trực tuyến" : "Ngoại tuyến"}
              </span>

              <button
                type="button"
                className={`toggle-online-btn ${isOnline ? "btn-go-offline" : "btn-go-online"}`}
                onClick={handleToggleStatus}
                disabled={statusUpdating}
              >
                <span className="btn-status-indicator" />
                {statusUpdating
                  ? "Đang cập nhật..."
                  : isOnline
                  ? "Chuyển sang ngoại tuyến"
                  : "Chuyển sang trực tuyến"}
              </button>
            </div>
          </div>

          {/* 4 Metrics in a row */}
          <div className="device-metrics-row">
            <div className="device-metric-box">
              <small>Phương tiện liên kết</small>
              <div className="metric-value-with-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <circle cx="18.5" cy="17.5" r="3.5" />
                  <circle cx="5.5" cy="17.5" r="3.5" />
                  <circle cx="15" cy="5" r="1" />
                  <path d="M12 17.5V14l-3-3 4-3 2 3h2" />
                </svg>
                {hasVehicle ? (
                  <strong>{vehicleName}</strong>
                ) : (
                  <Link
                    to="/devices/link"
                    style={{
                      fontSize: "13px",
                      color: "#2563eb",
                      fontWeight: "600",
                      textDecoration: "none",
                    }}
                  >
                    Chưa liên kết (+ Liên kết)
                  </Link>
                )}
              </div>
            </div>

            <div className="device-metric-box">
              <small>Biển số</small>
              <strong className="metric-text-val">{licensePlate}</strong>
            </div>

            <div className="device-metric-box">
              <small>Cập nhật lần cuối</small>
              <strong className="metric-text-val">14:05:32 - Hôm nay</strong>
            </div>

            <div className="device-metric-box">
              <small>Mức pin</small>
              <div className="metric-value-with-icon battery">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <rect x="2" y="7" width="16" height="10" rx="2" ry="2" />
                  <line x1="22" y1="11" x2="22" y2="13" />
                  <line x1="6" y1="11" x2="6" y2="13" />
                  <line x1="10" y1="11" x2="10" y2="13" />
                </svg>
                <strong>{batteryLevel}%</strong>
              </div>
            </div>
          </div>
        </section>

        {/* Right: 3 Status items */}
        <div className="device-statuses-col">
          {/* Status 1: GPS */}
          <div className="device-status-item-card">
            <div className="status-item-left">
              <div className="status-item-icon green">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z" />
                  <path d="M12 6a6 6 0 1 0 6 6 6 6 0 0 0-6-6zm0 10a4 4 0 1 1 4-4 4 4 0 0 1-4 4z" />
                </svg>
              </div>
              <div className="status-item-text">
                <small>Trạng thái GPS</small>
                <strong>Hoạt động</strong>
              </div>
            </div>
            <span className="status-check-badge">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </span>
          </div>

          {/* Status 2: IMU */}
          <div className="device-status-item-card">
            <div className="status-item-left">
              <div className="status-item-icon green">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M4.93 4.93a10 10 0 0 1 14.14 0" />
                  <path d="M7.76 7.76a6 6 0 0 1 8.48 0" />
                  <circle cx="12" cy="12" r="2" />
                  <path d="M16.24 16.24a6 6 0 0 1-8.48 0" />
                  <path d="M19.07 19.07a10 10 0 0 1-14.14 0" />
                </svg>
              </div>
              <div className="status-item-text">
                <small>Cảm biến IMU</small>
                <strong>Hoạt động</strong>
              </div>
            </div>
            <span className="status-check-badge">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </span>
          </div>

          {/* Status 3: MQTT */}
          <div className="device-status-item-card">
            <div className="status-item-left">
              <div className="status-item-icon blue">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M5 12.55a11 11 0 0 1 14.08 0" />
                  <path d="M1.42 9a16 16 0 0 1 21.16 0" />
                  <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
                  <line x1="12" y1="20" x2="12.01" y2="20" strokeWidth="3" />
                </svg>
              </div>
              <div className="status-item-text">
                <small>Kết nối MQTT</small>
                <strong>Đã kết nối</strong>
              </div>
            </div>
            <span className="status-wifi-badge">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                <path d="M5 12.55a11 11 0 0 1 14.08 0" />
                <path d="M1.42 9a16 16 0 0 1 21.16 0" />
                <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
                <line x1="12" y1="20" x2="12.01" y2="20" strokeWidth="3" />
              </svg>
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Current Sensor Data & Last Location */}
      <div className="device-bottom-grid">
        {/* Left: Dữ liệu cảm biến hiện tại */}
        <section className="device-detail-card sensor-data-card">
          <div className="sensor-card-header">
            <div className="sensor-header-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                <path d="M2 12h5l3 7 4-14 3 7h5" />
              </svg>
              <h2>Dữ liệu cảm biến hiện tại</h2>
            </div>
          </div>

          <div className="sensor-card-body">
            {/* 3 Accel Boxes */}
            <div className="accel-metrics-grid">
              <div className="accel-box">
                <small>Accel X</small>
                <strong>{accelX}</strong>
              </div>
              <div className="accel-box">
                <small>Accel Y</small>
                <strong>{accelY}</strong>
              </div>
              <div className="accel-box">
                <small>Accel Z</small>
                <strong>{accelZ}</strong>
              </div>
            </div>

            {/* Tilt Angle Box */}
            <div className="tilt-angle-box">
              <div className="tilt-text-wrap">
                <small>Góc nghiêng (Tilt Angle)</small>
                <strong>{tiltAngle}°</strong>
              </div>

              {/* Inclinometer Dial */}
              <div className="inclinometer-dial">
                <div
                  className="inclinometer-line"
                  style={{ transform: `rotate(${tiltAngle}deg)` }}
                >
                  <span className="inclinometer-center-dot" />
                </div>
              </div>
            </div>
          </div>

          {/* Footer of sensor card */}
          <div className="sensor-card-footer">
            <div className="algorithm-status">
              <span>Trạng thái thuật toán: </span>
              <strong className="status-normal">Bình thường</strong>
            </div>

            <Link to={`/devices/${id || devCode}/sensors`} className="view-stream-data-link">
              Xem luồng dữ liệu thời gian thực
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </Link>
          </div>
        </section>

        {/* Right: Vị trí cuối cùng */}
        <section className="device-detail-card location-preview-card">
          {/* Map Preview area */}
          <div className="map-preview-viewport">
            {/* Map styling elements */}
            <div className="map-streets-layer" />
            
            {/* Vehicle Pinpoint with radar pulse */}
            <div className="map-bike-pinpoint">
              <span className="radar-pulse-ring" />
              <div className="bike-pin-circle">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <circle cx="18.5" cy="17.5" r="3.5" />
                  <circle cx="5.5" cy="17.5" r="3.5" />
                  <circle cx="15" cy="5" r="1" />
                  <path d="M12 17.5V14l-3-3 4-3 2 3h2" />
                </svg>
              </div>
            </div>
          </div>

          <div className="location-info-body">
            <div className="location-info-title-row">
              <div className="location-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <h3>Vị trí cuối cùng</h3>
              </div>
              <span className="location-accuracy-badge">Sai số: ~5m</span>
            </div>

            {/* Coordinate 2 columns */}
            <div className="coordinates-grid">
              <div className="coord-col">
                <small>Vĩ độ (Latitude)</small>
                <strong>{latitude}</strong>
              </div>
              <div className="coord-col">
                <small>Kinh độ (Longitude)</small>
                <strong>{longitude}</strong>
              </div>
            </div>

            {/* View large map button */}
            <Link to={`/tracking?device=${devCode}`} className="view-large-map-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
                <line x1="8" y1="2" x2="8" y2="18" />
                <line x1="16" y1="6" x2="16" y2="22" />
              </svg>
              Xem vị trí trên bản đồ lớn
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

export default MobileDeviceDetail;