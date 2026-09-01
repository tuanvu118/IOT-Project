import { NavLink, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

const items = [
  { to: "/admin", label: "Dashboard", icon: "grid", end: true },
  { to: "/admin/users", label: "Người dùng", icon: "users" },
  { to: "/admin/devices", label: "Thiết bị", icon: "device" },
  { to: "/admin/settings", label: "Cài đặt hệ thống", icon: "settings" },
];

function AdminSidebarIcon({ type }) {
  if (type === "grid") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    );
  }

  if (type === "users") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    );
  }

  if (type === "device") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <rect x="4" y="14" width="16" height="7" rx="2" />
        <line x1="12" y1="14" x2="12" y2="8" />
        <path d="M8 10a4 4 0 0 1 8 0" />
        <path d="M6 7a7 7 0 0 1 12 0" />
      </svg>
    );
  }

  if (type === "settings") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M5 16h2l2.5-4h5L17 16h2" />
      <circle cx="6" cy="17" r="2.2" />
      <circle cx="18" cy="17" r="2.2" />
    </svg>
  );
}

function AdminSidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <aside className="user-sidebar admin-sidebar">
      {/* Brand logo matching screenshot */}
      <div className="user-sidebar-brand">
        <div className="user-sidebar-logo" style={{ background: "#2563eb" }}>
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M5 16h2l2.5-4h5L17 16h2" />
            <circle cx="6" cy="17" r="2.2" />
            <circle cx="18" cy="17" r="2.2" />
            <path d="M10 12 9 9h3M15 12l2-3h2" />
          </svg>
        </div>
        <div>
          <strong style={{ fontSize: "16px", color: "#0f172a" }}>SmartBike IoT</strong>
          <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "600" }}>Admin Portal</span>
        </div>
      </div>

      <nav className="user-sidebar-nav" aria-label="Menu quản trị">
        {items.map((item) => (
          <NavLink
            className={({ isActive }) =>
              `user-sidebar-link ${isActive ? "active" : ""}`
            }
            to={item.to}
            end={item.end}
            key={item.to}
          >
            <AdminSidebarIcon type={item.icon} />
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

export default AdminSidebar;