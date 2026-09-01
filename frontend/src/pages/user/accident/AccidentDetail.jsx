import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getAlertDetail, markNotificationAsRead } from "../../../services/alertService";
import { apiRequest } from "../../../services/api";

function DetailIcon({ type }) {
  if (type === "pin") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 21s7-4.5 7-11a7 7 0 0 0-14 0c0 6.5 7 11 7 11z" />
        <circle cx="12" cy="10" r="2.4" />
      </svg>
    );
  }

  if (type === "warning") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 4 21 20H3z" />
        <path d="M12 9v5M12 17h.01" />
      </svg>
    );
  }

  if (type === "device") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 15h16v5H4z" />
        <path d="M8 15v-4a4 4 0 0 1 8 0v4" />
        <path d="M7 18h.01M17 18h.01M12 7V4" />
      </svg>
    );
  }

  if (type === "clock") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </svg>
    );
  }

  if (type === "ai") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 3v3m0 12v3M3 12h3m12 0h3" />
        <circle cx="12" cy="12" r="6" />
      </svg>
    );
  }

  if (type === "mail") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 6h16v12H4z" />
        <path d="m4 7 8 6 8-6" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 16h2l2.5-4h5L17 16h2" />
      <circle cx="6" cy="17" r="2.2" />
      <circle cx="18" cy="17" r="2.2" />
      <path d="M10 12 9 9h3M15 12l2-3h2" />
    </svg>
  );
}

function formatDateTime(value) {
  if (!value) return "--";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function AccidentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [alert, setAlert] = useState(null);
  const [device, setDevice] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadDetail() {
      setIsLoading(true);
      setError("");

      try {
        const detail = await getAlertDetail(id);
        let detailDevice = null;

        if (detail?.device_id) {
          try {
            detailDevice = await apiRequest(`/devices/${detail.device_id}`);
          } catch {
            detailDevice = null;
          }
        }

        if (isMounted) {
          setAlert(detail);
          setDevice(detailDevice);
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

    loadDetail();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const vehicle = device?.vehicle || {};
  const latestLocation = Array.isArray(device?.locations) && device.locations.length > 0 ? device.locations[0] : null;
  const vehicleName = [vehicle.brand, vehicle.model].filter(Boolean).join(" ") || "Chưa có phương tiện";
  const deviceName = device?.name || alert?.device_id || "--";
  const statusText = alert?.is_read ? "ĐÃ XEM" : "CHƯA XÁC NHẬN";

  const handleConfirm = async () => {
    const nextAlert = await markNotificationAsRead(id);
    setAlert(nextAlert);
  };

  return (
    <div className="alert-detail-page">
      <div className="alert-detail-breadcrumb">
        <button type="button" onClick={() => navigate(-1)}>
          Lịch sử cảnh báo
        </button>
        <span>›</span>
        <strong>Chi tiết cảnh báo</strong>
      </div>

      <div className="alert-detail-heading" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1>Chi tiết cảnh báo</h1>
          <p>Thông tin chi tiết về sự kiện cảnh báo của phương tiện.</p>
        </div>
        <Link to="/alerts" className="app-back-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Quay lại danh sách
        </Link>
      </div>

      {isLoading ? (
        <p className="dashboard-load-error">Đang tải chi tiết cảnh báo...</p>
      ) : error ? (
        <p className="dashboard-load-error">{error}</p>
      ) : (
        <>
          <section className="alert-detail-banner">
            <DetailIcon type="warning" />
            <div>
              <strong>{alert?.title || "Cảnh báo"}</strong>
              <p>{alert?.content || "Chưa có nội dung cảnh báo."}</p>
            </div>
            <span>{statusText}</span>
          </section>

          <section className="alert-detail-stats">
            <article>
              <DetailIcon />
              <small>Phương tiện</small>
              <strong>{vehicleName}</strong>
            </article>
            <article>
              <DetailIcon type="device" />
              <small>Thiết bị</small>
              <strong>{deviceName}</strong>
            </article>
            <article>
              <DetailIcon type="clock" />
              <small>Thời gian</small>
              <strong>{formatDateTime(alert?.created_at || alert?.createdAt)}</strong>
            </article>
            <article>
              <DetailIcon type="ai" />
              <small>Xác suất AI</small>
              <strong className="danger-text">--</strong>
            </article>
          </section>

          <div className="alert-detail-grid">
            <section className="alert-detail-map-card">
              <div className="alert-detail-card-title">
                <h2>Vị trí phát hiện</h2>
                <button type="button" aria-label="Mở rộng bản đồ">⛶</button>
              </div>

              <div className="alert-detail-map">
                <div className="map-road road-main" />
                <div className="map-road road-second" />
                <div className="map-area area-a">Dịch Vọng Hậu</div>
                <div className="map-area area-b">Cầu Giấy</div>
                <span className="alert-map-pin">
                  <DetailIcon type="pin" />
                </span>
              </div>

              <div className="alert-detail-address">
                <span>
                  <DetailIcon type="pin" />
                </span>
                <div>
                  <small>Vị trí phát hiện</small>
                  <strong>
                    {latestLocation?.address ||
                      (latestLocation?.latitude && latestLocation?.longitude
                        ? `${latestLocation.latitude}, ${latestLocation.longitude}`
                        : "Chưa có dữ liệu vị trí")}
                  </strong>
                </div>
              </div>
            </section>

            <aside className="alert-detail-side">
              <section className="sensor-card">
                <h2>Dữ liệu cảm biến</h2>
                <div className="sensor-grid">
                  <div>
                    <small>Gia tốc X</small>
                    <strong>--</strong>
                  </div>
                  <div>
                    <small>Gia tốc Y</small>
                    <strong>--</strong>
                  </div>
                  <div>
                    <small>Gia tốc Z</small>
                    <strong>--</strong>
                  </div>
                  <div className="danger">
                    <small>Góc nghiêng</small>
                    <strong>--</strong>
                  </div>
                </div>
                <div className="sensor-message">
                  <DetailIcon type="mail" />
                  <p>Đã gửi SMS khẩn cấp đến danh sách SOS của người dùng.</p>
                </div>
              </section>

              <section className="confirm-card">
                <h2>Xác nhận sự kiện</h2>
                <p>Đây có phải là tai nạn thật không?</p>
                <button type="button" onClick={handleConfirm} disabled={alert?.is_read}>
                  Xác nhận tai nạn
                </button>
                <button className="secondary" type="button" onClick={handleConfirm} disabled={alert?.is_read}>
                  Không phải tai nạn
                </button>
              </section>
            </aside>
          </div>
        </>
      )}
    </div>
  );
}

export default AccidentDetail;
