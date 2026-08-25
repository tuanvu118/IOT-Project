import { Link, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const loginUser = () => {
    login({
      id: "USER001",
      name: "Người dùng demo",
      isAdmin: false,
    });

    navigate("/dashboard");
  };

  const loginAdmin = () => {
    login({
      id: "ADMIN001",
      name: "Quản trị viên",
      isAdmin: true,
    });

    navigate("/admin");
  };

  return (
    <div>
      <h1>Đăng nhập</h1>

      <form>
        <div>
          <label>Email</label>
          <br />
          <input type="email" />
        </div>

        <div>
          <label>Mật khẩu</label>
          <br />
          <input type="password" />
        </div>
      </form>

      <br />

      <button type="button" onClick={loginUser}>
        Đăng nhập thử User
      </button>

      <button type="button" onClick={loginAdmin}>
        Đăng nhập thử Admin
      </button>

      <p>
        Chưa có tài khoản?{" "}
        <Link to="/register">Đăng ký</Link>
      </p>

      <Link to="/">Về trang chủ</Link>
    </div>
  );
}

export default Login;