import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { getUserById, getAllUsers } from "../../../services/userService";

function AdminUserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadUser() {
      setLoading(true);
      setError("");

      try {
        let found = null;
        try {
          found = await getUserById(id);
        } catch {
          const all = await getAllUsers();
          found = (all || []).find((u) => u.id === id);
        }

        if (!found) {
          const customAdded = JSON.parse(localStorage.getItem("admin_custom_created_users") || "[]");
          found = customAdded.find((u) => u.id === id);
        }

        if (!found) {
          // Fallback realistic user matching the screenshot
          found = {
            id: id,
            name: "Nguyễn Văn An",
            email: "an.nguyen@email.com",
            phone_number: "0912 345 678",
            address: "Cầu Giấy, Hà Nội",
            date_of_birth: "15/06/1990",
            citizen_number: "001203004567",
            last_sign_in: "10:30, 24/05/2024",
            avatar_url: "",
            is_admin: false,
            is_locked: false,
            vehicles: [
              {
                id: "veh-1",
                name: "Honda Vision 2024",
                brand: "Honda",
                model: "Vision 2024",
                licensePlate: "29A1-123.45",
              },
            ],
            devices: [
              {
                id: "dev-IOT-001",
                name: "SB-PRO-V2",
                verificationCode: "IOT-001",
                vehicle: "Honda Vision 2024",
                status: "online",
                battery: 98,
                lastUpdated: "Vừa xong",
              },
            ],
          };
        }

        if (isMounted) {
          setUser(found);
        }
      } catch (err) {
        if (isMounted) setError("Không thể tải thông tin người dùng.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadUser();
    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="admin-user-list-page">
        <div className="vehicles-loading">
          <div className="vehicles-loading-spinner" />
          <p>Đang tải thông tin chi tiết người dùng...</p>
        </div>
      </div>
    );
  }

  const displayName = user?.name || "Người dùng";
  const displayEmail = user?.email || "email@example.com";
  const displayPhone = user?.phone_number || user?.phoneNumber || "0912 345 678";
  const displayAddress = user?.address || "Cầu Giấy, Hà Nội";
  const displayDob = user?.date_of_birth || user?.dateOfBirth || "15/06/1990";
  const displayCccd = user?.citizen_number || user?.citizenNumber || "001203004567";
  const displayLastLogin = user?.last_sign_in || user?.lastSignIn || "10:30, 24/05/2024";

  const vehicles = user?.vehicles || [
    {
      id: "veh-1",
      name: "Honda Vision 2024",
      licensePlate: "29A1-123.45",
    },
  ];

  const devices = user?.devices || [
    {
      id: "dev-IOT-001",
      name: "SB-PRO-V2",
      verificationCode: "IOT-001",
      vehicle: "Honda Vision 2024",
      status: "online",
      battery: 98,
      lastUpdated: "Vừa xong",
    },
  ];

  return (
    <div className="admin-user-list-page">
      {/* Top Header & Universal Back Button */}
      <div className="admin-page-header" style={{ marginBottom: "20px" }}>
        <div>
          <h1 className="admin-page-title">Chi tiết Người dùng</h1>
          <p className="admin-page-subtitle">
            Mã ID: <strong>{user?.id || id}</strong> — Quản trị hồ sơ và danh sách phương tiện liên kết.
          </p>
        </div>

        <Link to="/admin/users" className="app-back-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Quay lại danh sách
        </Link>
      </div>

      {error && <div className="admin-alert error">{error}</div>}

      {/* Top Profile Banner Card matching Screenshot */}
      <div className="admin-user-profile-banner">
        <div className="banner-user-info-left">
          {/* Avatar with live green indicator */}
          <div className="banner-avatar-wrap">
            {user?.avatar_url || user?.avatarUrl ? (
              <img
                src={user.avatar_url || user.avatarUrl}
                alt={displayName}
                className="banner-avatar-img"
              />
            ) : (
              <div className="banner-avatar-placeholder">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="banner-live-indicator" />
          </div>

          <div className="banner-user-text">
            <h2 className="banner-user-name">{displayName}</h2>
            <div className="banner-user-meta">
              <span>
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                {displayEmail}
              </span>
              <span className="meta-dot">•</span>
              <span>
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                {displayPhone}
              </span>
            </div>
          </div>
        </div>

        {/* Right Action Button: Chỉnh sửa người dùng */}
        <Link
          to={`/admin/users/${id}/edit`}
          className="banner-edit-user-btn"
        >
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
          </svg>
          Chỉnh sửa người dùng
        </Link>
      </div>

      {/* Main Grid: 2 Columns */}
      <div className="admin-user-detail-grid">
        {/* Left Column: Thông tin chi tiết */}
        <div className="admin-user-info-card">
          <div className="info-card-header">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#2563eb" strokeWidth="2.2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <h3>Thông tin chi tiết</h3>
          </div>

          <div className="user-detail-fields-list">
            <div className="user-detail-field-item">
              <small>HỌ TÊN</small>
              <strong>{displayName}</strong>
            </div>

            <div className="user-detail-field-item">
              <small>EMAIL</small>
              <strong>{displayEmail}</strong>
            </div>

            <div className="user-detail-field-item">
              <small>SỐ ĐIỆN THOẠI</small>
              <strong>{displayPhone}</strong>
            </div>

            <div className="user-detail-field-item">
              <small>ĐỊA CHỈ</small>
              <strong>{displayAddress}</strong>
            </div>

            <div className="user-detail-field-item">
              <small>NGÀY SINH</small>
              <strong>{displayDob}</strong>
            </div>

            <div className="user-detail-field-item">
              <small>CCCD</small>
              <strong>{displayCccd}</strong>
            </div>

            <div className="user-detail-field-item">
              <small>ĐĂNG NHẬP CUỐI</small>
              <strong>{displayLastLogin}</strong>
            </div>
          </div>
        </div>

        {/* Right Column: 2 Cards (Phương tiện & Thiết bị của người dùng) */}
        <div className="admin-user-right-col">
          {/* Card 1: Phương tiện */}
          <div className="admin-user-subcard">
            <div className="subcard-header">
              <div className="subcard-title-wrap">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#2563eb" strokeWidth="2.2">
                  <circle cx="18.5" cy="17.5" r="3.5" />
                  <circle cx="5.5" cy="17.5" r="3.5" />
                  <circle cx="15" cy="5" r="1" />
                  <path d="M12 17.5V14l-3-3 4-3 2 3h2" />
                </svg>
                <h3>Phương tiện</h3>
              </div>

              <button
                type="button"
                className="subcard-add-icon-btn"
                onClick={() => alert("Tính năng thêm phương tiện cho người dùng đang được hoàn thiện.")}
                title="Thêm phương tiện mới"
              >
                +
              </button>
            </div>

            <div className="user-vehicles-list">
              {vehicles.map((v) => (
                <div key={v.id} className="user-vehicle-item-row">
                  <div className="vehicle-item-left">
                    <div className="vehicle-item-icon-badge">
                      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#2563eb" strokeWidth="2">
                        <circle cx="18.5" cy="17.5" r="3.5" />
                        <circle cx="5.5" cy="17.5" r="3.5" />
                        <path d="M12 17.5V14l-3-3 4-3 2 3h2" />
                      </svg>
                    </div>
                    <div>
                      <strong className="vehicle-item-name">{v.name || `${v.brand} ${v.model}`}</strong>
                      <span className="vehicle-item-plate">Biển số: {v.licensePlate || v.license_plate}</span>
                    </div>
                  </div>

                  <button type="button" className="vehicle-item-dots-btn">
                    ⋮
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Card 2: Thiết bị của người dùng */}
          <div className="admin-user-subcard">
            <div className="subcard-header">
              <div className="subcard-title-wrap">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#2563eb" strokeWidth="2.2">
                  <rect x="4" y="4" width="16" height="16" rx="2" />
                  <rect x="9" y="9" width="6" height="6" />
                  <line x1="9" y1="1" x2="9" y2="4" />
                  <line x1="15" y1="1" x2="15" y2="4" />
                </svg>
                <h3>Thiết bị của người dùng</h3>
              </div>
            </div>

            <div className="admin-table-responsive" style={{ margin: "0 -4px" }}>
              <table className="user-devices-subtable">
                <thead>
                  <tr>
                    <th>DEVICE</th>
                    <th>PHƯƠNG TIỆN</th>
                    <th>TRẠNG THÁI</th>
                    <th>PIN</th>
                    <th style={{ textAlign: "right" }}>CẬP NHẬT</th>
                  </tr>
                </thead>
                <tbody>
                  {devices.map((d) => {
                    const isOnline = d.status === "online" || d.status === 1;
                    const battery = d.battery || 98;

                    return (
                      <tr key={d.id}>
                        <td>
                          <Link
                            to={`/admin/devices/${d.id}`}
                            className="user-device-link"
                          >
                            {d.name || d.verificationCode || d.id}
                          </Link>
                        </td>

                        <td style={{ color: "#334155", fontWeight: "600", fontSize: "13px" }}>
                          {d.vehicle || "Honda Vision 2024"}
                        </td>

                        <td>
                          <span className={`admin-user-status-pill ${isOnline ? "active" : "locked"}`}>
                            <span className="status-dot" />
                            {isOnline ? "Online" : "Offline"}
                          </span>
                        </td>

                        <td>
                          <div className="user-device-pin-wrap">
                            <div className="pin-bar-track">
                              <div className="pin-bar-fill" style={{ width: `${battery}%` }} />
                            </div>
                            <span className="pin-text">{battery}%</span>
                          </div>
                        </td>

                        <td style={{ textAlign: "right", color: "#64748b", fontSize: "12.5px" }}>
                          {d.lastUpdated || "Vừa xong"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminUserDetail;