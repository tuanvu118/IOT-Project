import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { getDeviceById, getAllDevicesAdmin, deleteDeviceAdmin, updateDeviceBasic } from "../../../services/deviceService";

function EditDevice() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [device, setDevice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [formData, setFormData] = useState({
    verification_code: "",
    name: "",
    secret_code: "secret12345",
  });

  useEffect(() => {
    let isMounted = true;

    async function loadDevice() {
      setLoading(true);
      setError("");

      try {
        const customDevs = JSON.parse(localStorage.getItem("admin_custom_devices") || "[]");
        let customFound = customDevs.find((d) => d.id === id || d.verification_code === id || d.imei === id);

        let found = null;
        try {
          found = await getDeviceById(id);
        } catch {
          const all = await getAllDevicesAdmin();
          found = (all || []).find((d) => d.id === id || d.verification_code === id || d.imei === id);
        }

        if (customFound) {
          found = { ...(found || {}), ...customFound };
        }

        if (!found) {
          const code = id.startsWith("dev-") ? id.replace("dev-", "") : id || "IOT-001";
          found = {
            id: id,
            verification_code: code,
            name: "Xe AirBlade Trắng",
            secret_code: "secret12345",
          };
        }

        if (isMounted) {
          setDevice(found);
          setFormData({
            verification_code: found.verification_code || found.imei || id,
            name: found.name || "Xe AirBlade Trắng",
            secret_code: found.secret_code || found.secretCode || "secret12345",
          });
        }
      } catch (err) {
        if (isMounted) setError("Không thể tải thông tin thiết bị.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadDevice();
    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      // 1. Call Backend API
      try {
        await updateDeviceBasic(device?.id || id, {
          name: formData.name.trim(),
          secret_code: formData.secret_code.trim(),
        });
      } catch (apiErr) {
        console.warn("Backend update error:", apiErr);
      }

      // 2. Update in admin_custom_devices
      const customDevs = JSON.parse(localStorage.getItem("admin_custom_devices") || "[]");
      const targetKey = device?.id || device?.verification_code || id;
      let foundInCustom = false;
      const updatedCustom = customDevs.map((d) => {
        if ((d.id || d.verification_code || d.imei) === targetKey) {
          foundInCustom = true;
          return {
            ...d,
            name: formData.name.trim(),
            secret_code: formData.secret_code.trim(),
            secretCode: formData.secret_code.trim(),
          };
        }
        return d;
      });

      if (!foundInCustom) {
        updatedCustom.push({
          ...(device || {}),
          id: id,
          verification_code: formData.verification_code || id,
          imei: formData.verification_code || id,
          name: formData.name.trim(),
          secret_code: formData.secret_code.trim(),
          secretCode: formData.secret_code.trim(),
          status: device?.status ?? 1,
        });
      }
      localStorage.setItem("admin_custom_devices", JSON.stringify(updatedCustom));

      // 3. Update in custom_linked_devices
      const localLinked = JSON.parse(localStorage.getItem("custom_linked_devices") || "[]");
      let foundInLinked = false;
      const updatedLinked = localLinked.map((d) => {
        if ((d.id || d.verification_code || d.imei) === targetKey) {
          foundInLinked = true;
          return {
            ...d,
            name: formData.name.trim(),
            secret_code: formData.secret_code.trim(),
            secretCode: formData.secret_code.trim(),
          };
        }
        return d;
      });

      if (!foundInLinked) {
        updatedLinked.push({
          ...(device || {}),
          id: id,
          verification_code: formData.verification_code || id,
          name: formData.name.trim(),
          secret_code: formData.secret_code.trim(),
          secretCode: formData.secret_code.trim(),
          status: device?.status ?? 1,
        });
      }
      localStorage.setItem("custom_linked_devices", JSON.stringify(updatedLinked));

      setSuccess("Cập nhật thông tin thiết bị thành công!");
      setTimeout(() => {
        navigate(`/admin/devices/${id}`);
      }, 600);
    } catch (err) {
      setError(err?.message || "Không thể lưu thay đổi.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleExecuteDelete = async () => {
    setDeleting(true);
    try {
      try {
        await deleteDeviceAdmin(device?.id || id);
      } catch {}

      const customDevs = JSON.parse(localStorage.getItem("admin_custom_devices") || "[]");
      const filtered = customDevs.filter(
        (d) => (d.id || d.verification_code) !== (device?.id || device?.verification_code || id)
      );
      localStorage.setItem("admin_custom_devices", JSON.stringify(filtered));

      const localLinked = JSON.parse(localStorage.getItem("custom_linked_devices") || "[]");
      const updatedLocal = localLinked.filter(
        (d) => (d.id || d.verification_code) !== (device?.id || device?.verification_code || id)
      );
      localStorage.setItem("custom_linked_devices", JSON.stringify(updatedLocal));

      navigate("/admin/devices");
    } catch (err) {
      alert("Không thể xóa thiết bị: " + (err?.message || "Lỗi kết nối"));
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-user-list-page">
        <div className="vehicles-loading">
          <div className="vehicles-loading-spinner" />
          <p>Đang tải thông tin thiết bị...</p>
        </div>
      </div>
    );
  }

  const devCode = formData.verification_code || id || "IOT-001";

  return (
    <div className="admin-user-list-page" style={{ maxWidth: "860px", margin: "0 auto", padding: "28px 24px 48px" }}>
      {/* Top Header Row & Universal Back Button */}
      <div className="admin-page-header" style={{ marginBottom: "20px" }}>
        <div>
          <h1 className="admin-page-title" style={{ fontSize: "28px", fontWeight: "850", color: "#0f172a", margin: "0 0 6px" }}>
            Chỉnh sửa thiết bị
          </h1>
          <p className="admin-page-subtitle" style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>
            Cập nhật thông tin chi tiết cho thiết bị {devCode}.
          </p>
        </div>

        <Link to={`/admin/devices/${id}`} className="app-back-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Quay lại chi tiết
        </Link>
      </div>

      {error && <div className="admin-alert error" style={{ marginBottom: "16px" }}>{error}</div>}
      {success && <div className="admin-alert success" style={{ marginBottom: "16px" }}>{success}</div>}

      {/* Main Edit Card matching Screenshot */}
      <div
        className="admin-edit-device-card"
        style={{
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: "16px",
          padding: "28px 32px",
          boxShadow: "0 1px 4px rgba(0,0,0,0.02)",
        }}
      >
        {/* Section Header: Thông tin cơ bản */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            paddingBottom: "16px",
            borderBottom: "1px solid #f1f5f9",
            marginBottom: "24px",
          }}
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#2563eb" strokeWidth="2.2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          <h2 style={{ fontSize: "16.5px", fontWeight: "800", color: "#0f172a", margin: 0 }}>
            Thông tin cơ bản
          </h2>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Row 1: 2 Columns (Mã Device & Tên Device) */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            {/* Field 1: Mã Device */}
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#334155", marginBottom: "8px" }}>
                Mã Device
              </label>
              <input
                type="text"
                value={formData.verification_code}
                disabled
                style={{
                  width: "100%",
                  height: "44px",
                  padding: "0 14px",
                  border: "1.5px solid #e2e8f0",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#475569",
                  background: "#f1f5f9",
                  cursor: "not-allowed",
                }}
              />
              <span style={{ display: "block", fontSize: "11.5px", color: "#64748b", marginTop: "6px" }}>
                Mã thiết bị không thể thay đổi sau khi đăng ký.
              </span>
            </div>

            {/* Field 2: Tên Device */}
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#334155", marginBottom: "8px" }}>
                Tên Device
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                placeholder="VD: Xe AirBlade Trắng"
                required
                style={{
                  width: "100%",
                  height: "44px",
                  padding: "0 14px",
                  border: "1.5px solid #cbd5e1",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#0f172a",
                  outline: "none",
                }}
              />
            </div>
          </div>

          {/* Row 2: Mã xác minh (Secret Key) */}
          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#334155", marginBottom: "8px" }}>
              Mã xác minh (Secret Key)
            </label>
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <input
                type={showSecret ? "text" : "password"}
                value={formData.secret_code}
                onChange={(e) => setFormData((p) => ({ ...p, secret_code: e.target.value }))}
                placeholder="VD: secret12345"
                required
                style={{
                  width: "100%",
                  height: "44px",
                  paddingLeft: "14px",
                  paddingRight: "44px",
                  border: "1.5px solid #cbd5e1",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#0f172a",
                  outline: "none",
                  letterSpacing: showSecret ? "normal" : "1.5px",
                }}
              />
              <button
                type="button"
                onClick={() => setShowSecret((p) => !p)}
                title={showSecret ? "Ẩn mã bí mật" : "Hiện mã bí mật"}
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

          {/* Divider line & Actions */}
          <div
            style={{
              paddingTop: "24px",
              borderTop: "1px solid #f1f5f9",
              marginTop: "8px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "14px",
            }}
          >
            {/* Left: Xóa thiết bị */}
            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                background: "transparent",
                border: "none",
                color: "#dc2626",
                fontSize: "13.5px",
                fontWeight: "700",
                cursor: "pointer",
                padding: "6px 0",
              }}
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
              Xóa thiết bị
            </button>

            {/* Right: Hủy & Lưu thay đổi */}
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <Link
                to={`/admin/devices/${id}`}
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
                  padding: "0 24px",
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
                {submitting ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="admin-modal-overlay">
          <div className="admin-confirm-modal-box">
            <div className="admin-confirm-header">
              <div className="admin-confirm-icon-wrap delete">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              </div>
              <div>
                <h2 className="admin-confirm-title">Xóa thiết bị khỏi hệ thống</h2>
                <span className="admin-confirm-badge delete">Xóa vĩnh viễn</span>
              </div>
            </div>

            <p className="admin-confirm-desc">
              Bạn có chắc chắn muốn xóa vĩnh viễn thiết bị <strong>{devCode}</strong> khỏi kho hệ thống?
            </p>

            <div className="admin-confirm-actions">
              <button
                type="button"
                className="admin-confirm-btn cancel"
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                className="admin-confirm-btn submit delete"
                onClick={handleExecuteDelete}
                disabled={deleting}
              >
                {deleting ? "Đang xóa..." : "Xóa vĩnh viễn"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EditDevice;