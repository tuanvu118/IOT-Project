import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import useAuth from "../../hooks/useAuth";
import { loginUser } from "../../services/authService";
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

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const formData = new FormData(event.currentTarget);
      const authData = await loginUser({
        email: String(formData.get("email") || "").trim(),
        password: String(formData.get("password") || ""),
      });

      login(authData);
      navigate(authData.user?.is_admin || authData.user?.isAdmin ? "/admin" : "/dashboard");
    } catch (err) {
      setError(err.message);
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
        <form className="auth-card" onSubmit={handleSubmit}>
          <div className="auth-heading">
            <h1>Đăng nhập</h1>
            <p>Vui lòng nhập thông tin để tiếp tục.</p>
          </div>

          <label className="auth-field">
            <span>EMAIL</span>
            <div className="auth-input-wrap">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4 6h16v12H4z" />
                <path d="m4 7 8 6 8-6" />
              </svg>
              <input name="email" type="email" placeholder="Nhập địa chỉ email" required />
            </div>
          </label>

          <label className="auth-field">
            <span>MẬT KHẨU</span>
            <div className="auth-input-wrap">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <rect x="5" y="10" width="14" height="10" rx="2" />
                <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                <path d="M12 14v2" />
              </svg>
              <input name="password" type="password" placeholder="Nhập mật khẩu" required />
              <svg className="auth-input-action" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </div>
          </label>

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
              Chưa có tài khoản? <Link to="/register">Đăng ký</Link>
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
