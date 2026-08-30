import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { registerUser } from "../../services/authService";
import {
  validateEmail,
  validatePhoneNumber,
  validatePassword,
  validateFullName,
} from "../../utils/validators";
import "./Auth.css";

function Register() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Xóa lỗi khi user đang nhập lại
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateAll = () => {
    const errors = {};
    const nameErr = validateFullName(formData.name);
    if (nameErr) errors.name = nameErr;

    const emailErr = validateEmail(formData.email);
    if (emailErr) errors.email = emailErr;

    const phoneErr = validatePhoneNumber(formData.phone);
    if (phoneErr) errors.phone = phoneErr;

    const passErr = validatePassword(formData.password);
    if (passErr) errors.password = passErr;

    if (!formData.confirmPassword) {
      errors.confirmPassword = "Vui lòng xác nhận lại mật khẩu.";
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Mật khẩu xác nhận không khớp.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!validateAll()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await registerUser({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone_number: formData.phone.trim(),
        password: formData.password,
      });
      navigate("/login");
    } catch (err) {
      setError(err.message || "Đăng ký không thành công. Vui lòng kiểm tra lại thông tin.");
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
        <form className="auth-register-form" onSubmit={handleSubmit} noValidate>
          <div className="auth-heading auth-heading-center">
            <h1>Tạo tài khoản mới</h1>
            <p>Vui lòng điền thông tin để đăng ký tài khoản.</p>
          </div>

          {/* Họ và tên */}
          <div className="auth-field-group">
            <label className={`auth-field ${fieldErrors.name ? "has-error" : ""}`}>
              <span>Họ và tên <b className="req-star">*</b></span>
              <div className="auth-input-wrap">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <circle cx="12" cy="8" r="3" />
                  <path d="M5 20a7 7 0 0 1 14 0" />
                </svg>
                <input
                  name="name"
                  type="text"
                  placeholder="VD: Nguyễn Văn An"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
            </label>
            {fieldErrors.name && <span className="auth-field-error">{fieldErrors.name}</span>}
          </div>

          {/* Email */}
          <div className="auth-field-group">
            <label className={`auth-field ${fieldErrors.email ? "has-error" : ""}`}>
              <span>Email (@gmail.com) <b className="req-star">*</b></span>
              <div className="auth-input-wrap">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M4 6h16v12H4z" />
                  <path d="m4 7 8 6 8-6" />
                </svg>
                <input
                  name="email"
                  type="email"
                  placeholder="VD: nguyenvanan@gmail.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </label>
            {fieldErrors.email && <span className="auth-field-error">{fieldErrors.email}</span>}
          </div>

          {/* Số điện thoại */}
          <div className="auth-field-group">
            <label className={`auth-field ${fieldErrors.phone ? "has-error" : ""}`}>
              <span>Số điện thoại (10 chữ số) <b className="req-star">*</b></span>
              <div className="auth-input-wrap">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M6 4h4l2 5-2.5 1.5a11 11 0 0 0 4 4L15 12l5 2v4c0 1-1 2-2 2A14 14 0 0 1 4 6c0-1 1-2 2-2z" />
                </svg>
                <input
                  name="phone"
                  type="tel"
                  placeholder="VD: 0987654321"
                  value={formData.phone}
                  onChange={handleChange}
                  maxLength={10}
                  required
                />
              </div>
            </label>
            {fieldErrors.phone && <span className="auth-field-error">{fieldErrors.phone}</span>}
          </div>

          {/* Mật khẩu */}
          <div className="auth-field-group">
            <label className={`auth-field ${fieldErrors.password ? "has-error" : ""}`}>
              <span>Mật khẩu (8-20 ký tự, chữ và số) <b className="req-star">*</b></span>
              <div className="auth-input-wrap">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <rect x="5" y="10" width="14" height="10" rx="2" />
                  <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                  <path d="M12 14v2" />
                </svg>
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Tạo mật khẩu (8-20 ký tự)"
                  value={formData.password}
                  onChange={handleChange}
                  maxLength={20}
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

          {/* Xác nhận mật khẩu */}
          <div className="auth-field-group">
            <label className={`auth-field ${fieldErrors.confirmPassword ? "has-error" : ""}`}>
              <span>Xác nhận mật khẩu <b className="req-star">*</b></span>
              <div className="auth-input-wrap">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <rect x="5" y="10" width="14" height="10" rx="2" />
                  <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                  <path d="M12 14v2" />
                </svg>
                <input
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Nhập lại mật khẩu"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  maxLength={20}
                  required
                />
                <button
                  type="button"
                  className="auth-input-action-btn"
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
            </label>
            {fieldErrors.confirmPassword && (
              <span className="auth-field-error">{fieldErrors.confirmPassword}</span>
            )}
          </div>

          {error && <p className="auth-error">{error}</p>}

          <button className="auth-submit auth-register-submit" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Đang đăng ký..." : "Đăng ký tài khoản"}
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
