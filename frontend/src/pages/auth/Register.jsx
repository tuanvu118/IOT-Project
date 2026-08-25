import { Link } from "react-router-dom";

function Register() {
  return (
    <div>
      <h1>Đăng ký tài khoản</h1>

      <form>
        <div>
          <label>Họ và tên</label>
          <br />
          <input type="text" placeholder="Nhập họ và tên" />
        </div>

        <div>
          <label>Email</label>
          <br />
          <input type="email" placeholder="Nhập email" />
        </div>

        <div>
          <label>Số điện thoại</label>
          <br />
          <input type="tel" placeholder="Nhập số điện thoại" />
        </div>

        <div>
          <label>Mật khẩu</label>
          <br />
          <input type="password" placeholder="Nhập mật khẩu" />
        </div>

        <button type="submit">Đăng ký</button>
      </form>

      <p>
        Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
      </p>

      <Link to="/">Về trang chủ</Link>
    </div>
  );
}

export default Register;