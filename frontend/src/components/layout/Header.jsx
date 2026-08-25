import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header>
      <span>
        Xin chào, {user?.name || "Người dùng"}
      </span>

      <button onClick={handleLogout}>
        Đăng xuất
      </button>
    </header>
  );
}

export default Header;