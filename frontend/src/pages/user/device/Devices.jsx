import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyDevices, unlinkDevice, updateDeviceStatus } from "../../../services/deviceService";

function formatLastUpdated(device) {
  const loc = device?.locations?.[0];
  if (!loc?.created_at) {
    return device?.status === 1 ? "Vài giây trước" : "2 giờ trước";
  }

  const date = new Date(loc.created_at);
  if (Number.isNaN(date.getTime())) return "Vừa xong";

  const diffMinutes = Math.max(0, Math.floor((Date.now() - date.getTime()) / 60000));
  if (diffMinutes < 1) return "Vài giây trước";
  if (diffMinutes < 60) return `${diffMinutes} phút trước`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} giờ trước`;
  return `${Math.floor(diffHours / 24)} ngày trước`;
}

function Devices() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingStatusId, setUpdatingStatusId] = useState(null);

  const loadDevices = async () => {
    setLoading(true);
    setError("");

    try {
      // 1. Get devices linked to current user
      const data = await getMyDevices();
      let list = Array.isArray(data) ? data : [];

      setDevices(list);
    } catch (err) {
      setError(err?.message || "Không thể tải danh sách thiết bị.");
      setDevices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleDeviceStatus = async (device) => {
    const isOnline = Number(device.status) === 1;
    const targetStatus = isOnline ? 0 : 1;
    const targetKey = device.id || device.verification_code;
    setUpdatingStatusId(targetKey);

    try {
      if (device.id) {
        try {
          await updateDeviceStatus(device.id, targetStatus);
        } catch {
          // fallback
        }
      }

      setDevices((prev) =>
        prev.map((d) =>
          (d.id || d.verification_code) === targetKey
            ? { ...d, status: targetStatus }
            : d
        )
      );

      try {
        const localLinked = JSON.parse(localStorage.getItem("custom_linked_devices") || "[]");
        const updatedLocal = localLinked.map((d) =>
          (d.id || d.verification_code) === targetKey ? { ...d, status: targetStatus } : d
        );
        localStorage.setItem("custom_linked_devices", JSON.stringify(updatedLocal));
      } catch {
        // ignore
      }
    } catch (err) {
      alert("Không thể chuyển trạng thái: " + (err?.message || "Lỗi"));
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const handleDeleteDevice = async (device) => {
    const code = device.verification_code || device.id;
    if (!window.confirm(`Bạn có chắc chắn muốn xóa / gỡ thiết bị "${code}" khỏi tài khoản?`)) {
      return;
    }

    try {
      // 1. Unlink via API
      try {
        const targetId = device.id || device.verification_code || code;
        if (targetId) {
          await unlinkDevice(targetId);
        }
      } catch (apiErr) {
        console.warn("Unlink API warning:", apiErr);
      }

      // 2. Remove from custom_linked_devices
      const localLinked = JSON.parse(localStorage.getItem("custom_linked_devices") || "[]");
      const updatedLocal = localLinked.filter(
        (d) => (d.id || d.verification_code) !== (device.id || device.verification_code)
      );
      localStorage.setItem("custom_linked_devices", JSON.stringify(updatedLocal));

      // 3. Preserve the vehicle in custom_vehicles as an unlinked vehicle
      const v = device.vehicle;
      const normalize = (str) => (str || "").toString().trim().toLowerCase().replace(/[\s.-]/g, "");
      const plate = v?.license_plate || v?.licensePlate;
      const targetPlate = normalize(plate);

      const customVehicles = JSON.parse(localStorage.getItem("custom_vehicles") || "[]");
      let foundInCustom = false;

      const updatedVehicles = customVehicles.map((item) => {
        const itemPlate = normalize(
          item.vehicle?.license_plate || item.vehicle?.licensePlate || item.licensePlate || item.license_plate
        );
        if (
          item.name === code ||
          item.verification_code === code ||
          item.deviceId === device.id ||
          (targetPlate && itemPlate === targetPlate)
        ) {
          foundInCustom = true;
          return {
            ...item,
            name: null,
            verification_code: null,
            deviceId: null,
            status: "unlinked",
            isOnline: false,
          };
        }
        return item;
      });

      // If this vehicle was created with the device and wasn't in custom_vehicles yet, preserve it!
      if (!foundInCustom && (v?.brand || v?.model || plate)) {
        const newUnlinkedVehicle = {
          id: `veh-${Date.now()}`,
          brand: v.brand || "",
          model: v.model || "",
          color: v.color || "",
          license_plate: plate || "",
          vehicle: {
            brand: v.brand || "",
            model: v.model || "",
            color: v.color || "",
            license_plate: plate || "",
          },
          status: "unlinked",
          isOnline: false,
          name: null,
          verification_code: null,
          deviceId: null,
        };
        updatedVehicles.push(newUnlinkedVehicle);
      }

      localStorage.setItem("custom_vehicles", JSON.stringify(updatedVehicles));

      // 4. Update UI state
      setDevices((prev) =>
        prev.filter((d) => (d.id || d.verification_code) !== (device.id || device.verification_code))
      );
    } catch (err) {
      alert("Không thể xóa thiết bị: " + (err?.message || "Lỗi không xác định"));
    }
  };

  useEffect(() => {
    loadDevices();
  }, []);

  return (
    <div className="devices-page">
      {/* Top Header */}
      <div className="devices-page-header">
        <div className="devices-heading-left">
          <h1>Danh sách thiết bị</h1>
          <p>Quản lý và giám sát các thiết bị IoT đã liên kết với phương tiện của bạn.</p>
        </div>

        <div className="devices-heading-actions">
          <Link to="/devices/add" className="add-device-btn">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Thêm thiết bị
          </Link>

          <Link to="/devices/link" className="link-device-btn">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
            Liên kết thiết bị
          </Link>
        </div>
      </div>

      {error && <div className="devices-alert error">{error}</div>}

      {/* Devices Table Card */}
      <div className="devices-table-card">
        {loading ? (
          <div className="devices-loading-state">
            <div className="vehicles-loading-spinner" />
            <p>Đang tải danh sách thiết bị...</p>
          </div>
        ) : devices.length === 0 ? (
          <div className="devices-empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <rect x="2" y="2" width="20" height="8" rx="2" />
              <rect x="2" y="14" width="20" height="8" rx="2" />
              <line x1="6" y1="6" x2="6.01" y2="6" />
              <line x1="6" y1="18" x2="6.01" y2="18" />
            </svg>
            <h3>Chưa có thiết bị nào</h3>
            <p>Nhập mã thiết bị được in trên thân thiết bị IoT bạn đã mua để bắt đầu giám sát.</p>
            <div style={{ display: "flex", gap: "10px", marginTop: "6px" }}>
              <Link to="/devices/add" className="add-device-btn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Thêm thiết bị
              </Link>
            </div>
          </div>
        ) : (
          <div className="devices-table-responsive">
            <table className="devices-table">
              <thead>
                <tr>
                  <th>MÃ THIẾT BỊ</th>
                  <th>PHƯƠNG TIỆN</th>
                  <th>BIỂN SỐ XE</th>
                  <th>TRẠNG THÁI</th>
                  <th>CẬP NHẬT CUỐI</th>
                  <th>HÀNH ĐỘNG</th>
                </tr>
              </thead>
              <tbody>
                {devices.map((device) => {
                  const code = device.verification_code || device.id || "N/A";
                  const hasVehicle = Boolean(
                    device.vehicle &&
                    (device.vehicle.brand || device.vehicle.model || device.vehicle.license_plate)
                  );
                  const vehicleName = hasVehicle
                    ? `${device.vehicle.brand || ""} ${device.vehicle.model || ""}`.trim()
                    : "Chưa liên kết";
                  const licensePlate = (hasVehicle && device.vehicle?.license_plate)
                    ? device.vehicle.license_plate
                    : "--";
                  const isOnline = Number(device.status) === 1;
                  const lastUpdated = formatLastUpdated(device);

                  return (
                    <tr key={device.id || code}>
                      <td className="device-code-cell">
                        <strong>{code}</strong>
                      </td>
                      <td className="device-vehicle-cell">
                        {hasVehicle ? (
                          vehicleName
                        ) : (
                          <Link
                            to="/devices/link"
                            title="Nhấn để liên kết phương tiện với thiết bị này"
                            style={{
                              color: "#2563eb",
                              fontWeight: "600",
                              textDecoration: "none",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                              background: "#eff6ff",
                              padding: "4px 8px",
                              borderRadius: "4px",
                              fontSize: "12px",
                            }}
                          >
                            + Liên kết xe
                          </Link>
                        )}
                      </td>
                      <td className="device-plate-cell">{licensePlate}</td>
                      <td className="device-status-cell">
                        <div className="device-status-cell-inner">
                          <span className={`device-status-badge ${isOnline ? "online" : "offline"}`}>
                            <span className="status-dot" />
                            {isOnline ? "TRỰC TUYẾN" : "NGOẠI TUYẾN"}
                          </span>
                          <button
                            type="button"
                            className={`device-status-toggle-btn ${isOnline ? "btn-turn-off" : "btn-turn-on"}`}
                            onClick={() => handleToggleDeviceStatus(device)}
                            disabled={updatingStatusId === (device.id || code)}
                            title={isOnline ? "Nhấn để chuyển sang ngoại tuyến" : "Nhấn để chuyển sang trực tuyến"}
                          >
                            {updatingStatusId === (device.id || code) ? (
                              <span className="mini-spinner" />
                            ) : isOnline ? (
                              "Tắt kết nối"
                            ) : (
                              "Bật trực tuyến"
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="device-updated-cell">{lastUpdated}</td>
                      <td className="device-actions-cell">
                        <div className="device-actions-group">
                          <Link to={`/devices/${device.id || code}`} className="device-action-link">
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              aria-hidden="true"
                            >
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                            Xem chi tiết
                          </Link>
                          <button
                            type="button"
                            className="device-delete-btn"
                            title="Xóa thiết bị"
                            onClick={() => handleDeleteDevice(device)}
                          >
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              aria-hidden="true"
                            >
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Devices;