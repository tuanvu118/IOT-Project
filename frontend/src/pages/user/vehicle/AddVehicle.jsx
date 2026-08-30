import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getMyDevices, updateVehicle } from "../../../services/deviceService";

function AddVehicle() {
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
    e.preventDefault();
    if (!formData.brand.trim() || !formData.model.trim() || !formData.license_plate.trim()) {
      setError("Vui lòng điền đầy đủ các thông tin: Thương hiệu, Model và Biển số xe.");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      // Create new vehicle entry without fake IoT device
      const newVehicleId = `veh-${Date.now()}`;
      const newVehicleEntry = {
        id: newVehicleId,
        name: null, // Chưa liên kết thiết bị IoT
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

      const existingCustom = JSON.parse(localStorage.getItem("custom_vehicles") || "[]");
      existingCustom.push(newVehicleEntry);
      localStorage.setItem("custom_vehicles", JSON.stringify(existingCustom));

      // If there's an unassigned device in backend, we can attach to it
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
      }, 1000);
    } catch (err) {
      setError(err?.message || "Không thể thêm phương tiện. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="add-vehicle-page">
      {/* Breadcrumbs */}
      <nav className="add-vehicle-breadcrumb" aria-label="Breadcrumb">
        <Link to="/vehicles">Phương tiện</Link>
        <span className="breadcrumb-separator">&gt;</span>
        <strong>Thêm phương tiện</strong>
      </nav>

      {error && <div className="add-vehicle-alert error">{error}</div>}
      {success && <div className="add-vehicle-alert success">{success}</div>}

      <form className="add-vehicle-card" onSubmit={handleSubmit}>
        <div className="add-vehicle-header">
          <h1>Thêm phương tiện</h1>
        </div>

        <hr className="add-vehicle-divider" />

        {/* Section: Thông tin phương tiện */}
        <section className="add-vehicle-section">
          <h2 className="add-vehicle-section-title">Thông tin phương tiện</h2>

          <div className="add-vehicle-grid">
            <div className="add-vehicle-field">
              <label htmlFor="brand">Thương hiệu</label>
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

            <div className="add-vehicle-field">
              <label htmlFor="model">Model</label>
              <input
                type="text"
                id="model"
                name="model"
                placeholder="VD: SH 150i"
                value={formData.model}
                onChange={handleChange}
                required
              />
            </div>

            <div className="add-vehicle-field">
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

            <div className="add-vehicle-field">
              <label htmlFor="license_plate">Biển số xe</label>
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

        {/* Section: Ảnh phương tiện */}
        <section className="add-vehicle-section">
          <h2 className="add-vehicle-section-title">Ảnh phương tiện</h2>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageChange}
            accept="image/png, image/jpeg, image/jpg"
            style={{ display: "none" }}
          />

          <div
            className={`add-vehicle-upload-box ${imagePreview ? "has-image" : ""}`}
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
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="add-vehicle-upload-content">
                <div className="add-vehicle-upload-icon">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
                    <path d="M12 12v9" />
                    <path d="m16 16-4-4-4 4" />
                  </svg>
                </div>
                <strong>Chọn ảnh</strong>
                <span>PNG, JPG tối đa 5MB</span>
              </div>
            )}
          </div>
        </section>

        <hr className="add-vehicle-divider" />

        {/* Footer Actions */}
        <div className="add-vehicle-footer">
          <Link to="/vehicles" className="add-vehicle-cancel-btn">
            Hủy
          </Link>
          <button
            type="submit"
            className="add-vehicle-submit-btn"
            disabled={submitting}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            {submitting ? "Đang thêm..." : "Thêm phương tiện"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddVehicle;