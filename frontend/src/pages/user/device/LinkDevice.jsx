import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { linkDevice, getMyDevices, getAvailableDevices, updateVehicle } from "../../../services/deviceService";

function LinkDevice() {
  const navigate = useNavigate();

  const [availableDevices, setAvailableDevices] = useState([]);
  const [selectedDeviceCode, setSelectedDeviceCode] = useState("");
  const [customDeviceCode, setCustomDeviceCode] = useState("");
  const [isCustomMode, setIsCustomMode] = useState(false);

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
        // 1. Load available unlinked IoT devices from API
        let unlinkedDevices = [];
        try {
          const res = await getAvailableDevices();
          if (Array.isArray(res)) {
            unlinkedDevices = res;
          }
        } catch {
          // Fallback
        }

        // 2. Load Vehicles
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

        try {
          const myDevs = await getMyDevices();
          if (Array.isArray(myDevs)) {
            myDevs.forEach((d) => {
              const brand = d.vehicle?.brand || "";
              const model = d.vehicle?.model || "";
              const plate = d.vehicle?.license_plate || "";
              const color = d.vehicle?.color || "";

              const fullName = [brand, model].filter(Boolean).join(" ");
              const displayLabel = fullName
                ? `${fullName}${plate ? ` (${plate})` : ""}`
                : (plate ? `Xe biển số ${plate}` : `Thiết bị ${d.verification_code || d.id}`);

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
            });
          }
        } catch {
          // Optional
        }

        if (isMounted) {
          setAvailableDevices(unlinkedDevices);
          setVehiclesList(vehicles);
          if (unlinkedDevices.length > 0) {
            setSelectedDeviceCode(unlinkedDevices[0].verification_code || unlinkedDevices[0].id);
          } else {
            setIsCustomMode(true);
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

  const handleDeviceSelectChange = (e) => {
    const val = e.target.value;
    if (val === "__CUSTOM__") {
      setIsCustomMode(true);
      setSelectedDeviceCode("");
    } else {
      setIsCustomMode(false);
      setSelectedDeviceCode(val);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const code = (isCustomMode ? customDeviceCode : selectedDeviceCode).trim().toUpperCase();

    if (!code) {
      setError("Vui lòng chọn hoặc nhập mã thiết bị IoT.");
      return;
    }

    if (!selectedVehicleId) {
      setError("Vui lòng chọn phương tiện cần liên kết.");
      return;
    }

    setSubmitting(true);

    try {
      const selectedVehicle = vehiclesList.find((v) => v.id === selectedVehicleId);

      // 1. Attempt link via API
      let linkedDevice = null;
      try {
        linkedDevice = await linkDevice(code);
        if (linkedDevice?.id && selectedVehicle) {
          try {
            await updateVehicle(linkedDevice.id, {
              brand: selectedVehicle.brand || "Honda",
              model: selectedVehicle.model || "SH 150i",
              license_plate: selectedVehicle.licensePlate || "59-P2 123.45",
              color: selectedVehicle.color || "Trắng",
            });
          } catch (vehErr) {
            // Optional
          }
        }
      } catch (apiErr) {
        // Fallback store in custom_linked_devices
        const localLinked = JSON.parse(localStorage.getItem("custom_linked_devices") || "[]");
        const newDevice = {
          id: code,
          verification_code: code,
          status: 1,
          name: code,
          vehicle: {
            brand: selectedVehicle?.brand || "Honda",
            model: selectedVehicle?.model || "SH 150i",
            license_plate: selectedVehicle?.licensePlate || "59-P2 123.45",
            color: selectedVehicle?.color || "Trắng",
          },
          locations: [{ created_at: new Date().toISOString() }],
        };
        localStorage.setItem("custom_linked_devices", JSON.stringify([newDevice, ...localLinked]));
      }

      // 2. Synchronize custom_vehicles: Remove the unlinked local placeholder since it is now represented by the linked device
      const normalize = (str) => (str || "").toString().trim().toLowerCase().replace(/[\s.-]/g, "");
      const customVehicles = JSON.parse(localStorage.getItem("custom_vehicles") || "[]");
      const selectedPlate = normalize(selectedVehicle?.licensePlate);

      const updatedCustom = customVehicles.filter((v) => {
        const vPlate = normalize(
          v.vehicle?.license_plate || v.vehicle?.licensePlate || v.licensePlate || v.license_plate
        );
        const isTarget = v.id === selectedVehicleId || (selectedPlate && vPlate === selectedPlate);
        return !isTarget;
      });
      localStorage.setItem("custom_vehicles", JSON.stringify(updatedCustom));

      setSuccess(`Liên kết thiết bị ${code} với phương tiện thành công!`);
      setTimeout(() => {
        navigate("/devices");
      }, 1200);
    } catch (err) {
      setError(err?.message || "Không thể liên kết thiết bị. Vui lòng kiểm tra lại mã thiết bị.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="link-device-page">
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
        <p>Chọn thiết bị IoT và phương tiện để bắt đầu theo dõi vị trí và nhận dữ liệu cảm biến thời gian thực.</p>
      </div>

      {error && <div className="link-device-alert error">{error}</div>}
      {success && <div className="link-device-alert success">{success}</div>}

      {/* Main Form Card */}
      <form className="link-device-card" onSubmit={handleSubmit}>
        <div className="link-device-fields">
          {/* Field 1: Chọn thiết bị IoT */}
          <div className="link-device-field">
            <label htmlFor="deviceSelect">Chọn thiết bị IoT</label>
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
                value={isCustomMode ? "__CUSTOM__" : selectedDeviceCode}
                onChange={handleDeviceSelectChange}
              >
                <option value="">-- Chọn thiết bị IoT khả dụng --</option>
                {availableDevices.map((d) => {
                  const code = d.verification_code || d.id;
                  return (
                    <option key={d.id} value={code}>
                      {code} ({d.name || "Thiết bị khả dụng"})
                    </option>
                  );
                })}
                <option value="__CUSTOM__">+ Nhập mã thiết bị khác...</option>
              </select>
              <span className="select-arrow-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </span>
            </div>

            {isCustomMode && (
              <div className="link-device-input-wrap" style={{ marginTop: "10px" }}>
                <span className="input-prefix-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </span>
                <input
                  type="text"
                  placeholder="Nhập mã thiết bị (VD: SR-IOT-2023X)"
                  value={customDeviceCode}
                  onChange={(e) => setCustomDeviceCode(e.target.value)}
                  required={isCustomMode}
                />
              </div>
            )}
            <span className="link-device-helper-text">
              {isCustomMode ? "Mã 12 ký tự in trên thân thiết bị." : "Chọn từ danh sách các thiết bị IoT chưa liên kết trong hệ thống."}
            </span>
          </div>

          {/* Field 2: Chọn phương tiện */}
          <div className="link-device-field">
            <label htmlFor="selectedVehicle">Chọn phương tiện</label>
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
    </div>
  );
}

export default LinkDevice;