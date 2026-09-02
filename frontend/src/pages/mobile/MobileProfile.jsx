import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { getMyProfile } from "../../services/userService";
import "../../styles/pwa-mobile.css";

function MobileProfile() {
  const { user: authUser, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchProfile() {
      try {
        const data = await getMyProfile();
        if (isMounted && data) {
          setProfile(data);
        }
      } catch (err) {
        // Fallback to authUser if offline
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  const user = profile || authUser || {};

  const name = user.name || user.email?.split("@")[0] || "Người dùng";
  const email = user.email || "—";
  const phoneNumber = user.phone_number || user.phoneNumber || "—";
  const address = user.address || "—";
  const dateOfBirth = user.date_of_birth || user.dateOfBirth || "—";
  const citizenNumber = user.citizen_number || user.citizenNumber || "—";
  const avatarUrl = user.avatar_url || user.avatarUrl || localStorage.getItem("user_custom_avatar") || "";

  // SOS contact list
  const sosNumbers = user.sos_numbers || user.sosNumbers || [];

  const handleLogout = () => {
    if (window.confirm("Bạn có chắc chắn muốn đăng xuất tài khoản?")) {
      logout();
      navigate("/login");
    }
  };

  return (
    <div className="profile-page pwa-profile-page">
      {/* 1. Mobile Top Center Avatar Banner (matching Figma) */}
      <div className="pwa-profile-hero">
        <div className="pwa-profile-avatar-wrap">
          {avatarUrl ? (
            <img src={avatarUrl} alt={name} className="pwa-profile-avatar-img" />
          ) : (
            <div className="pwa-profile-avatar-placeholder">
              <span>{name.charAt(0).toUpperCase()}</span>
            </div>
          )}
        </div>
        <h2 className="pwa-profile-name">{name}</h2>
        <span className="pwa-profile-email">{email}</span>
        <Link to="/profile/edit" className="pwa-profile-edit-btn">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
            <path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
            <path d="m15 5 4 4" />
          </svg>
          Chỉnh sửa thông tin
        </Link>
      </div>

      {/* Desktop Heading (hidden on mobile) */}
      <div className="profile-heading desktop-only-heading">
        <h1>Hồ sơ cá nhân</h1>
        <p>Quản lý thông tin tài khoản và liên hệ khẩn cấp.</p>
      </div>

      {/* Desktop Summary Card */}
      <section className="profile-summary-card desktop-only-summary">
        <div className="profile-summary-left">
          {avatarUrl ? (
            <img src={avatarUrl} alt={name} className="profile-avatar-img" />
          ) : (
            <div className="profile-avatar-placeholder">
              <span>{name.charAt(0).toUpperCase()}</span>
            </div>
          )}
          <div className="profile-summary-info">
            <h2>{name}</h2>
            <span>{email}</span>
          </div>
        </div>

        <Link to="/profile/edit" className="profile-edit-btn">
          Chỉnh sửa thông tin
        </Link>
      </section>

      {/* 2. Personal Information Card */}
      <section className="profile-card profile-info-card pwa-profile-card">
        <div className="profile-card-header pwa-card-header">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#0066cc" strokeWidth="2.2" aria-hidden="true">
            <circle cx="12" cy="8" r="4" />
            <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
          </svg>
          <h2>Thông tin cá nhân</h2>
        </div>

        <div className="pwa-details-list">
          <div className="pwa-detail-row">
            <span className="pwa-detail-label">Họ tên</span>
            <strong className="pwa-detail-val">{name}</strong>
          </div>
          <div className="pwa-detail-row">
            <span className="pwa-detail-label">Email</span>
            <strong className="pwa-detail-val">{email}</strong>
          </div>
          <div className="pwa-detail-row">
            <span className="pwa-detail-label">Số điện thoại</span>
            <strong className="pwa-detail-val">{phoneNumber}</strong>
          </div>
          <div className="pwa-detail-row">
            <span className="pwa-detail-label">Địa chỉ</span>
            <strong className="pwa-detail-val">{address}</strong>
          </div>
          <div className="pwa-detail-row">
            <span className="pwa-detail-label">Ngày sinh</span>
            <strong className="pwa-detail-val">{dateOfBirth}</strong>
          </div>
          <div className="pwa-detail-row">
            <span className="pwa-detail-label">CCCD</span>
            <strong className="pwa-detail-val">{citizenNumber}</strong>
          </div>
        </div>
      </section>

      {/* 3. Emergency Contact Card */}
      <section className="profile-card profile-sos-card pwa-profile-card">
        <div className="profile-card-header pwa-card-header pwa-header-with-action">
          <div className="pwa-card-header-left">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#ef4444" strokeWidth="2.2" aria-hidden="true">
              <rect x="2" y="7" width="20" height="14" rx="2" />
              <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
              <line x1="12" y1="11" x2="12" y2="17" />
              <line x1="9" y1="14" x2="15" y2="14" />
            </svg>
            <h2>Liên hệ khẩn cấp</h2>
          </div>
          <Link to="/profile/edit" className="pwa-header-edit-icon" aria-label="Chỉnh sửa liên hệ khẩn cấp">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#0066cc" strokeWidth="2.2" aria-hidden="true">
              <path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
              <path d="m15 5 4 4" />
            </svg>
          </Link>
        </div>

        <div className="pwa-details-list">
          {sosNumbers.length > 0 ? (
            sosNumbers.map((phone, idx) => (
              <div className="pwa-detail-row" key={idx}>
                <span className="pwa-detail-label">
                  Số điện thoại khẩn cấp {sosNumbers.length > 1 ? `#${idx + 1}` : ""}
                </span>
                <strong className="pwa-detail-val">{phone}</strong>
              </div>
            ))
          ) : (
            <div className="pwa-detail-row">
              <span className="pwa-detail-label">Số điện thoại khẩn cấp</span>
              <strong className="pwa-detail-val" style={{ color: "#94a3b8", fontWeight: "400" }}>
                Chưa thiết lập số khẩn cấp
              </strong>
            </div>
          )}
        </div>

        <div className="pwa-profile-sms-callout">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#0066cc" strokeWidth="2" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          <span>Số điện thoại này sẽ nhận SMS cảnh báo khi hệ thống phát hiện tai nạn.</span>
        </div>
      </section>

      {/* 4. Security / Change Password Nav Link */}
      <Link to="/profile/change-password" className="pwa-profile-link-card">
        <div className="pwa-link-card-left">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#475569" strokeWidth="2" aria-hidden="true">
            <rect x="3" y="11" width="18" height="11" rx="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <strong>Đổi mật khẩu</strong>
        </div>
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#94a3b8" strokeWidth="2.2" aria-hidden="true">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </Link>

      {/* 5. Logout Button (Figma red outline pill) */}
      <button type="button" className="pwa-profile-logout-btn" onClick={handleLogout}>
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
        Đăng xuất
      </button>
    </div>
  );
}

export default MobileProfile;
