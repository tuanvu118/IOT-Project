import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { registerUser } from "../../services/authService";
import "./Auth.css";

function Register() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const formData = new FormData(event.currentTarget);
    const password = String(formData.get("password") || "");
    const confirmPassword = String(formData.get("confirmPassword") || "");

    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    setIsSubmitting(true);

    try {
      await registerUser({
        name: String(formData.get("name") || "").trim(),
        email: String(formData.get("email") || "").trim(),
        phone_number: String(formData.get("phone") || "").trim(),
        password,
      });
      navigate("/login");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="auth-page auth-register-page">
      <section className="auth-visual auth-register-visual">
        <div className="register-showcase-card">
          <div className="register-bike-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path d="M5 16h2l2.5-4h5L17 16h2" />
              <circle cx="6" cy="17" r="2.2" />
              <circle cx="18" cy="17" r="2.2" />
              <path d="M10 12 9 9h3" />
              <path d="M15 12l2-3h2" />
            </svg>
          </div>
          <h2>SmartBike IoT</h2>
          <p>Hệ thống giám sát và bảo vệ xe máy thông minh thế hệ mới.</p>
        </div>
      </section>

      <section className="auth-form-side auth-register-form-side">
        <form className="auth-register-form" onSubmit={handleSubmit}>
          <div className="auth-heading auth-heading-center">
            <h1>Tạo tài khoản mới</h1>
            <p>Vui lòng điền thông tin để đăng ký.</p>
          </div>

          <label className="auth-field">
            <span>Họ và tên</span>
            <div className="auth-input-wrap">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="8" r="3" />
                <path d="M5 20a7 7 0 0 1 14 0" />
              </svg>
              <input name="name" type="text" placeholder="Nhập họ và tên của bạn" required />
            </div>
          </label>

          <label className="auth-field">
            <span>Email</span>
            <div className="auth-input-wrap">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4 6h16v12H4z" />
                <path d="m4 7 8 6 8-6" />
              </svg>
              <input name="email" type="email" placeholder="Nhập địa chỉ email" required />
            </div>
          </label>

          <label className="auth-field">
            <span>Số điện thoại</span>
            <div className="auth-input-wrap">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M6 4h4l2 5-2.5 1.5a11 11 0 0 0 4 4L15 12l5 2v4c0 1-1 2-2 2A14 14 0 0 1 4 6c0-1 1-2 2-2z" />
              </svg>
              <input name="phone" type="tel" placeholder="Nhập số điện thoại" required />
            </div>
          </label>

          <label className="auth-field">
            <span>Mật khẩu</span>
            <div className="auth-input-wrap">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <rect x="5" y="10" width="14" height="10" rx="2" />
                <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                <path d="M12 14v2" />
              </svg>
              <input name="password" type="password" placeholder="Tạo mật khẩu" required />
              <svg className="auth-input-action" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z" />
                <path d="M4 4l16 16" />
              </svg>
            </div>
          </label>

          <label className="auth-field">
            <span>Xác nhận mật khẩu</span>
            <div className="auth-input-wrap">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <rect x="5" y="10" width="14" height="10" rx="2" />
                <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                <path d="M12 14v2" />
              </svg>
              <input
                name="confirmPassword"
                type="password"
                placeholder="Nhập lại mật khẩu"
                required
              />
              <svg className="auth-input-action" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z" />
                <path d="M4 4l16 16" />
              </svg>
            </div>
          </label>

          {error && <p className="auth-error">{error}</p>}

          <button className="auth-submit auth-register-submit" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Đang đăng ký..." : "Đăng ký"}
          </button>

          <div className="auth-links auth-register-links">
            <p>
              Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
            </p>
          </div>
        </form>
      </section>
    </main>
  );
}

export default Register;
