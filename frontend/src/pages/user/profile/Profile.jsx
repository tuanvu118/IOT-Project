import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useAuth from "../../../hooks/useAuth";
import { getMyProfile } from "../../../services/userService";

function Profile() {
  const { user: authUser } = useAuth();
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

  const name = user.name || "Nguyễn Văn An";
  const email = user.email || "nguyenvanan@gmail.com";
  const phoneNumber = user.phone_number || user.phoneNumber || "0912 345 678";
  const address = user.address || "Cầu Giấy, Hà Nội";
  const dateOfBirth = user.date_of_birth || user.dateOfBirth || "15/06/2003";
  const citizenNumber = user.citizen_number || user.citizenNumber || "001203xxxxxx";
  const avatarUrl = user.avatar_url || user.avatarUrl || localStorage.getItem("user_custom_avatar") || "";

  // SOS contact list
  const sosNumbers = user.sos_numbers || user.sosNumbers || [];
  const displaySosNumbers = sosNumbers.length > 0 ? sosNumbers : ["0987 654 321"];

  return (
    <div className="profile-page">
      {/* Heading */}
      <div className="profile-heading">
        <h1>Hồ sơ cá nhân</h1>
        <p>Quản lý thông tin tài khoản và liên hệ khẩn cấp.</p>
      </div>

      {/* 1. Summary Card */}
      <section className="profile-summary-card">
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
      <section className="profile-card profile-info-card">
        <div className="profile-card-header">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path d="M7 15h0M2 9h20M7 9v6" />
          </svg>
          <h2>Thông tin cá nhân</h2>
        </div>

        <div className="profile-details-rows">
          <div className="profile-details-row">
            <div className="profile-detail-col">
              <small>HỌ VÀ TÊN</small>
              <strong>{name}</strong>
            </div>
            <div className="profile-detail-col">
              <small>EMAIL</small>
              <strong>{email}</strong>
            </div>
          </div>

          <div className="profile-details-row">
            <div className="profile-detail-col">
              <small>SỐ ĐIỆN THOẠI</small>
              <strong>{phoneNumber}</strong>
            </div>
            <div className="profile-detail-col">
              <small>ĐỊA CHỈ</small>
              <strong>{address}</strong>
            </div>
          </div>

          <div className="profile-details-row">
            <div className="profile-detail-col">
              <small>NGÀY SINH</small>
              <strong>{dateOfBirth}</strong>
            </div>
            <div className="profile-detail-col">
              <small>CCCD</small>
              <strong>{citizenNumber}</strong>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Bottom Grid: Liên hệ khẩn cấp & Bảo mật */}
      <div className="profile-bottom-grid">
        {/* SOS Emergency Contact */}
        <section className="profile-card profile-sos-card">
          <div className="profile-card-header sos-header">
            <span className="sos-asterisk">✱</span>
            <h2>Liên hệ khẩn cấp</h2>
          </div>

          <div className="profile-sos-body">
            {displaySosNumbers.map((phone, idx) => (
              <div key={idx} className="profile-sos-field">
                <small>
                  SỐ ĐIỆN THOẠI KHẨN CẤP {displaySosNumbers.length > 1 ? `#${idx + 1}` : ""}
                </small>
                <strong>{phone}</strong>
              </div>
            ))}

            <div className="profile-sos-note">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              <span>Số điện thoại này sẽ nhận SMS cảnh báo khi hệ thống phát hiện tai nạn.</span>
            </div>
          </div>
        </section>

        {/* Security Card */}
        <section className="profile-card profile-security-card">
          <div className="profile-card-header security-header">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <h2>Bảo mật</h2>
          </div>

          <div className="profile-security-body">
            <strong>Bảo mật tài khoản</strong>
            <p>Cập nhật mật khẩu để bảo vệ tài khoản của bạn.</p>

            <Link to="/profile/change-password" className="profile-change-pw-link">
              Đổi mật khẩu &rarr;
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Profile;
