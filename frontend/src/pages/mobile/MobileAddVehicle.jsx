import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { getMyDevices, updateVehicle } from "../../services/deviceService";
import { validateLicensePlate } from "../../utils/validators";
import "../../styles/pwa-mobile.css";

function MobileAddVehicle() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    brand: "",
    model: "",
    color: "",
    license_plate: "",
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Vui lòng chọn định dạng ảnh (PNG, JPG).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Dung lượng ảnh tối đa là 5MB.");
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = (e) => {
    e.stopPropagation();
    setImagePreview(null);
    setImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    if (!formData.brand.trim() || !formData.model.trim()) {
      setError("Vui lòng nhập Thương hiệu và Model xe.");
      return;
    }

    const plateErr = validateLicensePlate(formData.license_plate);
    if (plateErr) {
      setError(plateErr);
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const userKey = `user_vehicles_${user?.id || user?.uid || "default"}`;
      const existingVehicles = JSON.parse(localStorage.getItem(userKey) || "[]");

      const newEntry = {
        id: `veh-${Date.now()}`,
        deviceId: null,
        name: null,
        status: "unlinked",
        isOnline: false,
        image: imagePreview || null,
        config: { anti_thief: false },
        vehicle: {
          brand: formData.brand.trim(),
          model: formData.model.trim(),
          color: formData.color.trim(),
          license_plate: formData.license_plate.trim(),
          licensePlate: formData.license_plate.trim(),
        },
      };

      existingVehicles.push(newEntry);
      localStorage.setItem(userKey, JSON.stringify(existingVehicles));

      // Also synchronize to custom_vehicles (used by desktop web)
      const existingCustom = JSON.parse(localStorage.getItem("custom_vehicles") || "[]");
      existingCustom.push(newEntry);
      localStorage.setItem("custom_vehicles", JSON.stringify(existingCustom));

      // If there's an unassigned device in backend, attach to it
      try {
        const devices = await getMyDevices();
        const unassigned = (devices || []).find((d) => !d.vehicle?.license_plate && !d.vehicle?.brand);
        if (unassigned) {
          await updateVehicle(unassigned.id, {
            brand: formData.brand.trim(),
            model: formData.model.trim(),
            color: formData.color.trim(),
            license_plate: formData.license_plate.trim(),
          });
        }
      } catch (backendErr) {
        // Backend optional
      }

      setSuccess("Thêm phương tiện mới thành công!");
      setTimeout(() => {
        navigate("/vehicles");
      }, 600);
    } catch (err) {
      setError(err?.message || "Không thể thêm phương tiện. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="add-vehicle-page pwa-add-vehicle-page">
      {/* Breadcrumbs (Desktop only) */}
      <nav className="add-vehicle-breadcrumb desktop-only-heading" aria-label="Breadcrumb">
        <Link to="/vehicles">Phương tiện</Link>
        <span className="breadcrumb-separator">&gt;</span>
        <strong>Thêm phương tiện</strong>
      </nav>

      {error && <div className="add-vehicle-alert error">{error}</div>}
      {success && <div className="add-vehicle-alert success">{success}</div>}

      <form className="add-vehicle-card pwa-form-card" onSubmit={handleSubmit}>
        <div className="add-vehicle-header desktop-only-heading" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
          <div>
            <h1>Thêm phương tiện</h1>
            <p className="add-device-subtitle" style={{ margin: "4px 0 0", color: "#64748b", fontSize: "14px" }}>
              Nhập thông tin phương tiện mới để quản lý và liên kết với thiết bị IoT.
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

        {/* Section 1: Ảnh phương tiện (on top as in Figma) */}
        <section className="add-vehicle-section pwa-upload-section">
          <label className="pwa-form-label">Ảnh phương tiện</label>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageChange}
            accept="image/png, image/jpeg, image/jpg"
            style={{ display: "none" }}
          />

          <div
            className={`pwa-dashed-upload-box ${imagePreview ? "has-image" : ""}`}
            onClick={() => fileInputRef.current?.click()}
          >
            {imagePreview ? (
              <div className="add-vehicle-preview-wrap">
                <img src={imagePreview} alt="Xem trước xe" className="add-vehicle-preview-img" />
                <button
                  type="button"
                  className="add-vehicle-remove-img"
                  onClick={handleRemoveImage}
                  title="Xóa ảnh"
                >
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="pwa-upload-placeholder">
                <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="#64748b" strokeWidth="1.8" aria-hidden="true">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
                <strong>Nhấn để tải ảnh lên</strong>
              </div>
            )}
          </div>
          <span className="pwa-upload-subtext">Định dạng hỗ trợ: JPG, PNG. Tối đa 5MB.</span>
        </section>

        {/* Section 2: Thông tin phương tiện */}
        <section className="add-vehicle-section">
          <div className="pwa-form-fields-list">
            <div className="pwa-field-group">
              <label htmlFor="brand">Thương hiệu</label>
              <input
                type="text"
                id="brand"
                name="brand"
                placeholder="VD: Honda, Yamaha..."
                value={formData.brand}
                onChange={handleChange}
                required
              />
            </div>

            <div className="pwa-field-group">
              <label htmlFor="model">Model</label>
              <input
                type="text"
                id="model"
                name="model"
                placeholder="VD: Airblade 150"
                value={formData.model}
                onChange={handleChange}
                required
              />
            </div>

            <div className="pwa-field-group">
              <label htmlFor="color">Màu sắc</label>
              <input
                type="text"
                id="color"
                name="color"
                placeholder="VD: Đen nhám"
                value={formData.color}
                onChange={handleChange}
              />
            </div>

            <div className="pwa-field-group">
              <label htmlFor="license_plate">Biển số xe</label>
              <input
                type="text"
                id="license_plate"
                name="license_plate"
                placeholder="VD: 29A1-12345"
                value={formData.license_plate}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </section>

        {/* Footer Dual Actions */}
        <div className="pwa-form-actions-row">
          <Link to="/vehicles" className="pwa-btn-cancel">
            Hủy
          </Link>
          <button
            type="submit"
            className="pwa-btn-submit"
            disabled={submitting}
            onClick={handleSubmit}
          >
            {submitting ? "Đang thêm..." : "Thêm phương tiện"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default MobileAddVehicle;