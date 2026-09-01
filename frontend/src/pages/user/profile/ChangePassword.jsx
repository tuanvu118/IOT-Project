import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { changePassword } from "../../../services/authService";
import { validatePassword } from "../../../utils/validators";

function ChangePassword() {
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!currentPassword) {
      setError("Vui lòng nhập mật khẩu hiện tại.");
      return;
    }

    const passErr = validatePassword(newPassword);
    if (passErr) {
      setError(`Mật khẩu mới không hợp lệ: ${passErr}`);
      return;
    }

    if (currentPassword === newPassword) {
      setError("Mật khẩu mới không được trùng với mật khẩu hiện tại.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Xác nhận mật khẩu mới không khớp.");
      return;
    }


    setLoading(true);

    try {
      await changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      });

      setSuccess("Đổi mật khẩu thành công! Bạn có thể sử dụng mật khẩu mới trong lần đăng nhập tiếp theo.");
      setTimeout(() => {
        navigate("/profile");
      }, 1500);
    } catch (err) {
      setError(err?.message || "Đổi mật khẩu không thành công. Vui lòng kiểm tra lại mật khẩu hiện tại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="change-password-page">
      {/* Breadcrumb */}
      <nav className="change-password-breadcrumb" aria-label="Breadcrumb">
        <Link to="/profile">Hồ sơ cá nhân</Link>
        <span className="breadcrumb-separator">&gt;</span>
        <strong>Đổi mật khẩu</strong>
      </nav>

      {error && <div className="change-password-alert error">{error}</div>}
      {success && <div className="change-password-alert success">{success}</div>}

      {/* Main Card */}
      <form className="change-password-card" onSubmit={handleSubmit}>
        <div className="change-password-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h1>Đổi mật khẩu</h1>
            <p style={{ margin: "4px 0 0" }}>Vui lòng nhập mật khẩu hiện tại và mật khẩu mới để cập nhật bảo mật tài khoản của bạn.</p>
          </div>
          <Link to="/profile" className="app-back-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Quay lại hồ sơ
          </Link>
        </div>

        <div className="change-password-fields">
          {/* Mật khẩu hiện tại */}
          <div className="change-password-field">
            <label htmlFor="currentPassword">Mật khẩu hiện tại</label>
            <div className="password-input-wrap">
              <span className="password-left-icon">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </span>
              <input
                id="currentPassword"
                type={showCurrentPassword ? "text" : "password"}
                placeholder="Nhập mật khẩu hiện tại"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="password-eye-btn"
                onClick={() => setShowCurrentPassword((prev) => !prev)}
                title={showCurrentPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                {showCurrentPassword ? (
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Mật khẩu mới */}
          <div className="change-password-field">
            <label htmlFor="newPassword">Mật khẩu mới</label>
            <div className="password-input-wrap">
              <span className="password-left-icon">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="m21 2-2 2m-1.5 1.5L14 9M3 21l9-9m0 0a5 5 0 1 0-7-7 5 5 0 0 0 7 7z" />
                </svg>
              </span>
              <input
                id="newPassword"
                type={showNewPassword ? "text" : "password"}
                placeholder="Nhập mật khẩu mới"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="password-eye-btn"
                onClick={() => setShowNewPassword((prev) => !prev)}
                title={showNewPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                {showNewPassword ? (
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
            <span className="password-helper-text">
              Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số.
            </span>
          </div>

          {/* Xác nhận mật khẩu mới */}
          <div className="change-password-field">
            <label htmlFor="confirmPassword">Xác nhận mật khẩu mới</label>
            <div className="password-input-wrap">
              <span className="password-left-icon">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </span>
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Nhập lại mật khẩu mới"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="password-eye-btn"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                title={showConfirmPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                {showConfirmPassword ? (
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="change-password-footer">
          <Link to="/profile" className="change-password-cancel-btn">
            Hủy
          </Link>
          <button
            type="submit"
            className="change-password-submit-btn"
            disabled={loading}
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
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            {loading ? "Đang đổi..." : "Đổi mật khẩu"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ChangePassword;