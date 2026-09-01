import { NavLink, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

const items = [
  { to: "/dashboard", label: "Tổng quan", icon: "grid" },
  { to: "/tracking", label: "Theo dõi vị trí", icon: "pin" },
  { to: "/vehicles", label: "Phương tiện", icon: "bike" },
  { to: "/devices", label: "Thiết bị IoT", icon: "device" },
  { to: "/profile", label: "Hồ sơ cá nhân", icon: "user" },
];

function SidebarIcon({ type }) {
  if (type === "grid") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z" />
      </svg>
    );
  }

  if (type === "pin") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 21s7-4.5 7-11a7 7 0 0 0-14 0c0 6.5 7 11 7 11z" />
        <circle cx="12" cy="10" r="2.5" />
      </svg>
    );
  }

  if (type === "bike") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 16h2l2.5-4h5L17 16h2" />
        <circle cx="6" cy="17" r="2.2" />
        <circle cx="18" cy="17" r="2.2" />
        <path d="M10 12 9 9h3M15 12l2-3h2" />
      </svg>
    );
  }

  if (type === "device") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 15h16v5H4z" />
        <path d="M8 15v-4a4 4 0 0 1 8 0v4" />
        <path d="M7 18h.01M17 18h.01M12 7V4m-4 2L6 4m10 2 2-2" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="8" r="3" />
      <path d="M5 20a7 7 0 0 1 14 0" />
    </svg>
  );
}

function UserSidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <aside className="user-sidebar">
      <div className="user-sidebar-brand">
        <div className="user-sidebar-logo">
          <SidebarIcon type="bike" />
        </div>
        <div>
          <strong>SmartBike IoT</strong>
          <span>Hệ thống giám sát xe máy</span>
        </div>
      </div>

      <nav className="user-sidebar-nav" aria-label="Menu người dùng">
        {items.map((item) => (
          <NavLink className="user-sidebar-link" to={item.to} key={item.to}>
            <SidebarIcon type={item.icon} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <button className="user-sidebar-logout" type="button" onClick={handleLogout}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
        <span>Đăng xuất</span>
      </button>
    </aside>
  );
}

export default UserSidebar;
