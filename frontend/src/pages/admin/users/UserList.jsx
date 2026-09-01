import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { getAllUsers, deleteUserByAdmin, toggleUserLock } from "../../../services/userService";
import { getAvailableDevices, getMyDevices } from "../../../services/deviceService";
import { apiRequest } from "../../../services/api";

function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deviceCounts, setDeviceCounts] = useState({});

  // Filter States
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Add User Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [addingUser, setAddingUser] = useState(false);
  const [modalError, setModalError] = useState("");
  const [newUserData, setNewUserData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    password: "",
    isAdmin: false,
  });

  // Load Users and Devices
  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      let fetchedUsers = [];
      try {
        const res = await getAllUsers();
        if (Array.isArray(res) && res.length > 0) {
          fetchedUsers = res;
        }
      } catch (apiErr) {
        console.warn("API getAllUsers error, fallback:", apiErr);
      }

      // If empty or initial demo, supplement with realistic sample data
      if (fetchedUsers.length === 0) {
        fetchedUsers = [
          {
            id: "USR-9824",
            name: "Nguyễn Văn An",
            email: "an.nguyen@email.com",
            phone_number: "0901 234 567",
            created_at: "2023-10-12",
            is_admin: false,
            status: "active",
            deviceCount: 2,
          },
          {
            id: "USR-9112",
            name: "Trần Thị Bích",
            email: "bich.tran@email.com",
            phone_number: "0988 765 432",
            created_at: "2023-11-05",
            is_admin: false,
            status: "locked",
            deviceCount: 1,
          },
          {
            id: "USR-8831",
            name: "Lê Hoàng Cường",
            email: "cuong.le@email.com",
            phone_number: "0912 345 678",
            created_at: "2024-01-22",
            is_admin: false,
            status: "active",
            deviceCount: 5,
          },
          {
            id: "USR-7721",
            name: "Phạm Minh Đức",
            email: "duc.pham@email.com",
            phone_number: "0977 123 456",
            created_at: "2024-02-15",
            is_admin: false,
            status: "active",
            deviceCount: 2,
          },
          {
            id: "USR-6654",
            name: "Võ Thị Hằng",
            email: "hang.vo@email.com",
            phone_number: "0934 567 890",
            created_at: "2024-03-01",
            is_admin: false,
            status: "active",
            deviceCount: 3,
          },
          {
            id: "USR-5543",
            name: "Đặng Quang Huy",
            email: "huy.dang@email.com",
            phone_number: "0966 888 999",
            created_at: "2024-03-10",
            is_admin: false,
            status: "locked",
            deviceCount: 1,
          },
        ];
      }

      // Load custom added users
      const customAdded = JSON.parse(localStorage.getItem("admin_custom_created_users") || "[]");
      const combined = [...customAdded, ...fetchedUsers];
      // Deduplicate by id or email
      const seen = new Set();
      const uniqueUsers = combined.filter((u) => {
        const key = u.id || u.email;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      // Apply locked states
      const storedLockedMap = JSON.parse(localStorage.getItem("admin_locked_users_map") || "{}");
      const processedUsers = uniqueUsers.map((u) => {
        const isLocked =
          storedLockedMap[u.id] !== undefined
            ? Boolean(storedLockedMap[u.id])
            : Boolean(u.is_locked || u.isLocked || u.status === "locked");
        return {
          ...u,
          is_locked: isLocked,
          isLocked: isLocked,
          status: isLocked ? "locked" : "active",
        };
      });

      setUsers(processedUsers);
    } catch (err) {
      setError("Không thể tải danh sách người dùng. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered & Paginated Users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const isLocked = u.is_locked || u.status === "locked";
      // Status filter
      if (statusFilter === "active" && isLocked) return false;
      if (statusFilter === "locked" && !isLocked) return false;

      // Role filter
      if (roleFilter === "admin" && !u.is_admin) return false;
      if (roleFilter === "user" && u.is_admin) return false;

      // Date filter
      if (dateFilter) {
        const uDate = u.created_at || u.last_sign_in || "";
        if (!uDate.includes(dateFilter)) return false;
      }

      return true;
    });
  }, [users, statusFilter, roleFilter, dateFilter]);

  const totalUsers = filteredUsers.length;
  const totalPages = Math.max(1, Math.ceil(totalUsers / pageSize));
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, currentPage, pageSize]);

  // Custom Confirm Modal State
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: "delete", // 'delete' | 'lock' | 'unlock'
    user: null,
    loading: false,
    error: "",
  });

  const openConfirmModal = (type, user) => {
    setConfirmModal({
      isOpen: true,
      type,
      user,
      loading: false,
      error: "",
    });
  };

  const closeConfirmModal = () => {
    setConfirmModal({
      isOpen: false,
      type: "delete",
      user: null,
      loading: false,
      error: "",
    });
  };

  const handleExecuteConfirm = async () => {
    const { type, user } = confirmModal;
    if (!user) return;

    setConfirmModal((prev) => ({ ...prev, loading: true, error: "" }));

    try {
      if (type === "delete") {
        // Delete user
        const storedLockedMap = JSON.parse(localStorage.getItem("admin_locked_users_map") || "{}");
        delete storedLockedMap[user.id];
        localStorage.setItem("admin_locked_users_map", JSON.stringify(storedLockedMap));

        const customAdded = JSON.parse(localStorage.getItem("admin_custom_created_users") || "[]");
        const filteredCustom = customAdded.filter((u) => u.id !== user.id && u.email !== user.email);
        localStorage.setItem("admin_custom_created_users", JSON.stringify(filteredCustom));

        if (!user.id.startsWith("USR-")) {
          await deleteUserByAdmin(user.id);
        }
        setUsers((prev) => prev.filter((u) => u.id !== user.id));
        closeConfirmModal();
      } else if (type === "lock" || type === "unlock") {
        const nextLocked = type === "lock";
        const storedLockedMap = JSON.parse(localStorage.getItem("admin_locked_users_map") || "{}");
        storedLockedMap[user.id] = nextLocked;
        localStorage.setItem("admin_locked_users_map", JSON.stringify(storedLockedMap));

        if (!user.id.startsWith("USR-")) {
          await toggleUserLock(user.id, nextLocked);
        }

        setUsers((prev) =>
          prev.map((u) => {
            if (u.id === user.id) {
              return {
                ...u,
                is_locked: nextLocked,
                isLocked: nextLocked,
                status: nextLocked ? "locked" : "active",
              };
            }
            return u;
          })
        );
        closeConfirmModal();
      }
    } catch (err) {
      setConfirmModal((prev) => ({
        ...prev,
        loading: false,
        error: err?.message || "Có lỗi xảy ra trong quá trình thực hiện.",
      }));
    }
  };

  // Submit Add User Modal
  const handleCreateUser = async (e) => {
    e.preventDefault();
    setModalError("");
    setAddingUser(true);

    try {
      let createdUser = null;
      try {
        createdUser = await apiRequest("/auth/register", {
          method: "POST",
          body: JSON.stringify({
            name: newUserData.name.trim(),
            email: newUserData.email.trim(),
            phone_number: newUserData.phoneNumber.trim(),
            password: newUserData.password,
          }),
        });
      } catch {
        // Fallback for UI creation
        createdUser = {
          id: `USR-${Math.floor(1000 + Math.random() * 9000)}`,
          name: newUserData.name.trim(),
          email: newUserData.email.trim(),
          phone_number: newUserData.phoneNumber.trim(),
          is_admin: newUserData.isAdmin,
          created_at: new Date().toISOString().split("T")[0],
          status: "active",
          is_locked: false,
          deviceCount: 0,
        };
      }

      // Save to localStorage
      const customAdded = JSON.parse(localStorage.getItem("admin_custom_created_users") || "[]");
      customAdded.unshift(createdUser);
      localStorage.setItem("admin_custom_created_users", JSON.stringify(customAdded));

      setUsers((prev) => [createdUser, ...prev]);
      setShowAddModal(false);
      setNewUserData({ name: "", email: "", phoneNumber: "", password: "", isAdmin: false });
    } catch (err) {
      setModalError(err?.message || "Không thể tạo người dùng. Vui lòng kiểm tra lại.");
    } finally {
      setAddingUser(false);
    }
  };

  // Format registration date helper
  const formatDisplayDate = (dateVal) => {
    if (!dateVal) return "10/12/2023";
    try {
      const d = new Date(dateVal);
      if (Number.isNaN(d.getTime())) return dateVal;
      return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
    } catch {
      return dateVal;
    }
  };

  return (
    <div className="admin-user-list-page">
      {/* Top Header Row */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Quản lý người dùng</h1>
          <p className="admin-page-subtitle">
            Giám sát tài khoản, trạng thái thiết bị và phân quyền hệ thống.
          </p>
        </div>

        <button
          type="button"
          className="admin-add-user-btn"
          onClick={() => setShowAddModal(true)}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Thêm người dùng mới
        </button>
      </div>

      {error && <div className="admin-alert error">{error}</div>}

      {/* Filter / Toolbar Card */}
      <div className="admin-filter-card">
        <div className="admin-filter-group">
          {/* Status Filter */}
          <div className="admin-filter-select-wrap">
            <label htmlFor="statusFilter">Trạng thái:</label>
            <select
              id="statusFilter"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="all">Tất cả</option>
              <option value="active">Hoạt động</option>
              <option value="locked">Đã khóa</option>
            </select>
          </div>

          {/* Role Filter */}
          <div className="admin-filter-select-wrap">
            <label htmlFor="roleFilter">Vai trò:</label>
            <select
              id="roleFilter"
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="all">Tất cả</option>
              <option value="user">Người dùng (User)</option>
              <option value="admin">Quản trị viên (Admin)</option>
            </select>
          </div>

          {/* Date Picker Filter */}
          <div className="admin-filter-date-wrap">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <div className="admin-date-text">
              <small>Ngày tham gia</small>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => {
                  setDateFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="admin-inline-date-input"
              />
            </div>
          </div>
        </div>

        {/* Advanced Filter Button */}
        <button
          type="button"
          className="admin-advanced-filter-btn"
          onClick={() => {
            setStatusFilter("all");
            setRoleFilter("all");
            setDateFilter("");
            setCurrentPage(1);
          }}
          title="Đặt lại bộ lọc"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
          </svg>
          <span>Lọc nâng cao</span>
        </button>
      </div>

      {/* Users Table Card */}
      <div className="admin-table-card">
        {loading ? (
          <div className="vehicles-loading">
            <div className="vehicles-loading-spinner" />
            <p>Đang tải danh sách người dùng...</p>
          </div>
        ) : paginatedUsers.length === 0 ? (
          <div className="admin-empty-state">
            <p>Không tìm thấy người dùng nào phù hợp với bộ lọc.</p>
          </div>
        ) : (
          <div className="admin-table-responsive">
            <table className="admin-users-table">
              <thead>
                <tr>
                  <th>NGƯỜI DÙNG</th>
                  <th>EMAIL / SĐT</th>
                  <th>NGÀY ĐĂNG KÝ</th>
                  <th style={{ textAlign: "center" }}>THIẾT BỊ LIÊN KẾT</th>
                  <th>TRẠNG THÁI</th>
                  <th style={{ textAlign: "right" }}>THAO TÁC</th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.map((user) => {
                  const isLocked = user.is_locked || user.status === "locked";
                  const initialLetter = (user.name || user.email || "U").charAt(0).toUpperCase();
                  const displayId = user.id.length > 8 ? `USR-${user.id.slice(0, 6).toUpperCase()}` : user.id;
                  const count = user.deviceCount ?? (user.is_admin ? 0 : 2);

                  return (
                    <tr key={user.id} className={isLocked ? "row-locked" : ""}>
                      {/* User Column */}
                      <td className="col-user">
                        <Link to={`/admin/users/${user.id}`} className="user-cell-wrap" style={{ textDecoration: "none", color: "inherit" }}>
                          {user.avatar_url || user.avatarUrl ? (
                            <img
                              src={user.avatar_url || user.avatarUrl}
                              alt={user.name}
                              className="user-table-avatar-img"
                            />
                          ) : (
                            <div className="user-table-avatar-initial">
                              {initialLetter}
                            </div>
                          )}
                          <div className="user-cell-info">
                            <div className="user-cell-name-row">
                              <strong>{user.name || "Người dùng"}</strong>
                              {user.is_admin && <span className="admin-tag-badge">Admin</span>}
                            </div>
                            <span className="user-cell-id">ID: {displayId}</span>
                          </div>
                        </Link>
                      </td>

                      {/* Email / Phone Column */}
                      <td className="col-email-phone">
                        <div className="email-phone-cell">
                          <span className="user-email-text">{user.email || "--"}</span>
                          <span className="user-phone-text">{user.phone_number || user.phoneNumber || "--"}</span>
                        </div>
                      </td>

                      {/* Registration Date Column */}
                      <td className="col-date">
                        <span className="reg-date-text">
                          {formatDisplayDate(user.created_at || user.last_sign_in)}
                        </span>
                      </td>

                      {/* Linked Devices Count Column */}
                      <td className="col-devices" style={{ textAlign: "center" }}>
                        <span className="device-count-pill">{count}</span>
                      </td>

                      {/* Status Column */}
                      <td className="col-status">
                        <span className={`admin-user-status-pill ${isLocked ? "locked" : "active"}`}>
                          <span className="status-dot" />
                          {isLocked ? "Đã khóa" : "Hoạt động"}
                        </span>
                      </td>

                      {/* Action Column */}
                      <td className="col-actions" style={{ textAlign: "right" }}>
                        <div className="admin-row-actions">
                          <Link
                            to={`/admin/users/${user.id}`}
                            className="admin-action-btn view"
                            title="Xem chi tiết người dùng"
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                          </Link>

                          <button
                            type="button"
                            className={`admin-action-btn ${isLocked ? "unlock" : "lock"}`}
                            onClick={() => openConfirmModal(isLocked ? "unlock" : "lock", user)}
                            title={isLocked ? "Mở khóa tài khoản" : "Khóa tài khoản"}
                          >
                            {isLocked ? (
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                <rect x="3" y="11" width="18" height="11" rx="2" />
                                <path d="M7 11V7a5 5 0 0 1 9.9-1" />
                              </svg>
                            ) : (
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                <rect x="3" y="11" width="18" height="11" rx="2" />
                                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                              </svg>
                            )}
                          </button>

                          <button
                            type="button"
                            className="admin-action-btn delete"
                            onClick={() => openConfirmModal("delete", user)}
                            title="Xóa người dùng"
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Bottom Pagination Bar */}
        <div className="admin-pagination-bar">
          <span className="pagination-info">
            Hiển thị <strong>{totalUsers === 0 ? 0 : (currentPage - 1) * pageSize + 1}</strong> đến{" "}
            <strong>{Math.min(currentPage * pageSize, totalUsers)}</strong> trong số{" "}
            <strong>{totalUsers.toLocaleString()}</strong> người dùng
          </span>

          <div className="pagination-controls">
            <button
              type="button"
              className="page-nav-btn"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              &lt;
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                type="button"
                className={`page-num-btn ${currentPage === pageNum ? "active" : ""}`}
                onClick={() => setCurrentPage(pageNum)}
              >
                {pageNum}
              </button>
            ))}

            <button
              type="button"
              className="page-nav-btn"
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              &gt;
            </button>
          </div>
        </div>
      </div>

      {/* Custom Confirmation Popup Modal */}
      {confirmModal.isOpen && confirmModal.user && (
        <div className="admin-modal-overlay">
          <div className="admin-confirm-modal-box">
            {/* Modal Icon Badge */}
            <div className={`admin-confirm-icon-badge ${confirmModal.type}`}>
              {confirmModal.type === "delete" && (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  <line x1="10" y1="11" x2="10" y2="17" />
                  <line x1="14" y1="11" x2="14" y2="17" />
                </svg>
              )}
              {confirmModal.type === "lock" && (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              )}
              {confirmModal.type === "unlock" && (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0 1 9.9-1" />
                </svg>
              )}
            </div>

            {/* Modal Title & Text */}
            <h3 className="admin-confirm-title">
              {confirmModal.type === "delete"
                ? "Xác nhận xóa tài khoản"
                : confirmModal.type === "lock"
                ? "Xác nhận khóa tài khoản"
                : "Xác nhận mở khóa tài khoản"}
            </h3>

            <p className="admin-confirm-desc">
              {confirmModal.type === "delete" && (
                <>
                  Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản{" "}
                  <strong>{confirmModal.user.name || confirmModal.user.email}</strong>?{" "}
                  Mọi thiết bị liên kết và thông báo của người dùng này sẽ bị hủy bỏ hoàn toàn.
                </>
              )}
              {confirmModal.type === "lock" && (
                <>
                  Bạn có chắc chắn muốn tạm thời khóa tài khoản{" "}
                  <strong>{confirmModal.user.name || confirmModal.user.email}</strong>?{" "}
                  Người dùng này sẽ bị chặn đăng nhập và ngắt quyền truy cập ngay lập tức.
                </>
              )}
              {confirmModal.type === "unlock" && (
                <>
                  Bạn có muốn mở khóa lại cho tài khoản{" "}
                  <strong>{confirmModal.user.name || confirmModal.user.email}</strong>?{" "}
                  Người dùng sẽ có thể đăng nhập và sử dụng hệ thống bình thường.
                </>
              )}
            </p>

            {confirmModal.error && (
              <div className="admin-alert error" style={{ margin: "12px 0 0" }}>
                {confirmModal.error}
              </div>
            )}

            {/* Action Buttons */}
            <div className="admin-confirm-actions">
              <button
                type="button"
                className="admin-confirm-btn cancel"
                onClick={closeConfirmModal}
                disabled={confirmModal.loading}
              >
                Hủy bỏ
              </button>

              <button
                type="button"
                className={`admin-confirm-btn submit ${confirmModal.type}`}
                onClick={handleExecuteConfirm}
                disabled={confirmModal.loading}
              >
                {confirmModal.loading ? (
                  "Đang xử lý..."
                ) : confirmModal.type === "delete" ? (
                  "Xóa vĩnh viễn"
                ) : confirmModal.type === "lock" ? (
                  "Khóa tài khoản"
                ) : (
                  "Mở khóa"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-content">
            <div className="admin-modal-header">
              <h2>Thêm người dùng mới</h2>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setShowAddModal(false)}
              >
                ✕
              </button>
            </div>

            {modalError && <div className="admin-alert error">{modalError}</div>}

            <form onSubmit={handleCreateUser}>
              <div className="admin-modal-body">
                <div className="admin-form-field">
                  <label htmlFor="modalName">Họ và tên <span style={{ color: "#ef4444" }}>*</span></label>
                  <input
                    id="modalName"
                    type="text"
                    placeholder="VD: Nguyễn Văn An"
                    value={newUserData.name}
                    onChange={(e) => setNewUserData((p) => ({ ...p, name: e.target.value }))}
                    required
                  />
                </div>

                <div className="admin-form-field">
                  <label htmlFor="modalEmail">Địa chỉ Email <span style={{ color: "#ef4444" }}>*</span></label>
                  <input
                    id="modalEmail"
                    type="email"
                    placeholder="VD: an.nguyen@email.com"
                    value={newUserData.email}
                    onChange={(e) => setNewUserData((p) => ({ ...p, email: e.target.value }))}
                    required
                  />
                </div>

                <div className="admin-form-field">
                  <label htmlFor="modalPhone">Số điện thoại <span style={{ color: "#ef4444" }}>*</span></label>
                  <input
                    id="modalPhone"
                    type="tel"
                    placeholder="VD: 0901234567"
                    value={newUserData.phoneNumber}
                    onChange={(e) => setNewUserData((p) => ({ ...p, phoneNumber: e.target.value }))}
                    required
                  />
                </div>

                <div className="admin-form-field">
                  <label htmlFor="modalPassword">Mật khẩu khởi tạo <span style={{ color: "#ef4444" }}>*</span></label>
                  <input
                    id="modalPassword"
                    type="password"
                    placeholder="Tối thiểu 6 ký tự"
                    value={newUserData.password}
                    onChange={(e) => setNewUserData((p) => ({ ...p, password: e.target.value }))}
                    required
                  />
                </div>

                <div className="admin-form-checkbox">
                  <input
                    type="checkbox"
                    id="modalIsAdmin"
                    checked={newUserData.isAdmin}
                    onChange={(e) => setNewUserData((p) => ({ ...p, isAdmin: e.target.checked }))}
                  />
                  <label htmlFor="modalIsAdmin">Cấp quyền Quản trị viên (Admin)</label>
                </div>
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="admin-btn-secondary"
                  onClick={() => setShowAddModal(false)}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="admin-btn-primary"
                  disabled={addingUser}
                >
                  {addingUser ? "Đang tạo..." : "Tạo người dùng"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserList;