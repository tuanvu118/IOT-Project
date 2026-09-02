import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAlerts } from "../../services/alertService";
import "../../styles/pwa-mobile.css";

function getAlertType(notification) {
  const value = `${notification.type || ""} ${notification.title || ""}`.toLowerCase();

  if (value.includes("accident") || value.includes("tai nạn") || value.includes("va chạm")) {
    return "Tai nạn";
  }

  if (value.includes("thief") || value.includes("trộm") || value.includes("chống trộm")) {
    return "Chống trộm";
  }

  if (value.includes("battery") || value.includes("pin")) {
    return "Thiết bị";
  }

  return "Khác";
}

function formatDateTime(value) {
  if (!value) return "--";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function typeClass(type) {
  if (type === "Tai nạn") return "danger";
  if (type === "Chống trộm") return "warning";
  return "muted";
}

function AlertTypeIcon({ type }) {
  if (type === "Tai nạn") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 4 21 20H3z" />
        <path d="M12 9v5M12 17h.01" />
      </svg>
    );
  }

  if (type === "Chống trộm") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 3 20 6v6c0 5-3.2 8.1-8 10-4.8-1.9-8-5-8-10V6z" />
        <path d="M9 12h6M15 9l-6 6" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M9 5h6v3H9zM8 8h8v12H8z" />
      <path d="M11 11h2M11 14h2" />
    </svg>
  );
}

function MobileAlerts() {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadAlerts() {
      setIsLoading(true);
      setError("");

      try {
        const data = await getAlerts({ limit: 100 });
        if (isMounted) {
          setAlerts(data || []);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadAlerts();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert) => {
      const type = getAlertType(alert);
      const createdAt = alert.created_at || alert.createdAt;
      const alertDate = createdAt ? new Date(createdAt) : null;

      if (typeFilter !== "all" && type !== typeFilter) return false;
      if (statusFilter === "unread" && alert.is_read) return false;
      if (statusFilter === "read" && !alert.is_read) return false;

      if (fromDate && alertDate && alertDate < new Date(fromDate)) return false;
      if (toDate && alertDate) {
        const endDate = new Date(toDate);
        endDate.setHours(23, 59, 59, 999);
        if (alertDate > endDate) return false;
      }

      return true;
    });
  }, [alerts, fromDate, statusFilter, toDate, typeFilter]);

  const [isFilterOpen, setFilterOpen] = useState(false);

  return (
    <div className="alerts-page pwa-alerts-page">
      <div className="alerts-heading-wrap">
        <button className="alerts-back-button" type="button" onClick={() => navigate(-1)}>
          <span aria-hidden="true">←</span>
          Quay lại
        </button>

        <div className="alerts-heading">
          <div>
            <h1>Lịch sử cảnh báo</h1>
            <p>Theo dõi các sự kiện và cảnh báo của phương tiện.</p>
          </div>

          <button
            type="button"
            className="pwa-filter-trigger-btn"
            onClick={() => setFilterOpen(true)}
            aria-label="Mở bộ lọc cảnh báo"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="7" y1="12" x2="17" y2="12" />
              <line x1="10" y1="18" x2="14" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Vehicle Summary Pill */}
      <div className="pwa-alerts-summary-pill">
        <div className="pwa-summary-pill-left">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#64748b" strokeWidth="2" aria-hidden="true">
            <circle cx="6" cy="17" r="2.2" />
            <circle cx="18" cy="17" r="2.2" />
            <path d="M5 16h2l2.5-4h5L17 16h2M10 12 9 9h3M15 12l2-3h2" />
          </svg>
          <span>Tất cả phương tiện</span>
        </div>
        <strong>{filteredAlerts.length} cảnh báo</strong>
      </div>

      {/* Mobile Card List Matching Figma */}
      <div className="pwa-alerts-mobile-list">
        {isLoading ? (
          <p className="pwa-alerts-empty">Đang tải danh sách cảnh báo...</p>
        ) : error ? (
          <p className="pwa-alerts-empty text-danger">{error}</p>
        ) : filteredAlerts.length > 0 ? (
          filteredAlerts.map((alert) => {
            const type = getAlertType(alert);
            const tone = typeClass(type);

            return (
              <article
                className={`pwa-alert-card ${tone}`}
                key={alert.id}
                onClick={() => navigate(`/alerts/${alert.id}`)}
              >
                <div className="pwa-alert-card-top">
                  <div className="pwa-alert-card-title-wrap">
                    <span className={`pwa-alert-circle-icon ${tone}`}>
                      <AlertTypeIcon type={type} />
                    </span>
                    <div>
                      <h3 className="pwa-alert-title">{alert.title || "Phát hiện tai nạn"}</h3>
                      <div className="pwa-alert-vehicle-sub">
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#64748b" strokeWidth="2" aria-hidden="true">
                          <circle cx="6" cy="17" r="2.2" />
                          <circle cx="18" cy="17" r="2.2" />
                          <path d="M5 16h2l2.5-4h5L17 16h2M10 12 9 9h3M15 12l2-3h2" />
                        </svg>
                        <span>{alert.vehicle_name || alert.vehicleName || "Phương tiện"}</span>
                      </div>
                    </div>
                  </div>
                  <span className={`pwa-alert-status-pill ${alert.is_read ? "seen" : "pending"}`}>
                    {alert.is_read ? "Đã xác nhận" : "Chưa xác nhận"}
                  </span>
                </div>

                <p className="pwa-alert-desc">
                  {alert.content || alert.description || ""}
                </p>

                <div className="pwa-alert-card-footer">
                  <span className="pwa-alert-time">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#64748b" strokeWidth="2" aria-hidden="true">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    {formatDateTime(alert.created_at || alert.createdAt)}
                  </span>
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#94a3b8" strokeWidth="2.2" aria-hidden="true">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </div>
              </article>
            );
          })
        ) : (
          <p className="pwa-alerts-empty">Không có cảnh báo phù hợp.</p>
        )}
      </div>

      {/* Desktop Card / Table View */}
      <section className="alerts-card desktop-alerts-card">
        <div className="alerts-filters">
          <label>
            Loại cảnh báo
            <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
              <option value="all">Tất cả</option>
              <option value="Tai nạn">Tai nạn</option>
              <option value="Chống trộm">Chống trộm</option>
              <option value="Thiết bị">Thiết bị</option>
            </select>
          </label>

          <label>
            Trạng thái
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              <option value="all">Tất cả trạng thái</option>
              <option value="unread">Chưa xác nhận</option>
              <option value="read">Đã xem</option>
            </select>
          </label>

          <label>
            Từ ngày
            <input type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} />
          </label>

          <label>
            Đến ngày
            <input type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} />
          </label>

          <button type="button">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 6h16M7 12h10M10 18h4" />
            </svg>
            Lọc
          </button>
        </div>

        <div className="alerts-table-wrap">
          <table className="alerts-table">
            <thead>
              <tr>
                <th>Loại</th>
                <th>Phương tiện</th>
                <th>Nội dung</th>
                <th>Thời gian</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="6">Đang tải cảnh báo...</td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="6">{error}</td>
                </tr>
              ) : filteredAlerts.length > 0 ? (
                filteredAlerts.slice(0, 10).map((alert) => {
                  const type = getAlertType(alert);

                  return (
                    <tr key={alert.id}>
                      <td>
                        <span className={`alert-type ${typeClass(type)}`}>
                          <AlertTypeIcon type={type} />
                          {type}
                        </span>
                      </td>
                      <td>{alert.vehicle_name || alert.vehicleName || alert.device_id || "--"}</td>
                      <td>{alert.content || alert.title || "--"}</td>
                      <td>{formatDateTime(alert.created_at || alert.createdAt)}</td>
                      <td>
                        <span className={`alert-status ${alert.is_read ? "seen" : "pending"}`}>
                          {alert.is_read ? "Đã xem" : "Chưa xác nhận"}
                        </span>
                      </td>
                      <td>
                        <Link className="alert-view-link" to={`/alerts/${alert.id}`} aria-label="Xem chi tiết">
                          <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        </Link>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6">Không có cảnh báo phù hợp.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="alerts-pagination">
          <span>
            Hiển thị 1-{Math.min(filteredAlerts.length, 10)} của {filteredAlerts.length} kết quả
          </span>
          <div>
            <button type="button">‹</button>
            <button className="active" type="button">
              1
            </button>
            <button type="button">2</button>
            <button type="button">3</button>
            <button type="button">...</button>
            <button type="button">›</button>
          </div>
        </div>
      </section>

      {/* Mobile Bottom Sheet Filter Modal */}
      {isFilterOpen && (
        <div className="pwa-filter-sheet-overlay" onClick={() => setFilterOpen(false)}>
          <div className="pwa-filter-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="pwa-sheet-handle" />
            <div className="pwa-sheet-header">
              <h2>Bộ lọc cảnh báo</h2>
            </div>

            <div className="pwa-filter-group">
              <span className="pwa-filter-label">Trạng thái</span>
              <div className="pwa-filter-pills">
                <button
                  type="button"
                  className={`pwa-filter-pill ${statusFilter === "all" ? "active" : ""}`}
                  onClick={() => setStatusFilter("all")}
                >
                  Tất cả
                </button>
                <button
                  type="button"
                  className={`pwa-filter-pill ${statusFilter === "unread" ? "active" : ""}`}
                  onClick={() => setStatusFilter("unread")}
                >
                  Chưa xác nhận
                </button>
                <button
                  type="button"
                  className={`pwa-filter-pill ${statusFilter === "read" ? "active" : ""}`}
                  onClick={() => setStatusFilter("read")}
                >
                  Đã xác nhận
                </button>
              </div>
            </div>

            <div className="pwa-filter-group">
              <span className="pwa-filter-label">Mức độ</span>
              <div className="pwa-filter-pills">
                <button
                  type="button"
                  className={`pwa-filter-pill danger ${typeFilter === "Tai nạn" ? "active" : ""}`}
                  onClick={() => setTypeFilter(typeFilter === "Tai nạn" ? "all" : "Tai nạn")}
                >
                  Nghiêm trọng
                </button>
                <button
                  type="button"
                  className={`pwa-filter-pill warning ${typeFilter === "Chống trộm" ? "active" : ""}`}
                  onClick={() => setTypeFilter(typeFilter === "Chống trộm" ? "all" : "Chống trộm")}
                >
                  Cảnh báo
                </button>
                <button
                  type="button"
                  className={`pwa-filter-pill ${typeFilter === "Thiết bị" ? "active" : ""}`}
                  onClick={() => setTypeFilter(typeFilter === "Thiết bị" ? "all" : "Thiết bị")}
                >
                  Thông tin
                </button>
              </div>
            </div>

            <div className="pwa-sheet-actions">
              <button
                type="button"
                className="pwa-sheet-btn-reset"
                onClick={() => {
                  setStatusFilter("all");
                  setTypeFilter("all");
                }}
              >
                Thiết lập lại
              </button>
              <button
                type="button"
                className="pwa-sheet-btn-apply"
                onClick={() => setFilterOpen(false)}
              >
                Áp dụng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MobileAlerts;
