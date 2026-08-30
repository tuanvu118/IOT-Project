import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAlerts, markNotificationAsRead } from "../../services/alertService";
import { apiRequest } from "../../services/api";

function isCriticalAlert(notification) {
  const value = `${notification?.type || ""} ${notification?.title || ""}`.toLowerCase();
  return (
    value.includes("accident") ||
    value.includes("tai nạn") ||
    value.includes("va chạm") ||
    value.includes("theft") ||
    value.includes("trộm")
  );
}

function PopupIcon({ type }) {
  if (type === "pin") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 21s7-4.5 7-11a7 7 0 0 0-14 0c0 6.5 7 11 7 11z" />
        <circle cx="12" cy="10" r="2.4" />
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

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 4 21 20H3z" />
      <path d="M12 9v5M12 17h.01" />
    </svg>
  );
}

function getVehicleName(device) {
  const vehicle = device?.vehicle || {};
  return [vehicle.brand, vehicle.model].filter(Boolean).join(" ") || device?.name || "Chưa có phương tiện";
}

function getLicensePlate(device) {
  const vehicle = device?.vehicle || {};
  return vehicle.license_plate || vehicle.licensePlate || "Chưa có biển số";
}

function getLatestLocation(device) {
  return Array.isArray(device?.locations) && device.locations.length > 0 ? device.locations[0] : null;
}

function AlertPopup() {
  const navigate = useNavigate();
  const [alert, setAlert] = useState(null);
  const [device, setDevice] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function loadNewAlert() {
      try {
        const notifications = await getAlerts({ unreadOnly: true, limit: 5 });
        const nextAlert = (notifications || []).find((item) => {
          const dismissedId = sessionStorage.getItem(`dismissed-alert-${item.id}`);
          return !dismissedId && isCriticalAlert(item);
        });

        if (!isMounted || !nextAlert) return;

        let nextDevice = null;
        if (nextAlert.device_id) {
          try {
            nextDevice = await apiRequest(`/devices/${nextAlert.device_id}`);
          } catch {
            nextDevice = null;
          }
        }

        if (isMounted) {
          setAlert(nextAlert);
          setDevice(nextDevice);
        }
      } catch {
        if (isMounted) {
          setAlert(null);
          setDevice(null);
        }
      }
    }

    loadNewAlert();
    const intervalId = window.setInterval(loadNewAlert, 10000);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, []);

  if (!alert) return null;

  const location = getLatestLocation(device);
  const vehicleName = getVehicleName(device);
  const plate = getLicensePlate(device);

  const closePopup = () => {
    sessionStorage.setItem(`dismissed-alert-${alert.id}`, "true");
    setAlert(null);
    setDevice(null);
  };

  const viewDetail = async () => {
    sessionStorage.setItem(`dismissed-alert-${alert.id}`, "true");
    navigate(`/alerts/${alert.id}`);
    setAlert(null);
    setDevice(null);
  };

  const confirmSent = async () => {
    await markNotificationAsRead(alert.id);
    closePopup();
  };

  return (
    <div className="critical-alert-overlay" role="dialog" aria-modal="true">
      <section className="critical-alert-modal">
        <header>
          <PopupIcon />
          <strong>{alert.title || "Phát hiện cảnh báo!"}</strong>
        </header>

        <div className="critical-alert-body">
          <div className="critical-vehicle-row">
            <div>
              <small>PHƯƠNG TIỆN</small>
              <strong>{vehicleName}</strong>
            </div>
            <span>{plate}</span>
          </div>

          <div className="critical-sensor-grid">
            <div>
              <small>Gia tốc lực va chạm</small>
              <strong>--</strong>
            </div>
            <div>
              <small>Góc nghiêng</small>
              <strong>--</strong>
            </div>
          </div>

          <div className="critical-location">
            <PopupIcon type="pin" />
            <div>
              <strong>
                {location?.address ||
                  (location?.latitude && location?.longitude
                    ? `${location.latitude}, ${location.longitude}`
                    : "Chưa có dữ liệu vị trí")}
              </strong>
              <p>{alert.content || "Hệ thống phát hiện sự kiện bất thường."}</p>
            </div>
          </div>

          <div className="critical-map-preview">
            <div className="map-road road-main" />
            <div className="map-road road-second" />
            <span>
              <PopupIcon type="pin" />
            </span>
          </div>

          <div className="critical-sent-box">
            <p>Hệ thống sẽ tự động gửi tin nhắn khẩn cấp đến người thân.</p>
            <strong>ĐÃ GỬI!</strong>
          </div>
        </div>

        <footer>
          <button className="critical-close" type="button" onClick={confirmSent}>
            Đóng
          </button>
          <button className="critical-detail" type="button" onClick={viewDetail}>
            Xem chi tiết
          </button>
        </footer>
      </section>
    </div>
  );
}

export default AlertPopup;
