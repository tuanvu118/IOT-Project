import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

import useAuth from "../../hooks/useAuth";
import { getMyDevices } from "../../services/deviceService";
import MobileVehicleCard from "./MobileVehicleCard";

function MobileVehicles() {
  const { user } = useAuth();
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadDevices() {
      if (!user) return;

      setLoading(true);
      setError("");

      try {
        const result = await getMyDevices();
        if (isMounted) {
          const apiDevices = Array.isArray(result) ? result : [];
          const userKey = `user_vehicles_${user?.id || user?.uid || "default"}`;
          const localUserVehicles = JSON.parse(localStorage.getItem(userKey) || "[]");

          const normalize = (str) => (str || "").toString().trim().toLowerCase().replace(/[\s.-]/g, "");
          const apiPlates = new Set(
            apiDevices
              .map((d) => normalize(d.vehicle?.license_plate || d.vehicle?.licensePlate))
              .filter(Boolean)
          );
          const apiIds = new Set(apiDevices.map((d) => d.id).filter(Boolean));

          const cleanLocalVehicles = localUserVehicles.filter((v) => {
            const plate = normalize(
              v.vehicle?.license_plate || v.vehicle?.licensePlate || v.licensePlate || v.license_plate
            );
            return (!plate || !apiPlates.has(plate)) && !apiIds.has(v.id);
          });

          setDevices([...apiDevices, ...cleanLocalVehicles]);
        }
      } catch (err) {
        if (isMounted) {
          setError("Không thể tải danh sách phương tiện.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadDevices();

    return () => {
      isMounted = false;
    };
  }, [user]);

  // Only items that represent an actual vehicle (linked or unlinked vehicle)
  const displayDevices = devices.filter((d) => {
    const v = d.vehicle || {};
    const hasVehInfo = Boolean(
      v.brand || v.model || v.license_plate || v.licensePlate || d.brand || d.license_plate || d.licensePlate
    );
    const isCustomVehicle = String(d.id || "").startsWith("veh-");
    return hasVehInfo || isCustomVehicle;
  });


  return (
    <div className="vehicles-page">
      <div className="vehicles-heading-row">
        <div>
          <h1>Phương tiện của tôi</h1>
          <p>Quản lý các phương tiện được liên kết với tài khoản.</p>
        </div>

        {displayDevices.length > 0 && (
          <Link className="vehicles-add-btn" to="/vehicles/add">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
            Thêm phương tiện
          </Link>
        )}
      </div>

      {error && <p className="vehicles-load-error">{error}</p>}

      {loading ? (
        <div className="vehicles-loading">
          <div className="vehicles-loading-spinner" />
          <p>Đang tải phương tiện...</p>
        </div>
      ) : displayDevices.length > 0 ? (
        <div className="vehicles-grid">
          {displayDevices.map((device) => (
            <MobileVehicleCard
              key={device.id}
              device={device}
              onUpdate={(id, lockState) => {
                setDevices((prev) =>
                  prev.map((d) =>
                    d.id === id
                      ? {
                          ...d,
                          config: {
                            ...d.config,
                            anti_thief: lockState,
                            antiThief: lockState,
                          },
                        }
                      : d
                  )
                );
              }}
              onDelete={(idOrPlate) => {
                const userKey = `user_vehicles_${user?.id || user?.uid || "default"}`;
                try {
                  const stored = JSON.parse(localStorage.getItem(userKey) || "[]");
                  const updated = stored.filter((v) => {
                    const plate = v.vehicle?.license_plate || v.vehicle?.licensePlate;
                    return v.id !== idOrPlate && plate !== idOrPlate;
                  });
                  localStorage.setItem(userKey, JSON.stringify(updated));
                } catch {}

                setDevices((prev) =>
                  prev.filter((d) => {
                    const plate = d.vehicle?.license_plate || d.vehicle?.licensePlate;
                    return d.id !== idOrPlate && plate !== idOrPlate;
                  })
                );
              }}
            />
          ))}
        </div>
      ) : (
        <div className="vehicles-empty">
          <div className="vehicles-empty-icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M5 16h2l2.5-4h5L17 16h2" />
              <circle cx="6" cy="17" r="2.2" />
              <circle cx="18" cy="17" r="2.2" />
              <path d="M10 12 9 9h3M15 12l2-3h2" />
            </svg>
          </div>
          <h3>Chưa có phương tiện nào</h3>
          <p>
            Bạn chưa liên kết phương tiện nào với tài khoản. Hãy thêm phương
            tiện để bắt đầu giám sát.
          </p>
          <Link className="vehicles-add-btn" to="/vehicles/add">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
            Thêm phương tiện
          </Link>
        </div>
      )}
    </div>
  );
}

export default MobileVehicles;