import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { addUserDevice } from "../../../services/deviceService";
import { validateDeviceCode, validateSecretCode } from "../../../utils/validators";

function AddDevice() {
  const navigate = useNavigate();

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showSecret, setShowSecret] = useState(false);

  const [formData, setFormData] = useState({
    verification_code: "",
    name: "",
    secret_code: "",
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
    const codeErr = validateDeviceCode(code);
    if (codeErr) {
      setError(codeErr);
      return;
    }

    const secret = formData.secret_code.trim();
    const secretErr = validateSecretCode(secret);
    if (secretErr) {
      setError(secretErr);
      return;
    }

    if (!formData.name.trim()) {
      setError("Vui lòng nhập tên thiết bị.");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const addedDevice = await addUserDevice({
        verification_code: code,
        secret_code: secret,
        name: formData.name.trim(),
      });

      // Synchronize into localStorage
      try {
        const localLinked = JSON.parse(localStorage.getItem("custom_linked_devices") || "[]");
        const filtered = localLinked.filter(
          (d) => (d.verification_code || d.id) !== (addedDevice.verification_code || addedDevice.id)
        );
        localStorage.setItem("custom_linked_devices", JSON.stringify([addedDevice, ...filtered]));
      } catch {}

      setSuccess(
        `Thêm thiết bị "${formData.name.trim()}" (${code}) thành công!`
      );

      setTimeout(() => {
        navigate("/devices");
      }, 1000);
    } catch (err) {
      setError(
        err?.message ||
          "Không thể thêm thiết bị. Vui lòng kiểm tra lại mã thiết bị và mã xác minh PIN."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="add-device-page" style={{ maxWidth: "680px", margin: "0 auto", padding: "32px 16px" }}>
      {error && <div className="devices-alert error" style={{ marginBottom: "16px" }}>{error}</div>}
      {success && <div className="devices-alert success" style={{ marginBottom: "16px" }}>{success}</div>}

      <div className="admin-overview-kpi-card" style={{ padding: "28px 32px", borderRadius: "16px", border: "1px solid #e2e8f0", background: "#ffffff", boxShadow: "0 2px 12px rgba(0,0,0,0.03)" }}>
        {/* Card Title */}
        <div style={{ paddingBottom: "16px", borderBottom: "1px solid #f1f5f9", marginBottom: "24px" }}>
          <h2 style={{ fontSize: "19px", fontWeight: "800", color: "#0f172a", margin: 0 }}>
            Thông tin thiết bị
          </h2>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Field 1: Mã thiết bị */}
          <div className="custom-form-group">
            <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#334155", marginBottom: "8px" }}>
              Mã thiết bị <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <div className="custom-input-with-icon" style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <span style={{ position: "absolute", left: "14px", color: "#64748b", display: "flex", alignItems: "center" }}>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7" rx="1.5" />
                  <rect x="14" y="3" width="7" height="7" rx="1.5" />
                  <rect x="3" y="14" width="7" height="7" rx="1.5" />
                  <rect x="14" y="14" width="7" height="7" rx="1.5" />
                </svg>
              </span>
              <input
                type="text"
                name="verification_code"
                placeholder="VD: IOT-002"
                value={formData.verification_code}
                onChange={handleChange}
                required
                style={{
                  width: "100%",
                  height: "44px",
                  paddingLeft: "42px",
                  paddingRight: "14px",
                  border: "1.5px solid #cbd5e1",
                  borderRadius: "10px",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#0f172a",
                  outline: "none",
                  transition: "border-color 0.15s",
                }}
              />
            </div>
            <span style={{ display: "block", fontSize: "12px", color: "#64748b", marginTop: "6px" }}>
              Mã định danh duy nhất in trên thân thiết bị.
            </span>
          </div>

          {/* Field 2: Tên thiết bị */}
          <div className="custom-form-group">
            <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#334155", marginBottom: "8px" }}>
              Tên thiết bị <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <div className="custom-input-with-icon" style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <span style={{ position: "absolute", left: "14px", color: "#64748b", display: "flex", alignItems: "center" }}>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="3" width="20" height="14" rx="2" />
                  <line x1="8" y1="21" x2="16" y2="21" />
                  <line x1="12" y1="17" x2="12" y2="21" />
                </svg>
              </span>
              <input
                type="text"
                name="name"
                placeholder="VD: Thiết bị IoT 002"
                value={formData.name}
                onChange={handleChange}
                required
                style={{
                  width: "100%",
                  height: "44px",
                  paddingLeft: "42px",
                  paddingRight: "14px",
                  border: "1.5px solid #cbd5e1",
                  borderRadius: "10px",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#0f172a",
                  outline: "none",
                  transition: "border-color 0.15s",
                }}
              />
            </div>
          </div>

          {/* Field 3: Mã xác minh (PIN) */}
          <div className="custom-form-group">
            <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#334155", marginBottom: "8px" }}>
              Mã xác minh (PIN) <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <div className="custom-input-with-icon" style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <span style={{ position: "absolute", left: "14px", color: "#64748b", display: "flex", alignItems: "center" }}>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="6" cy="12" r="1.5" fill="currentColor" />
                  <circle cx="12" cy="12" r="1.5" fill="currentColor" />
                  <circle cx="18" cy="12" r="1.5" fill="currentColor" />
                </svg>
              </span>
              <input
                type={showSecret ? "text" : "password"}
                name="secret_code"
                placeholder="Nhập mã PIN 6 số"
                value={formData.secret_code}
                onChange={handleChange}
                required
                style={{
                  width: "100%",
                  height: "44px",
                  paddingLeft: "42px",
                  paddingRight: "44px",
                  border: "1.5px solid #cbd5e1",
                  borderRadius: "10px",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#0f172a",
                  outline: "none",
                  letterSpacing: showSecret ? "normal" : "2px",
                }}
              />
              <button
                type="button"
                onClick={() => setShowSecret((p) => !p)}
                title={showSecret ? "Ẩn mã PIN" : "Hiện mã PIN"}
                style={{
                  position: "absolute",
                  right: "12px",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "#64748b",
                  padding: "4px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {showSecret ? (
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Info Callout Banner */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              background: "#eff6ff",
              border: "1px solid #dbeafe",
              borderRadius: "10px",
              padding: "12px 16px",
              color: "#1e40af",
              fontSize: "13px",
              marginTop: "4px",
            }}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" style={{ flexShrink: 0 }}>
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <span>
              Thiết bị sau khi thêm sẽ ở trạng thái <strong>Chưa kích hoạt</strong> cho đến khi kết nối lần đầu.
            </span>
          </div>

          {/* Divider line & Actions */}
          <div
            style={{
              paddingTop: "20px",
              borderTop: "1px solid #f1f5f9",
              marginTop: "10px",
              display: "flex",
              justifyContent: "flex-end",
              gap: "12px",
              alignItems: "center",
            }}
          >
            <Link
              to="/devices"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                height: "40px",
                padding: "0 22px",
                background: "#ffffff",
                border: "1.5px solid #cbd5e1",
                borderRadius: "8px",
                color: "#334155",
                fontSize: "13.5px",
                fontWeight: "600",
                textDecoration: "none",
                transition: "all 0.15s",
              }}
            >
              Hủy
            </Link>

            <button
              type="submit"
              disabled={submitting}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                height: "40px",
                padding: "0 22px",
                background: "#0066cc",
                border: "none",
                borderRadius: "8px",
                color: "#ffffff",
                fontSize: "13.5px",
                fontWeight: "700",
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(0,102,204,0.25)",
                transition: "all 0.15s",
              }}
            >
              {submitting ? "Đang thêm..." : "+ Thêm thiết bị"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddDevice;
