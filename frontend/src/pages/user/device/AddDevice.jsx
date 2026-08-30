import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { addUserDevice } from "../../../services/deviceService";

function AddDevice() {
  const navigate = useNavigate();

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    verification_code: "",
    name: "",
    brand: "",
    model: "",
    color: "",
    license_plate: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "verification_code" ? value.toUpperCase() : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const code = formData.verification_code.trim().toUpperCase();
    if (!code) {
      setError("Vui lòng nhập mã thiết bị IoT (in trên thân thiết bị).");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      // Gọi API kiểm tra mã thiết bị trong CSDL và liên kết vào tài khoản
      const addedDevice = await addUserDevice({
        verification_code: code,
        name: formData.name.trim() || null,
        brand: formData.brand.trim() || null,
        model: formData.model.trim() || null,
        color: formData.color.trim() || null,
        license_plate: formData.license_plate.trim() || null,
      });

      // Đồng bộ vào localStorage custom_linked_devices nếu cần
      try {
        const localLinked = JSON.parse(localStorage.getItem("custom_linked_devices") || "[]");
        const filtered = localLinked.filter(
          (d) => (d.verification_code || d.id) !== (addedDevice.verification_code || addedDevice.id)
        );
        localStorage.setItem("custom_linked_devices", JSON.stringify([addedDevice, ...filtered]));
      } catch {
        // ignore
      }

      setSuccess(
        `Kích hoạt và thêm thiết bị "${addedDevice?.name || code}" (${code}) thành công!`
      );

      setTimeout(() => {
        navigate("/devices");
      }, 1200);
    } catch (err) {
      // Backend sẽ trả về lỗi nếu mã không tồn tại trong DB hoặc đã bị kích hoạt bởi tài khoản khác
      setError(
        err?.message ||
          "Không thể thêm thiết bị. Vui lòng kiểm tra lại mã in trên thiết bị hoặc liên hệ quản trị viên."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="add-device-page">
      {/* Breadcrumbs */}
      <nav className="add-device-breadcrumb" aria-label="Breadcrumb">
        <Link to="/devices">Thiết bị</Link>
        <span className="breadcrumb-separator">&gt;</span>
        <strong>Thêm thiết bị IoT</strong>
      </nav>

      {error && <div className="add-device-alert error">{error}</div>}
      {success && <div className="add-device-alert success">{success}</div>}

      <form className="add-device-card" onSubmit={handleSubmit}>
        <div className="add-device-header">
          <div className="add-device-header-icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="2" y="2" width="20" height="8" rx="2" />
              <rect x="2" y="14" width="20" height="8" rx="2" />
              <line x1="6" y1="6" x2="6.01" y2="6" />
              <line x1="6" y1="18" x2="6.01" y2="18" />
            </svg>
          </div>
          <div>
            <h1>Thêm thiết bị IoT vào tài khoản</h1>
            <p className="add-device-subtitle">
              Nhập mã định danh được in trên thân thiết bị IoT bạn đã mua từ hệ thống để kích hoạt và giám sát.
            </p>
          </div>
        </div>

        <hr className="add-device-divider" />

        {/* Section: Xác thực thiết bị */}
        <section className="add-device-section">
          <h2 className="add-device-section-title">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            Xác thực thiết bị IoT
          </h2>

          <div className="add-device-field add-device-field-full">
            <label htmlFor="verificationCode">
              Mã thiết bị (In trên thân thiết bị) <span className="required-mark">*</span>
            </label>
            <input
              type="text"
              id="verificationCode"
              name="verification_code"
              placeholder="VD: IOT-A1B2C3D4 hoặc SR-IOT-2023X"
              value={formData.verification_code}
              onChange={handleChange}
              style={{ fontFamily: "monospace", letterSpacing: "1px", textTransform: "uppercase" }}
              required
            />
            <span className="add-device-helper">
              Mã được quản trị viên/nhà cung cấp in trực tiếp trên tem hoặc vỏ thiết bị. Hệ thống sẽ đối chiếu mã này với cơ sở dữ liệu.
            </span>
          </div>

          <div className="add-device-field add-device-field-full" style={{ marginTop: "14px" }}>
            <label htmlFor="deviceName">
              Tên gọi thiết bị <span className="optional-badge">Tùy chọn</span>
            </label>
            <input
              type="text"
              id="deviceName"
              name="name"
              placeholder="VD: Thiết bị giám sát xe SH 150i"
              value={formData.name}
              onChange={handleChange}
            />
            <span className="add-device-helper">
              Đặt tên dễ nhớ cho thiết bị của bạn. Nếu để trống, hệ thống sẽ sử dụng tên mặc định của thiết bị.
            </span>
          </div>
        </section>

        {/* Section: Thông tin phương tiện (tùy chọn) */}
        <section className="add-device-section">
          <h2 className="add-device-section-title">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="18.5" cy="17.5" r="3.5" />
              <circle cx="5.5" cy="17.5" r="3.5" />
              <circle cx="15" cy="5" r="1" />
              <path d="M12 17.5V14l-3-3 4-3 2 3h2" />
            </svg>
            Thông tin phương tiện gắn kèm
            <span className="optional-badge">Tùy chọn</span>
          </h2>

          <div className="add-device-grid">
            <div className="add-device-field">
              <label htmlFor="brand">Thương hiệu xe</label>
              <input
                type="text"
                id="brand"
                name="brand"
                placeholder="VD: Honda, Yamaha..."
                value={formData.brand}
                onChange={handleChange}
              />
            </div>

            <div className="add-device-field">
              <label htmlFor="model">Dòng xe (Model)</label>
              <input
                type="text"
                id="model"
                name="model"
                placeholder="VD: SH 150i, Air Blade..."
                value={formData.model}
                onChange={handleChange}
              />
            </div>

            <div className="add-device-field">
              <label htmlFor="color">Màu sắc</label>
              <input
                type="text"
                id="color"
                name="color"
                placeholder="VD: Đen nhám, Trắng..."
                value={formData.color}
                onChange={handleChange}
              />
            </div>

            <div className="add-device-field">
              <label htmlFor="license_plate">Biển số xe</label>
              <input
                type="text"
                id="license_plate"
                name="license_plate"
                placeholder="VD: 29A1-123.45"
                value={formData.license_plate}
                onChange={handleChange}
              />
            </div>
          </div>

          <p className="add-device-info-note">
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
            Thông tin phương tiện giúp bạn dễ dàng theo dõi và nhận diện xe trong hệ thống định vị & cảnh báo.
          </p>
        </section>

        <hr className="add-device-divider" />

        {/* Footer Actions */}
        <div className="add-device-footer">
          <Link to="/devices" className="add-device-cancel-btn">
            Hủy
          </Link>
          <button
            type="submit"
            className="add-device-submit-btn"
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
            {submitting ? "Đang kiểm tra & kích hoạt..." : "Kích hoạt & Thêm thiết bị"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddDevice;

