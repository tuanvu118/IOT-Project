import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { adminCreateDevice } from "../../../services/deviceService";

function AdminAddDevice() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    verification_code: "",
  });

  const handleGenerateCode = () => {
    const randomCode = `IOT-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    setFormData((prev) => ({ ...prev, verification_code: randomCode }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "verification_code" ? value.toUpperCase() : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.verification_code.trim()) {
      setError("Vui lòng nhập đầy đủ Tên thiết bị và Mã xác thực.");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const res = await adminCreateDevice({
        name: formData.name.trim(),
        verification_code: formData.verification_code.trim().toUpperCase(),
      });
      setSuccess(`Tạo thiết bị "${res?.name}" (Mã: ${res?.verification_code}) thành công!`);
      setTimeout(() => {
        navigate("/admin/devices");
      }, 1500);
    } catch (err) {
      setError(err?.message || "Không thể tạo thiết bị.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="add-device-page">
      <nav className="add-device-breadcrumb">
        <Link to="/admin/devices">Quản lý thiết bị</Link>
        <span className="breadcrumb-separator">&gt;</span>
        <strong>Thêm thiết bị mới (Admin)</strong>
      </nav>

      {error && <div className="add-device-alert error">{error}</div>}
      {success && <div className="add-device-alert success">{success}</div>}

      <form className="add-device-card" onSubmit={handleSubmit}>
        <div className="add-device-header">
          <h1>Đăng ký thiết bị IoT mới (Admin)</h1>
          <p className="add-device-subtitle">
            Tạo mã thiết bị trước khi giao/bán cho người dùng. Người dùng sẽ dùng mã này để liên kết vào tài khoản.
          </p>
        </div>

        <hr className="add-device-divider" />

        <div className="add-device-field add-device-field-full">
          <label htmlFor="name">Tên thiết bị <span className="required-mark">*</span></label>
          <input
            type="text"
            id="name"
            name="name"
            placeholder="VD: Smart Tracker V1 - Lô A"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="add-device-field add-device-field-full" style={{ marginTop: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <label htmlFor="verification_code">Mã xác thực / Mã in trên thiết bị <span className="required-mark">*</span></label>
            <button
              type="button"
              onClick={handleGenerateCode}
              style={{
                background: "transparent",
                border: "none",
                color: "#2563eb",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: "600",
              }}
            >
              + Tạo mã tự động
            </button>
          </div>
          <input
            type="text"
            id="verification_code"
            name="verification_code"
            placeholder="VD: IOT-9A2F8B1C hoặc SR-IOT-2024A"
            value={formData.verification_code}
            onChange={handleChange}
            style={{ fontFamily: "monospace", textTransform: "uppercase" }}
            required
          />
        </div>

        <div className="add-device-footer" style={{ marginTop: "24px" }}>
          <Link to="/admin/devices" className="add-device-cancel-btn">Hủy</Link>
          <button type="submit" className="add-device-submit-btn" disabled={submitting}>
            {submitting ? "Đang tạo..." : "Tạo thiết bị"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AdminAddDevice;