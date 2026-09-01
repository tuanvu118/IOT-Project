import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { getUserById, getAllUsers } from "../../../services/userService";

function EditUser() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone_number: "",
    address: "",
    date_of_birth: "",
    citizen_number: "",
    is_admin: false,
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let isMounted = true;
    async function loadUser() {
      try {
        let found = null;
        try {
          found = await getUserById(id);
        } catch {
          const all = await getAllUsers();
          found = (all || []).find((u) => u.id === id);
        }

        if (!found) {
          const customAdded = JSON.parse(localStorage.getItem("admin_custom_created_users") || "[]");
          found = customAdded.find((u) => u.id === id);
        }

        if (isMounted) {
          if (found) {
            setFormData({
              name: found.name || "",
              email: found.email || "",
              phone_number: found.phone_number || found.phoneNumber || "",
              address: found.address || "Cầu Giấy, Hà Nội",
              date_of_birth: found.date_of_birth || found.dateOfBirth || "1990-06-15",
              citizen_number: found.citizen_number || found.citizenNumber || "001203004567",
              is_admin: Boolean(found.is_admin || found.isAdmin),
            });
          } else {
            setFormData({
              name: "Nguyễn Văn An",
              email: "an.nguyen@email.com",
              phone_number: "0912 345 678",
              address: "Cầu Giấy, Hà Nội",
              date_of_birth: "1990-06-15",
              citizen_number: "001203004567",
              is_admin: false,
            });
          }
        }
      } catch (err) {
        if (isMounted) setError("Không thể tải thông tin người dùng.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadUser();
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
      // Update custom storage
      const customAdded = JSON.parse(localStorage.getItem("admin_custom_created_users") || "[]");
      const updated = customAdded.map((u) =>
        u.id === id ? { ...u, ...formData } : u
      );
      localStorage.setItem("admin_custom_created_users", JSON.stringify(updated));

      setSuccess("Cập nhật thông tin người dùng thành công!");
      setTimeout(() => {
        navigate(`/admin/users/${id}`);
      }, 800);
    } catch (err) {
      setError(err?.message || "Không thể cập nhật thông tin.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-user-list-page">
      {/* Top Header & Back Button */}
      <div className="admin-page-header" style={{ marginBottom: "20px" }}>
        <div>
          <h1 className="admin-page-title">Chỉnh sửa Người dùng</h1>
          <p className="admin-page-subtitle">
            Cập nhật thông tin cá nhân và quyền hạn của tài khoản: <strong>{formData.name || id}</strong>
          </p>
        </div>

        <Link to={`/admin/users/${id}`} className="app-back-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Quay lại chi tiết
        </Link>
      </div>

      {error && <div className="admin-alert error">{error}</div>}
      {success && <div className="admin-alert success">{success}</div>}

      <div className="admin-table-card" style={{ padding: "28px", maxWidth: "800px" }}>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div className="admin-form-field">
            <label>Địa chỉ Email (Cố định)</label>
            <input
              type="email"
              value={formData.email}
              disabled
              style={{ background: "#f8fafc", color: "#64748b" }}
            />
          </div>

          <div className="admin-form-field">
            <label htmlFor="editName">Họ và tên <span style={{ color: "#ef4444" }}>*</span></label>
            <input
              id="editName"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
              required
            />
          </div>

          <div className="admin-form-field">
            <label htmlFor="editPhone">Số điện thoại <span style={{ color: "#ef4444" }}>*</span></label>
            <input
              id="editPhone"
              type="tel"
              value={formData.phone_number}
              onChange={(e) => setFormData((p) => ({ ...p, phone_number: e.target.value }))}
              required
            />
          </div>

          <div className="admin-form-field">
            <label htmlFor="editAddress">Địa chỉ</label>
            <input
              id="editAddress"
              type="text"
              value={formData.address}
              onChange={(e) => setFormData((p) => ({ ...p, address: e.target.value }))}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div className="admin-form-field">
              <label htmlFor="editDob">Ngày sinh</label>
              <input
                id="editDob"
                type="text"
                value={formData.date_of_birth}
                onChange={(e) => setFormData((p) => ({ ...p, date_of_birth: e.target.value }))}
              />
            </div>

            <div className="admin-form-field">
              <label htmlFor="editCccd">Số CCCD / CMND</label>
              <input
                id="editCccd"
                type="text"
                value={formData.citizen_number}
                onChange={(e) => setFormData((p) => ({ ...p, citizen_number: e.target.value }))}
              />
            </div>
          </div>

          <div className="admin-form-checkbox" style={{ marginTop: "8px" }}>
            <input
              type="checkbox"
              id="editIsAdmin"
              checked={formData.is_admin}
              onChange={(e) => setFormData((p) => ({ ...p, is_admin: e.target.checked }))}
            />
            <label htmlFor="editIsAdmin">Quyền Quản trị viên (Admin)</label>
          </div>

          <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
            <button
              type="submit"
              className="admin-btn-primary"
              disabled={submitting}
            >
              {submitting ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
            <Link
              to={`/admin/users/${id}`}
              className="admin-btn-secondary"
              style={{ textDecoration: "none", display: "inline-flex", alignItems: "center" }}
            >
              Hủy bỏ
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditUser;