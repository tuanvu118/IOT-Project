import { NavLink } from "react-router-dom";

const items = [
  { to: "/dashboard", label: "Tổng quan", icon: "grid" },
  { to: "/tracking", label: "Theo dõi", icon: "pin" },
  { to: "/vehicles", label: "Phương tiện", icon: "bike" },
  { to: "/devices", label: "Thiết bị", icon: "device" },
  { to: "/profile", label: "Hồ sơ", icon: "user" },
];

function MobileNavIcon({ type }) {
  if (type === "grid") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" />
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
        <circle cx="6" cy="17" r="2.2" />
        <circle cx="18" cy="17" r="2.2" />
        <path d="M5 16h2l2.5-4h5L17 16h2M10 12 9 9h3M15 12l2-3h2" />
      </svg>
    );
  }

  if (type === "device") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 15h16v5H4z" />
        <path d="M8 15v-4a4 4 0 0 1 8 0v4M12 7V4" />
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

function MobileBottomNav() {
  return (
    <nav className="mobile-bottom-nav" aria-label="Điều hướng di động">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `mobile-bottom-nav-item ${isActive ? "active" : ""}`
          }
        >
          <MobileNavIcon type={item.icon} />
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

export default MobileBottomNav;