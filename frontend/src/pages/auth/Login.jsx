import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { loginUser } from "../../services/authService";
import { validateEmail } from "../../utils/validators";
import "./Auth.css";

function ShieldLogo() {
  return (
    <span className="auth-logo" aria-hidden="true">
      <svg viewBox="0 0 32 32">
        <path d="M16 3 27 7v8c0 7-4.5 11.4-11 14C9.5 26.4 5 22 5 15V7z" />
        <path d="M11 15.5 14.2 19 22 10.8" />
        <path d="M10 9.5 16 7l6 2.5" />
      </svg>
    </span>
  );
}

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const errors = {};
    const emailErr = validateEmail(formData.email);
    if (emailErr) errors.email = emailErr;

    if (!formData.password) {
      errors.password = "Vui lòng nhập mật khẩu.";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsSubmitting(true);

    try {
      const authData = await loginUser({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      login(authData);
      navigate(authData.user?.is_admin || authData.user?.isAdmin ? "/admin" : "/dashboard");
    } catch (err) {
      setError(err.message || "Email hoặc mật khẩu không chính xác.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="auth-page auth-login-page">
      <section className="auth-visual auth-login-visual">
        <ShieldLogo />
        <div className="login-preview-card">
          <div className="login-preview-title">Đăng nhập hệ thống</div>
          <div className="login-preview-box">
            <strong>Xin chào, Quản trị viên</strong>
            <span />
            <span />
            <button type="button">ĐĂNG NHẬP</button>
            <small>Hoặc đăng nhập bằng</small>
            <div>
              <i />
              <i />
              <i />
            </div>
          </div>
          <div className="login-bike" />
        </div>

        <div className="auth-visual-copy">
          <h2>Giám sát xe máy thông minh</h2>
          <p>
            Kiểm soát vị trí, theo dõi hành trình và bảo vệ phương tiện của bạn
            với công nghệ IoT theo thời gian thực.
          </p>
        </div>
      </section>

      <section className="auth-form-side">
        <form className="auth-card" onSubmit={handleSubmit} noValidate>
          <div className="auth-heading">
            <h1>Đăng nhập</h1>
            <p>Vui lòng nhập email và mật khẩu để tiếp tục.</p>
          </div>

          <div className="auth-field-group">
            <label className={`auth-field ${fieldErrors.email ? "has-error" : ""}`}>
              <span>EMAIL (@gmail.com)</span>
              <div className="auth-input-wrap">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M4 6h16v12H4z" />
                  <path d="m4 7 8 6 8-6" />
                </svg>
                <input
                  name="email"
                  type="email"
                  placeholder="VD: user@gmail.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </label>
            {fieldErrors.email && <span className="auth-field-error">{fieldErrors.email}</span>}
          </div>

          <div className="auth-field-group">
            <label className={`auth-field ${fieldErrors.password ? "has-error" : ""}`}>
              <span>MẬT KHẨU</span>
              <div className="auth-input-wrap">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <rect x="5" y="10" width="14" height="10" rx="2" />
                  <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                  <path d="M12 14v2" />
                </svg>
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Nhập mật khẩu của bạn"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="auth-input-action-btn"
                  onClick={() => setShowPassword((prev) => !prev)}
                  title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showPassword ? (
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
            </label>
            {fieldErrors.password && <span className="auth-field-error">{fieldErrors.password}</span>}
          </div>

          {error && <p className="auth-error">{error}</p>}

          <button className="auth-submit" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
            <svg className="auth-submit-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M14 5l7 7-7 7" />
              <path d="M21 12H9" />
              <path d="M9 5H5v14h4" />
            </svg>
          </button>

          <div className="auth-links">
            <p>
              Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
            </p>
            <Link className="auth-back-link" to="/">
              <span aria-hidden="true">←</span>
              Quay về trang chủ
            </Link>
          </div>
        </form>
      </section>
    </main>
  );
}

export default Login;
