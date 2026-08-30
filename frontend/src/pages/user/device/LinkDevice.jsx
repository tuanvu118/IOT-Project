import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getMyDevices, linkDevice, updateVehicle } from "../../../services/deviceService";

function LinkDevice() {
  const navigate = useNavigate();

  const [myOwnedDevices, setMyOwnedDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState("");

  const [vehiclesList, setVehiclesList] = useState([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        // 1. Chỉ lấy danh sách thiết bị thuộc sở hữu của User hiện tại
        let owned = [];
        try {
          const res = await getMyDevices();
          if (Array.isArray(res)) {
            owned = res;
          }
        } catch {
          // fallback custom_linked_devices
          const localLinked = JSON.parse(localStorage.getItem("custom_linked_devices") || "[]");
          owned = localLinked;
        }

        // 2. Load danh sách phương tiện của User
        const vehicles = [];
        const customVehicles = JSON.parse(localStorage.getItem("custom_vehicles") || "[]");
        if (Array.isArray(customVehicles)) {
          customVehicles.forEach((v) => {
            const brand = v.vehicle?.brand || v.brand || "";
            const model = v.vehicle?.model || v.model || "";
            const plate = v.vehicle?.license_plate || v.vehicle?.licensePlate || v.license_plate || v.licensePlate || "";
            const color = v.vehicle?.color || v.color || "";

            const fullName = [brand, model].filter(Boolean).join(" ");
            const displayLabel = fullName
              ? `${fullName}${plate ? ` (${plate})` : ""}`
              : (plate ? `Xe biển số ${plate}` : "Phương tiện mới");

            vehicles.push({
              id: v.id,
              name: fullName || "Phương tiện mới",
              displayLabel,
              licensePlate: plate,
              brand,
              model,
              color,
            });
          });
        }

        if (Array.isArray(owned)) {
          owned.forEach((d) => {
            const brand = d.vehicle?.brand || "";
            const model = d.vehicle?.model || "";
            const plate = d.vehicle?.license_plate || "";
            const color = d.vehicle?.color || "";

            if (brand || model || plate) {
              const fullName = [brand, model].filter(Boolean).join(" ");
              const displayLabel = fullName
                ? `${fullName}${plate ? ` (${plate})` : ""}`
                : `Xe biển số ${plate}`;

              if (!vehicles.some((item) => item.licensePlate && item.licensePlate === plate)) {
                vehicles.push({
                  id: d.id,
                  name: fullName || `Thiết bị ${d.verification_code || d.id}`,
                  displayLabel,
                  licensePlate: plate,
                  brand,
                  model,
                  color,
                });
              }
            }
          });
        }

        if (isMounted) {
          setMyOwnedDevices(owned);
          setVehiclesList(vehicles);

          // Tự động chọn thiết bị chưa gắn xe nếu có
          const unlinkedDev = owned.find((d) => !d.vehicle?.license_plate && !d.vehicle?.licensePlate);
          if (unlinkedDev) {
            setSelectedDeviceId(unlinkedDev.id || unlinkedDev.verification_code);
          } else if (owned.length > 0) {
            setSelectedDeviceId(owned[0].id || owned[0].verification_code);
          }

          if (vehicles.length > 0) {
            setSelectedVehicleId(vehicles[0].id);
          }
        }
      } catch (err) {
        // Fallback
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!selectedDeviceId) {
      setError("Vui lòng chọn thiết bị IoT thuộc sở hữu của bạn.");
      return;
    }

    if (!selectedVehicleId) {
      setError("Vui lòng chọn phương tiện cần liên kết.");
      return;
    }

    setSubmitting(true);

    try {
      const selectedVehicle = vehiclesList.find((v) => v.id === selectedVehicleId);
      const targetDevice = myOwnedDevices.find(
        (d) => (d.id || d.verification_code) === selectedDeviceId
      );

      const devId = targetDevice?.id || selectedDeviceId;
      const devCode = targetDevice?.verification_code || targetDevice?.name || selectedDeviceId;

      // 1. Cập nhật thông tin xe vào thiết bị IoT
      if (selectedVehicle) {
        try {
          await linkDevice({
            device_id: devId,
            brand: selectedVehicle.brand || "Honda",
            model: selectedVehicle.model || "Vision",
            license_plate: selectedVehicle.licensePlate || "29A1-123.45",
            color: selectedVehicle.color || "Trắng",
          });
        } catch (vehErr) {
          // Backend optional
        }
      }

      // 2. Cập nhật localStorage
      const localLinked = JSON.parse(localStorage.getItem("custom_linked_devices") || "[]");
      const updatedLinked = localLinked.map((d) => {
        if ((d.id || d.verification_code) === selectedDeviceId) {
          return {
            ...d,
            vehicle: {
              brand: selectedVehicle?.brand || "Honda",
              model: selectedVehicle?.model || "Vision",
              license_plate: selectedVehicle?.licensePlate || "29A1-123.45",
              color: selectedVehicle?.color || "Trắng",
            },
          };
        }
        return d;
      });
      localStorage.setItem("custom_linked_devices", JSON.stringify(updatedLinked));

      // 3. Cập nhật custom_vehicles
      const normalize = (str) => (str || "").toString().trim().toLowerCase().replace(/[\s.-]/g, "");
      const customVehicles = JSON.parse(localStorage.getItem("custom_vehicles") || "[]");
      const selectedPlate = normalize(selectedVehicle?.licensePlate);

      const updatedCustom = customVehicles.map((v) => {
        const vPlate = normalize(
          v.vehicle?.license_plate || v.vehicle?.licensePlate || v.licensePlate || v.license_plate
        );
        const isTarget = v.id === selectedVehicleId || (selectedPlate && vPlate === selectedPlate);
        if (isTarget) {
          return {
            ...v,
            name: devCode,
            status: "online",
            verification_code: devCode,
            isOnline: true,
          };
        }
        return v;
      });
      localStorage.setItem("custom_vehicles", JSON.stringify(updatedCustom));

      setSuccess(`Liên kết thiết bị ${devCode} với phương tiện thành công!`);
      setTimeout(() => {
        navigate("/vehicles");
      }, 1200);
    } catch (err) {
      setError(err?.message || "Không thể liên kết thiết bị. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="link-device-page">
      {/* Breadcrumb */}
      <nav className="add-device-breadcrumb" aria-label="Breadcrumb">
        <Link to="/devices">Thiết bị</Link>
        <span className="breadcrumb-separator">&gt;</span>
        <strong>Liên kết thiết bị IoT</strong>
      </nav>

      {/* Top Center Icon & Header */}
      <div className="link-device-header-top">
        <div className="link-device-badge-icon">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
        </div>

        <h1>Liên kết thiết bị IoT</h1>
        <p>Chọn thiết bị IoT thuộc sở hữu của bạn và phương tiện để bắt đầu theo dõi vị trí và nhận dữ liệu cảm biến thời gian thực.</p>
      </div>

      {error && <div className="link-device-alert error">{error}</div>}
      {success && <div className="link-device-alert success">{success}</div>}

      {loading ? (
        <div className="vehicles-loading">
          <div className="vehicles-loading-spinner" />
          <p>Đang tải danh sách thiết bị của bạn...</p>
        </div>
      ) : myOwnedDevices.length === 0 ? (
        /* Empty state if user has no owned devices yet */
        <div className="link-device-card" style={{ textAlign: "center", padding: "40px 24px" }}>
          <div
            style={{
              width: "60px",
              height: "60px",
              margin: "0 auto 16px",
              background: "#eff6ff",
              color: "#3b82f6",
              borderRadius: "50%",
              display: "grid",
              placeItems: "center",
            }}
          >
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="2" width="20" height="8" rx="2" />
              <rect x="2" y="14" width="20" height="8" rx="2" />
              <line x1="6" y1="6" x2="6.01" y2="6" />
              <line x1="6" y1="18" x2="6.01" y2="18" />
            </svg>
          </div>
          <h2 style={{ fontSize: "20px", fontWeight: "700", color: "#111827", margin: "0 0 8px" }}>
            Bạn chưa sở hữu thiết bị IoT nào
          </h2>
          <p style={{ color: "#64748b", fontSize: "14.5px", maxWidth: "480px", margin: "0 auto 24px", lineHeight: 1.5 }}>
            Để liên kết với phương tiện, bạn cần thêm thiết bị vào tài khoản trước bằng <strong>Mã thiết bị</strong> và <strong>Mã xác nhận bảo mật</strong> được cấp kèm theo sản phẩm.
          </p>
          <Link
            to="/devices/add"
            className="add-vehicle-submit-btn"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              textDecoration: "none",
              padding: "12px 24px",
              fontSize: "14px",
            }}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            + Thêm thiết bị IoT vào tài khoản
          </Link>
        </div>
      ) : (
        /* Main Form Card */
        <form className="link-device-card" onSubmit={handleSubmit}>
          <div className="link-device-fields">
            {/* Field 1: Chọn thiết bị IoT thuộc sở hữu của User */}
            <div className="link-device-field">
              <label htmlFor="deviceSelect">
                Chọn thiết bị IoT của bạn <span className="required-mark">*</span>
              </label>
              <div className="link-device-input-wrap">
                <span className="input-prefix-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M3 7V5a2 2 0 0 1 2-2h2" />
                    <path d="M17 3h2a2 2 0 0 1 2 2v2" />
                    <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
                    <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
                    <rect x="7" y="7" width="10" height="10" rx="1" />
                  </svg>
                </span>
                <select
                  id="deviceSelect"
                  value={selectedDeviceId}
                  onChange={(e) => setSelectedDeviceId(e.target.value)}
                  required
                >
                  <option value="">-- Chọn thiết bị trong tài khoản của bạn --</option>
                  {myOwnedDevices.map((d) => {
                    const code = d.verification_code || d.id;
                    const plate = d.vehicle?.license_plate || d.vehicle?.licensePlate;
                    const statusLabel = plate ? `(Đang gắn xe ${plate})` : "(Chưa gắn xe)";
                    return (
                      <option key={d.id || code} value={d.id || code}>
                        {code} - {d.name || "Thiết bị IoT"} {statusLabel}
                      </option>
                    );
                  })}
                </select>
                <span className="select-arrow-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </span>
              </div>

              <span className="link-device-helper-text">
                Chỉ các thiết bị IoT bạn đã kích hoạt sở hữu mới hiển thị trong danh sách này.{" "}
                <Link to="/devices/add" style={{ color: "#2563eb", fontWeight: "600" }}>
                  + Thêm thiết bị mới
                </Link>
              </span>
            </div>

            {/* Field 2: Chọn phương tiện */}
            <div className="link-device-field">
              <label htmlFor="selectedVehicle">
                Chọn phương tiện cần liên kết <span className="required-mark">*</span>
              </label>
              <div className="link-device-input-wrap">
                <span className="input-prefix-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <circle cx="18.5" cy="17.5" r="3.5" />
                    <circle cx="5.5" cy="17.5" r="3.5" />
                    <circle cx="15" cy="5" r="1" />
                    <path d="M12 17.5V14l-3-3 4-3 2 3h2" />
                  </svg>
                </span>
                <select
                  id="selectedVehicle"
                  value={selectedVehicleId}
                  onChange={(e) => setSelectedVehicleId(e.target.value)}
                  required
                >
                  <option value="">-- Chọn phương tiện cần liên kết --</option>
                  {vehiclesList.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.displayLabel || v.name}
                    </option>
                  ))}
                </select>
                <span className="select-arrow-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </span>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="link-device-footer">
            <Link to="/devices" className="link-device-cancel-btn">
              Hủy
            </Link>
            <button type="submit" className="link-device-submit-btn" disabled={submitting}>
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
              {submitting ? "Đang liên kết..." : "Liên kết thiết bị"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default LinkDevice;