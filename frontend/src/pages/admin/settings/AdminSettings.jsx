import { useState, useEffect } from "react";
import useAuth from "../../../hooks/useAuth";
import { getMyProfile, updateMyProfile } from "../../../services/userService";
import { changePassword } from "../../../services/authService";

function AdminSettings() {
  const { user: authUser, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

  // System Config State
  const [systemConfig, setSystemConfig] = useState({
    gpsInterval: "10",
    accidentThreshold: "3.0",
    leanAngleThreshold: "50",
    enableGlobalSms: true,
    enableGlobalPush: true,
    maintenanceMode: false,
  });

  // Admin Profile Form State
  const [adminForm, setAdminForm] = useState({
    name: "",
    phone: "",
  });

  // Password Change State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [changingPass, setChangingPass] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadAdminData() {
      try {
        const data = await getMyProfile();
        if (isMounted && data) {
          setProfile(data);
          setAdminForm({
            name: data.name || "Quản trị viên Hệ thống",
            phone: data.phone_number || data.phoneNumber || "0999999999",
          });
        }
      } catch {
        if (isMounted && authUser) {
          setAdminForm({
            name: authUser.name || "Quản trị viên Hệ thống",
            phone: authUser.phone_number || authUser.phoneNumber || "0999999999",
          });
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    // Load saved system config from localStorage
    const savedConfig = localStorage.getItem("admin_system_config");
    if (savedConfig) {
      try {
        setSystemConfig(JSON.parse(savedConfig));
      } catch {}
    }

    loadAdminData();
    return () => {
      isMounted = false;
    };
  }, [authUser]);

  const handleSaveSystemConfig = (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg({ type: "", text: "" });

    setTimeout(() => {
      localStorage.setItem("admin_system_config", JSON.stringify(systemConfig));
      setSaving(false);
      setMsg({ type: "success", text: "Đã lưu cài đặt hệ thống thành công!" });
    }, 600);
  };

  const handleSaveAdminProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg({ type: "", text: "" });

    try {
      await updateMyProfile({
        name: adminForm.name.trim(),
        phone_number: adminForm.phone.trim(),
      });

      if (updateUser) {
        updateUser({
          ...(profile || authUser || {}),
          name: adminForm.name.trim(),
          phoneNumber: adminForm.phone.trim(),
          phone_number: adminForm.phone.trim(),
        });
      }
      setMsg({ type: "success", text: "Đã cập nhật thông tin Quản trị viên!" });
    } catch (err) {
      setMsg({ type: "error", text: err?.message || "Không thể cập nhật hồ sơ." });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMsg({ type: "error", text: "Mật khẩu mới và xác nhận mật khẩu không khớp!" });
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      setMsg({ type: "error", text: "Mật khẩu mới phải từ 8 ký tự trở lên!" });
      return;
    }

    setChangingPass(true);
    setMsg({ type: "", text: "" });

    try {
      await changePassword({
        current_password: passwordForm.currentPassword,
        new_password: passwordForm.newPassword,
      });
      setMsg({ type: "success", text: "Đổi mật khẩu Quản trị viên thành công!" });
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setMsg({ type: "error", text: err?.message || "Đổi mật khẩu thất bại. Kiểm tra lại mật khẩu hiện tại." });
    } finally {
      setChangingPass(false);
    }
  };

  return (
    <div className="admin-user-list-page">
      {/* Top Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Cài đặt hệ thống</h1>
          <p className="admin-page-subtitle">
            Quản lý tham số cảm biến IoT, chính sách cảnh báo và thông tin tài khoản Quản trị viên.
          </p>
        </div>
      </div>

      {msg.text && (
        <div className={`admin-alert ${msg.type}`} style={{ marginBottom: "20px" }}>
          {msg.text}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))", gap: "24px" }}>
        {/* Card 1: Cấu hình phần cứng & Cảm biến */}
        <div className="admin-table-card" style={{ padding: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "18px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "#eff6ff", color: "#2563eb", display: "grid", placeItems: "center" }}>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </div>
            <h2 style={{ fontSize: "17px", fontWeight: "750", color: "#0f172a", margin: 0 }}>Tham số hệ thống IoT</h2>
          </div>

          <form onSubmit={handleSaveSystemConfig} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div className="admin-form-field">
              <label htmlFor="gpsInterval">Tần số gửi tọa độ GPS</label>
              <select
                id="gpsInterval"
                value={systemConfig.gpsInterval}
                onChange={(e) => setSystemConfig((p) => ({ ...p, gpsInterval: e.target.value }))}
                style={{ height: "40px", border: "1px solid #cbd5e1", borderRadius: "8px", padding: "0 10px", fontSize: "13.5px" }}
              >
                <option value="5">Mỗi 5 giây (Thời gian thực cao cấp)</option>
                <option value="10">Mỗi 10 giây (Tiêu chuẩn tối ưu)</option>
                <option value="30">Mỗi 30 giây (Tiết kiệm pin)</option>
                <option value="60">Mỗi 60 giây (Chế độ chờ)</option>
              </select>
            </div>

            <div className="admin-form-field">
              <label htmlFor="accidentThreshold">Ngưỡng gia tốc kích hoạt va chạm (G-Force)</label>
              <select
                id="accidentThreshold"
                value={systemConfig.accidentThreshold}
                onChange={(e) => setSystemConfig((p) => ({ ...p, accidentThreshold: e.target.value }))}
                style={{ height: "40px", border: "1px solid #cbd5e1", borderRadius: "8px", padding: "0 10px", fontSize: "13.5px" }}
              >
                <option value="2.5">2.5 G (Độ nhạy cao)</option>
                <option value="3.0">3.0 G (Mặc định khuyến nghị)</option>
                <option value="3.8">3.8 G (Va chạm mạnh)</option>
              </select>
            </div>

            <div className="admin-form-field">
              <label htmlFor="leanAngleThreshold">Ngưỡng góc nghiêng đổ ngã (Gyroscope)</label>
              <select
                id="leanAngleThreshold"
                value={systemConfig.leanAngleThreshold}
                onChange={(e) => setSystemConfig((p) => ({ ...p, leanAngleThreshold: e.target.value }))}
                style={{ height: "40px", border: "1px solid #cbd5e1", borderRadius: "8px", padding: "0 10px", fontSize: "13.5px" }}
              >
                <option value="45">Góc nghiêng &gt; 45°</option>
                <option value="50">Góc nghiêng &gt; 50° (Mặc định)</option>
                <option value="60">Góc nghiêng &gt; 60°</option>
              </select>
            </div>

            <div className="admin-form-checkbox" style={{ marginTop: "6px" }}>
              <input
                type="checkbox"
                id="enableGlobalPush"
                checked={systemConfig.enableGlobalPush}
                onChange={(e) => setSystemConfig((p) => ({ ...p, enableGlobalPush: e.target.checked }))}
              />
              <label htmlFor="enableGlobalPush">Kích hoạt gửi Push Notification khẩn cấp</label>
            </div>

            <button
              type="submit"
              className="admin-btn-primary"
              disabled={saving}
              style={{ marginTop: "12px", alignSelf: "flex-start" }}
            >
              {saving ? "Đang lưu..." : "Lưu cấu hình hệ thống"}
            </button>
          </form>
        </div>

        {/* Card 2: Thông tin Quản trị viên */}
        <div className="admin-table-card" style={{ padding: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "18px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "#f0fdf4", color: "#16a34a", display: "grid", placeItems: "center" }}>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <h2 style={{ fontSize: "17px", fontWeight: "750", color: "#0f172a", margin: 0 }}>Hồ sơ Quản trị viên</h2>
          </div>

          <form onSubmit={handleSaveAdminProfile} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div className="admin-form-field">
              <label>Địa chỉ Email (Cố định)</label>
              <input
                type="email"
                value={profile?.email || authUser?.email || "admin@gmail.com"}
                disabled
                style={{ background: "#f8fafc", color: "#64748b" }}
              />
            </div>

            <div className="admin-form-field">
              <label htmlFor="adminName">Họ và tên</label>
              <input
                id="adminName"
                type="text"
                value={adminForm.name}
                onChange={(e) => setAdminForm((p) => ({ ...p, name: e.target.value }))}
                required
              />
            </div>

            <div className="admin-form-field">
              <label htmlFor="adminPhone">Số điện thoại</label>
              <input
                id="adminPhone"
                type="tel"
                value={adminForm.phone}
                onChange={(e) => setAdminForm((p) => ({ ...p, phone: e.target.value }))}
                required
              />
            </div>

            <button
              type="submit"
              className="admin-btn-primary"
              disabled={saving}
              style={{ marginTop: "10px", alignSelf: "flex-start" }}
            >
              {saving ? "Đang lưu..." : "Cập nhật hồ sơ"}
            </button>
          </form>

          <hr style={{ margin: "24px 0", borderColor: "#f1f5f9" }} />

          {/* Đổi mật khẩu Admin */}
          <h3 style={{ fontSize: "15px", fontWeight: "750", color: "#0f172a", margin: "0 0 14px" }}>Đổi mật khẩu Admin</h3>
          <form onSubmit={handleChangePassword} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div className="admin-form-field">
              <label htmlFor="currPass">Mật khẩu hiện tại</label>
              <input
                id="currPass"
                type="password"
                placeholder="Nhập mật khẩu hiện tại"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm((p) => ({ ...p, currentPassword: e.target.value }))}
                required
              />
            </div>

            <div className="admin-form-field">
              <label htmlFor="newPass">Mật khẩu mới</label>
              <input
                id="newPass"
                type="password"
                placeholder="Tối thiểu 8 ký tự"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))}
                required
              />
            </div>

            <div className="admin-form-field">
              <label htmlFor="confirmPass">Xác nhận mật khẩu mới</label>
              <input
                id="confirmPass"
                type="password"
                placeholder="Nhập lại mật khẩu mới"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                required
              />
            </div>

            <button
              type="submit"
              className="admin-btn-secondary"
              disabled={changingPass}
              style={{ marginTop: "8px", alignSelf: "flex-start", background: "#f8fafc" }}
            >
              {changingPass ? "Đang xử lý..." : "Cập nhật mật khẩu"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AdminSettings;
