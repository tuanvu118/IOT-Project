import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import {
  getRecentAlerts,
  getUnreadNotificationCount,
  markAllNotificationsAsRead,
} from "../../services/alertService";
import "../../styles/pwa-mobile.css";

function getNotificationTone(notification) {
  const type = String(notification.type || "").toLowerCase();
  const title = String(notification.title || "").toLowerCase();

  if (type.includes("accident") || title.includes("tai nạn") || title.includes("va chạm")) {
    return "danger";
  }

  if (type.includes("battery") || title.includes("pin")) {
    return "battery";
  }

  return "warning";
}

function formatNotificationTime(value) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  const diffMinutes = Math.max(0, Math.floor((Date.now() - date.getTime()) / 60000));

  if (diffMinutes < 1) return "Vừa xong";
  if (diffMinutes < 60) return `${diffMinutes} phút trước`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} giờ trước`;

  const diffDays = Math.floor(diffHours / 24);
  return diffDays === 1 ? "Hôm qua" : `${diffDays} ngày trước`;
}

function NotificationIcon({ tone }) {
  if (tone === "danger") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 4 21 20H3z" />
        <path d="M12 9v5M12 17h.01" />
      </svg>
    );
  }

  if (tone === "battery") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M9 5h6v3H9zM8 8h8v12H8z" />
        <path d="M11 11h2M11 14h2" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3 20 6v6c0 5-3.2 8.1-8 10-4.8-1.9-8-5-8-10V6z" />
      <path d="M9 12h6M15 9l-6 6" />
    </svg>
  );
}

function MobileHeader() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const pathname = location.pathname;

  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef(null);
  const displayName = user?.name || user?.email?.split("@")[0] || "Người dùng";
  const avatarUrl =
    user?.avatarUrl ||
    user?.avatar_url ||
    localStorage.getItem("user_custom_avatar") ||
    "";

  const getPageInfo = () => {
    if (pathname === "/dashboard") return { type: "dashboard" };
    if (pathname === "/tracking") return { type: "tracking", title: "Theo dõi vị trí" };
    if (pathname === "/vehicles") return { type: "vehicles", title: "Phương tiện của tôi" };
    if (pathname === "/devices") return { type: "devices", title: "Thiết bị của tôi" };
    if (pathname === "/profile") return { type: "profile", title: "SmartBike IoT" };
    if (pathname === "/alerts") return { type: "subpage", title: "Lịch sử cảnh báo" };
    if (pathname.startsWith("/alerts/")) return { type: "subpage", title: "Chi tiết cảnh báo" };
    if (pathname === "/vehicles/add") return { type: "subpage", title: "Thêm phương tiện" };
    if (pathname.includes("/vehicles/") && pathname.includes("/edit")) return { type: "subpage", title: "Sửa phương tiện" };
    if (pathname === "/devices/add") return { type: "subpage", title: "Thêm thiết bị" };
    if (pathname === "/devices/link") return { type: "subpage", title: "Liên kết thiết bị" };
    if (pathname.startsWith("/devices/")) return { type: "subpage", title: "Chi tiết thiết bị" };
    if (pathname === "/profile/edit") return { type: "subpage", title: "Chỉnh sửa hồ sơ" };
    if (pathname === "/profile/change-password") return { type: "subpage", title: "Đổi mật khẩu" };
    return { type: "default", title: "SmartBike IoT" };
  };

  const pageInfo = getPageInfo();

  useEffect(() => {
    let isMounted = true;

    async function loadUnreadCount() {
      try {
        const data = await getUnreadNotificationCount();
        if (isMounted) {
          setUnreadCount(data?.unread_count || 0);
        }
      } catch {
        if (isMounted) {
          setUnreadCount(0);
        }
      }
    }

    if (user) {
      loadUnreadCount();
    }

    return () => {
      isMounted = false;
    };
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const loadNotifications = async () => {
    setIsLoading(true);

    try {
      const data = await getRecentAlerts(5);
      setNotifications(data || []);
    } catch {
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleNotifications = () => {
    const nextOpen = !isOpen;
    setIsOpen(nextOpen);

    if (nextOpen) {
      loadNotifications();
    }
  };

  const handleMarkAllAsRead = async () => {
    await markAllNotificationsAsRead();
    setUnreadCount(0);
    setNotifications((current) =>
      current.map((notification) => ({
        ...notification,
        is_read: true,
      })),
    );
  };

  return (
    <header className="user-topbar pwa-header">
      {/* Mobile Adaptive Left Header */}
      <div className="pwa-header-left">
        {pageInfo.type === "dashboard" && (
          <div className="pwa-header-greeting">
            <span className="pwa-greeting-sub">Xin chào,</span>
            <strong className="pwa-greeting-name">{displayName} 👋</strong>
          </div>
        )}

        {pageInfo.type === "profile" && (
          <div className="pwa-header-brand">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#0066cc" strokeWidth="2" aria-hidden="true">
              <path d="M5 16h2l2.5-4h5L17 16h2M10 12 9 9h3M15 12l2-3h2" />
              <circle cx="6" cy="17" r="2.2" />
              <circle cx="18" cy="17" r="2.2" />
            </svg>
            <span>SmartBike IoT</span>
          </div>
        )}

        {(pageInfo.type === "tracking" || pageInfo.type === "vehicles" || pageInfo.type === "devices") && (
          <h1 className="pwa-header-title">{pageInfo.title}</h1>
        )}

        {pageInfo.type === "subpage" && (
          <div className="pwa-header-back-wrap">
            <button
              type="button"
              className="pwa-back-btn"
              onClick={() => navigate(-1)}
              aria-label="Quay lại"
            >
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="pwa-header-title">{pageInfo.title}</h1>
          </div>
        )}
      </div>

      {/* Right Header Controls */}
      <div className="user-topbar-right pwa-header-right">
        <div className="notification-wrap" ref={dropdownRef}>
          <button
            className="user-bell"
            type="button"
            aria-label="Thông báo"
            aria-expanded={isOpen}
            onClick={toggleNotifications}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
              <path d="M10 21h4" />
            </svg>
            {unreadCount > 0 && <span />}
          </button>

          {isOpen && (
            <section className="notification-dropdown">
              <div className="notification-header">
                <h2>Thông báo</h2>
                <button type="button" onClick={handleMarkAllAsRead}>
                  Đánh dấu đã đọc
                </button>
              </div>

              <div className="notification-list">
                {isLoading ? (
                  <p className="notification-empty">Đang tải thông báo...</p>
                ) : notifications.length > 0 ? (
                  notifications.map((notification) => {
                    const tone = getNotificationTone(notification);

                    return (
                      <Link
                        className="notification-item"
                        key={notification.id}
                        to={`/alerts/${notification.id}`}
                        onClick={() => setIsOpen(false)}
                      >
                        {!notification.is_read && <span className="notification-unread-dot" />}
                        <span className={`notification-icon ${tone}`}>
                          <NotificationIcon tone={tone} />
                        </span>
                        <div>
                          <div className="notification-item-top">
                            <strong>{notification.title || "Thông báo"}</strong>
                            <time>
                              {formatNotificationTime(
                                notification.created_at || notification.createdAt,
                              )}
                            </time>
                          </div>
                          <p>{notification.content || notification.description || "Chưa có nội dung."}</p>
                        </div>
                      </Link>
                    );
                  })
                ) : (
                  <p className="notification-empty">Chưa có thông báo nào.</p>
                )}
              </div>

              <Link className="notification-all-link" to="/alerts" onClick={() => setIsOpen(false)}>
                Xem tất cả thông báo →
              </Link>
            </section>
          )}
        </div>

        <strong className="desktop-only-user-name">{displayName}</strong>
        {avatarUrl ? (
          <img className="user-avatar" src={avatarUrl} alt={displayName} />
        ) : (
          <div className="user-avatar user-avatar-placeholder">
            <span>{displayName.charAt(0).toUpperCase()}</span>
          </div>
        )}
      </div>
    </header>
  );
}

export default MobileHeader;

