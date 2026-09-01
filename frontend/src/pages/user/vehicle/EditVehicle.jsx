import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getDeviceById, updateVehicle, unlinkDevice } from "../../../services/deviceService";
import { validateLicensePlate } from "../../../utils/validators";

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

function EditVehicle() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [device, setDevice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [unlinking, setUnlinking] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    brand: "",
    model: "",
    color: "",
    license_plate: "",
  });

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      if (!id) return;
      setLoading(true);
      setError("");

      try {
        // Check in custom vehicles first if local
        if (id.startsWith("veh-")) {
          const customVehicles = JSON.parse(localStorage.getItem("custom_vehicles") || "[]");
          const found = customVehicles.find((v) => v.id === id);
          if (found && isMounted) {
            setDevice(found);
            const veh = found.vehicle || {};
            setFormData({
              brand: veh.brand || "",
              model: veh.model || "",
              color: veh.color || "",
              license_plate: veh.license_plate || veh.licensePlate || "",
            });
            setLoading(false);
            return;
          }
        }

        const data = await getDeviceById(id);
        if (isMounted && data) {
          setDevice(data);
          const vehicle = data.vehicle || {};
          setFormData({
            brand: vehicle.brand || "",
            model: vehicle.model || "",
            color: vehicle.color || "",
            license_plate: vehicle.license_plate || vehicle.licensePlate || "",
          });
        }
      } catch (err) {
        if (isMounted) {
          setError("Không thể tải thông tin phương tiện. Vui lòng thử lại.");
        }
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
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.brand.trim() || !formData.model.trim()) {
      setError("Vui lòng nhập Thương hiệu và Model xe.");
      return;
    }

    const plateErr = validateLicensePlate(formData.license_plate);
    if (plateErr) {
      setError(plateErr);
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      if (id.startsWith("veh-") || device?.status === "unlinked" || device?.status === 1) {
        const customVehicles = JSON.parse(localStorage.getItem("custom_vehicles") || "[]");
        const updated = customVehicles.map((v) => {
          if (v.id === id) {
            return {
              ...v,
              name: device?.name ?? v.name ?? null,
              status: device?.status ?? v.status ?? "unlinked",
              verification_code: device?.verification_code ?? v.verification_code ?? null,
              vehicle: {
                ...v.vehicle,
                brand: formData.brand.trim(),
                model: formData.model.trim(),
                color: formData.color.trim(),
                license_plate: formData.license_plate.trim(),
                licensePlate: formData.license_plate.trim(),
              },
            };
          }
          return v;
        });
        localStorage.setItem("custom_vehicles", JSON.stringify(updated));
      } else {
        await updateVehicle(id, {
          brand: formData.brand.trim(),
          model: formData.model.trim(),
          color: formData.color.trim(),
          license_plate: formData.license_plate.trim(),
        });
      }

      setSuccess("Cập nhật thông tin phương tiện thành công!");
      setTimeout(() => {
        navigate("/vehicles");
      }, 1000);
    } catch (err) {
      setError(err?.message || "Có lỗi xảy ra khi lưu thay đổi. Vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  };

  const handleUnlink = async () => {
    if (!window.confirm("Bạn có chắc chắn muốn gỡ liên kết thiết bị IoT khỏi phương tiện này?")) {
      return;
    }

    setUnlinking(true);
    setError("");
    setSuccess("");

    try {
      const devCode = device?.verification_code || device?.name || id;

      // 1. Call backend API to unlink device
      if (!id.startsWith("veh-")) {
        try {
          await unlinkDevice(id);
        } catch (apiErr) {
          // Backend optional
        }
      }

      // 2. Keep the unlinked IoT device in available/unlinked devices list
      const customLinked = JSON.parse(localStorage.getItem("custom_linked_devices") || "[]");
      const filteredLinked = customLinked.filter((d) => d.id !== id && d.verification_code !== devCode);
      filteredLinked.push({
        id: id,
        verification_code: devCode,
        name: devCode,
        status: 0,
        vehicle: null,
      });
      localStorage.setItem("custom_linked_devices", JSON.stringify(filteredLinked));

      // 3. Update local state immediately WITHOUT reloading or navigating away
      setDevice((prev) => ({
        ...prev,
        name: null,
        status: "unlinked",
        isOnline: false,
      }));

      // 4. Save unlinked vehicle entry to custom_vehicles storage
      const unlinkedVehicleId = id.startsWith("veh-") ? id : `veh-${Date.now()}`;
      const unlinkedVehicleEntry = {
        id: unlinkedVehicleId,
        name: null,
        status: "unlinked",
        isOnline: false,
        image: device?.image || null,
        config: { anti_thief: false },
        vehicle: {
          brand: formData.brand.trim(),
          model: formData.model.trim(),
          color: formData.color.trim(),
          license_plate: formData.license_plate.trim(),
          licensePlate: formData.license_plate.trim(),
        },
      };

      const customVehicles = JSON.parse(localStorage.getItem("custom_vehicles") || "[]");
      const filtered = customVehicles.filter((v) => v.id !== id);
      filtered.push(unlinkedVehicleEntry);
      localStorage.setItem("custom_vehicles", JSON.stringify(filtered));

      setSuccess("Đã gỡ liên kết thiết bị IoT thành công. Thiết bị vẫn có trong Danh sách thiết bị (ở trạng thái 'Chưa liên kết').");
    } catch (err) {
      setError(err?.message || "Không thể gỡ liên kết thiết bị.");
    } finally {
      setUnlinking(false);
    }
  };

  const [deletingVehicle, setDeletingVehicle] = useState(false);

  const handleDeleteVehicle = async () => {
    const vehName = `${formData.brand} ${formData.model}`.trim() || "phương tiện";
    if (!window.confirm(`Bạn có chắc chắn muốn xóa phương tiện "${vehName} (${formData.license_plate})"?`)) {
      return;
    }

    setDeletingVehicle(true);
    try {
      if (id && !id.startsWith("veh-")) {
        try {
          await unlinkDevice(id);
        } catch {}
      }

      const normalize = (str) => (str || "").toString().trim().toLowerCase().replace(/[\s.-]/g, "");
      const targetPlate = normalize(formData.license_plate);

      const customVehicles = JSON.parse(localStorage.getItem("custom_vehicles") || "[]");
      const updatedCustom = customVehicles.filter((v) => {
        const vPlate = normalize(
          v.vehicle?.license_plate || v.vehicle?.licensePlate || v.licensePlate || v.license_plate
        );
        const isTarget = v.id === id || (targetPlate && vPlate === targetPlate);
        return !isTarget;
      });
      localStorage.setItem("custom_vehicles", JSON.stringify(updatedCustom));

      const customLinked = JSON.parse(localStorage.getItem("custom_linked_devices") || "[]");
      const devCode = device?.verification_code || device?.name || id;
      const updatedLinked = customLinked.map((d) => {
        if (d.id === id || d.verification_code === devCode) {
          return { ...d, vehicle: null };
        }
        return d;
      });
      localStorage.setItem("custom_linked_devices", JSON.stringify(updatedLinked));

      navigate("/vehicles");
    } catch (err) {
      setError(err?.message || "Không thể xóa phương tiện.");
    } finally {
      setDeletingVehicle(false);
    }
  };

  const isLinked = Boolean(device?.name && device?.status !== "unlinked");
  const isOnline = getDeviceOnline(device);
  const deviceName = isLinked ? device.name : "Chưa liên kết";

  return (
    <div className="edit-vehicle-page">
      {/* Breadcrumbs */}
      <nav className="add-vehicle-breadcrumb" aria-label="Breadcrumb" style={{ marginBottom: "16px" }}>
        <Link to="/vehicles">Phương tiện</Link>
        <span className="breadcrumb-separator">&gt;</span>
        <strong>Chỉnh sửa phương tiện</strong>
      </nav>

      <div className="edit-vehicle-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", marginBottom: "20px" }}>
        <div>
          <h1 style={{ margin: 0 }}>Chỉnh sửa phương tiện</h1>
          <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: "14px" }}>
            Cập nhật thông tin chi tiết của phương tiện và quản lý liên kết thiết bị IoT.
          </p>
        </div>
        <Link to="/vehicles" className="app-back-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Quay lại danh sách
        </Link>
      </div>

      {error && <div className="edit-vehicle-alert error">{error}</div>}
      {success && <div className="edit-vehicle-alert success">{success}</div>}

      {loading ? (
        <div className="vehicles-loading">
          <div className="vehicles-loading-spinner" />
          <p>Đang tải thông tin phương tiện...</p>
        </div>
      ) : (
        <form className="edit-vehicle-card" onSubmit={handleSubmit}>
          <div className="edit-vehicle-card-content">
            {/* Section 1: Basic Information */}
            <section className="edit-vehicle-section">
              <div className="edit-vehicle-section-title">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M5 16h2l2.5-4h5L17 16h2" />
                  <circle cx="6" cy="17" r="2.2" />
                  <circle cx="18" cy="17" r="2.2" />
                  <path d="M10 12 9 9h3M15 12l2-3h2" />
                </svg>
                <h2>Thông tin cơ bản</h2>
              </div>

              <div className="edit-vehicle-grid">
                <div className="edit-vehicle-field">
                  <label htmlFor="brand">
                    Thương hiệu <span className="required-star">*</span>
                  </label>
                  <input
                    type="text"
                    id="brand"
                    name="brand"
                    placeholder="VD: Honda"
                    value={formData.brand}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="edit-vehicle-field">
                  <label htmlFor="model">
                    Model <span className="required-star">*</span>
                  </label>
                  <input
                    type="text"
                    id="model"
                    name="model"
                    placeholder="VD: Vision 2024"
                    value={formData.model}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="edit-vehicle-field">
                  <label htmlFor="color">Màu sắc</label>
                  <input
                    type="text"
                    id="color"
                    name="color"
                    placeholder="VD: Trắng"
                    value={formData.color}
                    onChange={handleChange}
                  />
                </div>

                <div className="edit-vehicle-field">
                  <label htmlFor="license_plate">
                    Biển số <span className="required-star">*</span>
                  </label>
                  <input
                    type="text"
                    id="license_plate"
                    name="license_plate"
                    placeholder="VD: 29A1-123.45"
                    value={formData.license_plate}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </section>

            <hr className="edit-vehicle-divider" />

            {/* Section 2: Linked Device */}
            <section className="edit-vehicle-section">
              <div className="edit-vehicle-section-title">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M4 15h16v5H4z" />
                  <path d="M8 15v-4a4 4 0 0 1 8 0v4" />
                  <path d="M7 18h.01M17 18h.01M12 7V4m-4 2L6 4m10 2 2-2" />
                </svg>
                <h2>Thiết bị đang liên kết</h2>
              </div>

              {isLinked ? (
                <div className="linked-device-box">
                  <div className="linked-device-left">
                    <div className="linked-device-icon">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <rect x="4" y="4" width="16" height="16" rx="2" />
                        <rect x="9" y="9" width="6" height="6" />
                        <path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3" />
                      </svg>
                    </div>
                    <div className="linked-device-info">
                      <strong>{deviceName}</strong>
                      <span>Đã kết nối</span>
                    </div>
                  </div>

                  <div className="linked-device-right">
                    <span className={`linked-device-badge ${isOnline ? "online" : "offline"}`}>
                      {isOnline ? "Trực tuyến" : "Ngoại tuyến"}
                    </span>
                    <button
                      type="button"
                      className="unlink-device-btn"
                      title="Gỡ liên kết thiết bị"
                      onClick={handleUnlink}
                      disabled={unlinking}
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
                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                        <line x1="2" y1="2" x2="22" y2="22" />
                      </svg>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="linked-device-box unlinked-box" style={{ background: "#f8fafc", border: "1.5px dashed #cbd5e1" }}>
                  <div className="linked-device-left">
                    <div className="linked-device-icon" style={{ background: "#94a3b8" }}>
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <rect x="4" y="4" width="16" height="16" rx="2" />
                        <rect x="9" y="9" width="6" height="6" />
                        <path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3" />
                      </svg>
                    </div>
                    <div className="linked-device-info">
                      <strong style={{ color: "#64748b" }}>Chưa liên kết thiết bị IoT</strong>
                      <span>Phương tiện này hiện chưa gắn thiết bị giám sát</span>
                    </div>
                  </div>

                  <div className="linked-device-right">
                    <Link
                      to="/devices/link"
                      className="edit-vehicle-save-btn"
                      style={{ height: "36px", padding: "0 16px", fontSize: "13px", textDecoration: "none" }}
                    >
                      + Liên kết IoT
                    </Link>
                  </div>
                </div>
              )}

              <div className="linked-device-note">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
                <span>Để thay đổi thiết bị IoT, vui lòng gỡ liên kết hiện tại trước.</span>
              </div>
            </section>
          </div>

          {/* Bottom Footer Actions */}
          <div className="edit-vehicle-footer">
            <button
              type="button"
              className="edit-vehicle-delete-btn"
              onClick={handleDeleteVehicle}
              disabled={deletingVehicle}
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
              {deletingVehicle ? "Đang xóa..." : "Xóa phương tiện"}
            </button>

            <div className="edit-vehicle-actions-right">
              <Link to="/vehicles" className="edit-vehicle-cancel-btn">
                Hủy
              </Link>
              <button
                type="submit"
                className="edit-vehicle-save-btn"
                disabled={saving}
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
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                  <polyline points="17 21 17 13 7 13 7 21" />
                  <polyline points="7 3 7 8 15 8" />
                </svg>
                {saving ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}

export default EditVehicle;