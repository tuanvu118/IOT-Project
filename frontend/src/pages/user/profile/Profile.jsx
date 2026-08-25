import { Link } from "react-router-dom";

function Profile() {
  return (
    <div>
      <h1>Hồ sơ cá nhân</h1>

      <h3>Thông tin cá nhân</h3>

      <p>Họ và tên: --</p>
      <p>Email: --</p>
      <p>Số điện thoại: --</p>

      <h3>Liên hệ khẩn cấp</h3>

      <p>Tên người thân: --</p>
      <p>Số điện thoại người thân: --</p>

      <Link to="/profile/edit">
        <button>Chỉnh sửa thông tin</button>
      </Link>

      <Link to="/profile/change-password">
        <button>Đổi mật khẩu</button>
      </Link>
    </div>
  );
}

export default Profile;