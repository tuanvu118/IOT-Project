import { useState, useEffect } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import { getDeviceById, getMyDevices } from "../../../services/deviceService";

function SensorData() {
  const { id } = useParams();
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  const [device, setDevice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(true);
  const [resyncing, setResyncing] = useState(false);

  // Live telemetry state
  const [telemetry, setTelemetry] = useState({
    accelX: 0.02,
    accelY: -0.15,
    accelZ: 0.98,
    gyroX: 1.2,
    gyroY: 0.5,
    gyroZ: -0.1,
    leanAngle: 12,
    leanDirection: "Left Lean",
    batteryTemp: 34,
    voltage: 12.4,
    satellites: 12,
  });

  // Wave points for live SVG chart
  const [wavePoints, setWavePoints] = useState(() => {
    // Generate initial wave history (15 points)
    const ptsX = [];
    const ptsY = [];
    const ptsZ = [];
    for (let i = 0; i < 15; i++) {
      ptsX.push(30 + Math.sin(i * 0.5) * 15 + (Math.random() - 0.5) * 6);
      ptsY.push(65 + Math.cos(i * 0.4) * 20 + (Math.random() - 0.5) * 6);
      ptsZ.push(100 + Math.sin(i * 0.3 + 1) * 12 + (Math.random() - 0.5) * 4);
    }
    return { ptsX, ptsY, ptsZ };
  });

  // Raw packets log
  const [rawPackets, setRawPackets] = useState(() => [
    {
      timestamp: "14:02:45.320",
      accel: { x: 0.02, y: -0.15, z: 0.98 },
      gyro: { x: 1.2, y: 0.5, z: -0.1 },
      voltage: "12.4V",
    },
    {
      timestamp: "14:02:45.300",
      accel: { x: 0.03, y: -0.14, z: 0.98 },
      gyro: { x: 1.1, y: 0.6, z: -0.2 },
      voltage: "12.4V",
    },
    {
      timestamp: "14:02:45.280",
      accel: { x: 0.01, y: -0.16, z: 0.99 },
      gyro: { x: 1.5, y: 0.4, z: -0.1 },
      voltage: "12.4V",
    },
    {
      timestamp: "14:02:45.260",
      accel: { x: 0.02, y: -0.15, z: 0.98 },
      gyro: { x: 1.3, y: 0.5, z: -0.2 },
      voltage: "12.4V",
    },
  ]);

  // Load device info
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setLoading(true);
      try {
        let dev = null;
        try {
          dev = await getDeviceById(id);
        } catch {
          const myDevs = await getMyDevices();
          dev = (myDevs || []).find((d) => d.id === id || d.verification_code === id);
        }

        if (!dev) {
          const localLinked = JSON.parse(localStorage.getItem("custom_linked_devices") || "[]");
          dev = localLinked.find((d) => d.id === id || d.verification_code === id);
        }

        if (isMounted) {
          setDevice(dev);
        }
      } catch (err) {
        console.warn("SensorData device load error:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, [id]);

  // Live telemetry stream simulator
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(
        now.getMinutes()
      ).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}.${String(
        Math.floor(now.getMilliseconds())
      ).padStart(3, "0")}`;

      // Small natural jitter
      const nextAccelX = +(0.02 + (Math.random() - 0.5) * 0.04).toFixed(2);
      const nextAccelY = +(-0.15 + (Math.random() - 0.5) * 0.05).toFixed(2);
      const nextAccelZ = +(0.98 + (Math.random() - 0.5) * 0.03).toFixed(2);

      const nextGyroX = +(1.2 + (Math.random() - 0.5) * 0.4).toFixed(1);
      const nextGyroY = +(0.5 + (Math.random() - 0.5) * 0.3).toFixed(1);
      const nextGyroZ = +(-0.1 + (Math.random() - 0.5) * 0.2).toFixed(1);

      const nextLean = Math.max(8, Math.min(18, Math.round(12 + (Math.random() - 0.5) * 3)));

      setTelemetry((prev) => ({
        ...prev,
        accelX: nextAccelX,
        accelY: nextAccelY,
        accelZ: nextAccelZ,
        gyroX: nextGyroX,
        gyroY: nextGyroY,
        gyroZ: nextGyroZ,
        leanAngle: nextLean,
      }));

      // Update wave points (shift left and push new calculated Y coords)
      setWavePoints((prev) => {
        const newX = [...prev.ptsX.slice(1), 30 + Math.random() * 40];
        const newY = [...prev.ptsY.slice(1), 60 + Math.random() * 35];
        const newZ = [...prev.ptsZ.slice(1), 95 + Math.random() * 25];
        return { ptsX: newX, ptsY: newY, ptsZ: newZ };
      });

      // Push to raw packets log
      setRawPackets((prev) => [
        {
          timestamp: timeStr,
          accel: { x: nextAccelX, y: nextAccelY, z: nextAccelZ },
          gyro: { x: nextGyroX, y: nextGyroY, z: nextGyroZ },
          voltage: "12.4V",
        },
        ...prev.slice(0, 5),
      ]);
    }, 1200);

    return () => clearInterval(interval);
  }, [isLive]);

  // Handle Resync
  const handleResync = () => {
    setResyncing(true);
    setTimeout(() => {
      setResyncing(false);
    }, 800);
  };

  // Export CSV Report
  const handleDownloadReport = () => {
    const devCode = device?.verification_code || device?.name || id || "IOT-DEVICE";
    const headers = "Timestamp,Accel_X(g),Accel_Y(g),Accel_Z(g),Gyro_X(deg/s),Gyro_Y(deg/s),Gyro_Z(deg/s),Voltage(V)\n";
    const rows = rawPackets
      .map(
        (p) =>
          `${p.timestamp},${p.accel.x},${p.accel.y},${p.accel.z},${p.gyro.x},${p.gyro.y},${p.gyro.z},${p.voltage}`
      )
      .join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `sensor_telemetry_${devCode}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper to build smooth SVG path from points array
  const buildSmoothPath = (points, width = 320, height = 130) => {
    if (!points || points.length === 0) return "";
    const step = width / (points.length - 1);
    let d = `M 0 ${points[0]}`;
    for (let i = 1; i < points.length; i++) {
      const prevX = (i - 1) * step;
      const prevY = points[i - 1];
      const curX = i * step;
      const curY = points[i];
      const c1X = prevX + step * 0.5;
      const c1Y = prevY;
      const c2X = prevX + step * 0.5;
      const c2Y = curY;
      d += ` C ${c1X} ${c1Y}, ${c2X} ${c2Y}, ${curX} ${curY}`;
    }
    return d;
  };

  const devCode = device?.verification_code || device?.name || id || "IOT-001";
  const vehicle = device?.vehicle;
  const vehicleName = vehicle?.brand
    ? `${vehicle.brand} ${vehicle.model || ""}`.trim()
    : "Honda Vision 2024";

  // Calculate arc for 180-degree inclinometer gauge
  const radius = 64;
  const circumference = Math.PI * radius; // Half-circle
  const anglePercent = Math.min(1, Math.max(0, telemetry.leanAngle / 45)); // Scale up to 45 deg
  const strokeDashoffset = circumference - anglePercent * (circumference * 0.85);

  return (
    <div className="sensor-data-page">
      {/* Breadcrumb */}
      <nav className="sensor-breadcrumb" aria-label="Breadcrumb">
        <Link to={isAdminRoute ? "/admin/devices" : "/devices"}>Thiết bị IoT</Link>
        <span className="breadcrumb-separator">&gt;</span>
        <Link to={isAdminRoute ? `/admin/devices/${id}` : `/devices/${id}`}>{devCode}</Link>
        <span className="breadcrumb-separator">&gt;</span>
        <strong>Dữ liệu cảm biến</strong>
      </nav>

      {/* Header Top Row */}
      <div className="sensor-header-row">
        <div className="sensor-title-col">
          <div className="sensor-heading-wrap">
            <h1>Dữ liệu cảm biến</h1>
            <span className={`sensor-live-pill ${isLive ? "live" : "paused"}`}>
              <span className="live-pulse-dot" />
              {isLive ? "LIVE" : "PAUSED"}
            </span>
          </div>

          <div className="sensor-meta-tags">
            <span className="sensor-meta-tag">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <rect x="2" y="14" width="20" height="8" rx="2" />
                <path d="M6 18h.01M10 18h.01" />
                <path d="M12 2a4 4 0 0 1 4 4v8" />
              </svg>
              Thiết bị {devCode}
            </span>
            <span className="sensor-meta-separator">|</span>
            <span className="sensor-meta-tag">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <circle cx="18.5" cy="17.5" r="3.5" />
                <circle cx="5.5" cy="17.5" r="3.5" />
                <circle cx="15" cy="5" r="1" />
                <path d="M12 17.5V14l-3-3 4-3 2 3h2" />
              </svg>
              {vehicleName}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="sensor-actions-col">
          <Link
            to={isAdminRoute ? `/admin/devices/${id || devCode}` : `/devices/${id || devCode}`}
            className="app-back-btn"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Quay lại chi tiết
          </Link>

          <button
            type="button"
            className="sensor-action-btn secondary"
            onClick={handleDownloadReport}
            title="Tải báo cáo dữ liệu dạng CSV"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Tải báo cáo
          </button>

          <button
            type="button"
            className="sensor-action-btn primary"
            onClick={handleResync}
            disabled={resyncing}
            title="Đồng bộ lại kết nối cảm biến"
          >
            <svg
              className={resyncing ? "spin" : ""}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              aria-hidden="true"
            >
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l6.73-5.19" />
            </svg>
            {resyncing ? "Đang đồng bộ..." : "Đồng bộ lại"}
          </button>
        </div>
      </div>

      {/* Main Grid: 2 Columns */}
      <div className="sensor-dashboard-grid">
        {/* Left Column: Charts & Raw Packets */}
        <div className="sensor-left-column">
          {/* Top Row: Accel Graph & Gyro Arc Gauge */}
          <div className="sensor-top-charts-grid">
            {/* Card 1: Gia tốc (G-force) */}
            <div className="sensor-card accel-chart-card">
              <div className="sensor-card-header">
                <div>
                  <h3>Gia tốc (G-force)</h3>
                  <p className="sensor-card-sub">XYZ Axis Real-time</p>
                </div>
                <div className="sensor-card-icon-badge">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                  </svg>
                </div>
              </div>

              {/* Wave SVG Area */}
              <div className="sensor-wave-canvas-wrap">
                <svg viewBox="0 0 320 140" className="sensor-wave-svg" preserveAspectRatio="none">
                  {/* Subtle Grid Lines */}
                  <line x1="0" y1="35" x2="320" y2="35" stroke="#f1f5f9" strokeWidth="1" />
                  <line x1="0" y1="70" x2="320" y2="70" stroke="#f1f5f9" strokeWidth="1" />
                  <line x1="0" y1="105" x2="320" y2="105" stroke="#f1f5f9" strokeWidth="1" />

                  {/* Gradient definitions */}
                  <defs>
                    <linearGradient id="gradX" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#60a5fa" stopOpacity="1" />
                    </linearGradient>
                    <linearGradient id="gradY" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#22d3ee" stopOpacity="1" />
                    </linearGradient>
                    <linearGradient id="gradZ" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#f87171" stopOpacity="1" />
                    </linearGradient>
                  </defs>

                  {/* 3 Smooth Splines */}
                  <path
                    d={buildSmoothPath(wavePoints.ptsX)}
                    fill="none"
                    stroke="url(#gradX)"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                    className="wave-line-x"
                  />
                  <path
                    d={buildSmoothPath(wavePoints.ptsY)}
                    fill="none"
                    stroke="url(#gradY)"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                    className="wave-line-y"
                  />
                  <path
                    d={buildSmoothPath(wavePoints.ptsZ)}
                    fill="none"
                    stroke="url(#gradZ)"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                    className="wave-line-z"
                  />
                </svg>
              </div>

              {/* Legends */}
              <div className="sensor-chart-legend">
                <span className="legend-item x-axis">
                  <span className="legend-dot" style={{ background: "#3b82f6" }} />
                  X-Axis ({telemetry.accelX}g)
                </span>
                <span className="legend-item y-axis">
                  <span className="legend-dot" style={{ background: "#06b6d4" }} />
                  Y-Axis ({telemetry.accelY}g)
                </span>
                <span className="legend-item z-axis">
                  <span className="legend-dot" style={{ background: "#ef4444" }} />
                  Z-Axis ({telemetry.accelZ}g)
                </span>
              </div>
            </div>

            {/* Card 2: Góc nghiêng (Gyro) */}
            <div className="sensor-card gyro-gauge-card">
              <div className="sensor-card-header">
                <div>
                  <h3>Góc nghiêng (Gyro)</h3>
                  <p className="sensor-card-sub">Lean Angle</p>
                </div>
                <div className="sensor-card-icon-badge">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 3v3M12 18v3M3 12h3M18 12h3" />
                  </svg>
                </div>
              </div>

              {/* Half-circle Arc Gauge */}
              <div className="gyro-gauge-container">
                <svg className="gyro-gauge-svg" viewBox="0 0 160 110">
                  {/* Background Arc */}
                  <path
                    d="M 20 95 A 60 60 0 0 1 140 95"
                    fill="none"
                    stroke="#e2e8f0"
                    strokeWidth="14"
                    strokeLinecap="round"
                  />
                  {/* Active Indicator Arc */}
                  <path
                    d="M 20 95 A 60 60 0 0 1 140 95"
                    fill="none"
                    stroke="#0284c7"
                    strokeWidth="14"
                    strokeLinecap="round"
                    strokeDasharray="188"
                    strokeDashoffset={188 - (telemetry.leanAngle / 45) * 188}
                    style={{ transition: "stroke-dashoffset 0.6s ease" }}
                  />
                </svg>

                <div className="gyro-gauge-readout">
                  <span className="gyro-angle-value">{telemetry.leanAngle}°</span>
                  <span className="gyro-direction-label">{telemetry.leanDirection}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Gói dữ liệu thô gần nhất */}
          <div className="sensor-card raw-packets-card">
            <div className="raw-packets-header">
              <div className="raw-packets-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <line x1="3" y1="9" x2="21" y2="9" />
                  <line x1="9" y1="21" x2="9" y2="9" />
                </svg>
                <h3>Gói dữ liệu thô gần nhất</h3>
              </div>
              <button
                type="button"
                className="view-full-history-btn"
                onClick={() => setIsLive((p) => !p)}
              >
                {isLive ? "Tạm dừng luồng" : "Tiếp tục luồng"}
              </button>
            </div>

            <div className="raw-packets-table-wrap">
              <table className="raw-packets-table">
                <thead>
                  <tr>
                    <th>TIMESTAMP</th>
                    <th>ACCEL (X,Y,Z)</th>
                    <th>GYRO (X,Y,Z)</th>
                    <th>VOLTAGE</th>
                  </tr>
                </thead>
                <tbody>
                  {rawPackets.map((pkt, idx) => (
                    <tr key={`${pkt.timestamp}-${idx}`} className={idx === 0 ? "new-packet-row" : ""}>
                      <td className="pkt-timestamp">{pkt.timestamp}</td>
                      <td className="pkt-accel">
                        <span style={{ color: "#2563eb", fontWeight: "600" }}>{pkt.accel.x}</span>,{" "}
                        <span style={{ color: "#0891b2", fontWeight: "600" }}>{pkt.accel.y}</span>,{" "}
                        <span style={{ color: "#dc2626", fontWeight: "600" }}>{pkt.accel.z}</span>
                      </td>
                      <td className="pkt-gyro">
                        <span style={{ color: "#2563eb" }}>{pkt.gyro.x}</span>,{" "}
                        <span style={{ color: "#0891b2" }}>{pkt.gyro.y}</span>,{" "}
                        <span style={{ color: "#dc2626" }}>{pkt.gyro.z}</span>
                      </td>
                      <td className="pkt-voltage">{pkt.voltage}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Module Status & Tech Specs */}
        <div className="sensor-right-column">
          {/* Card 4: Trạng thái Module */}
          <div className="sensor-card module-status-card">
            <div className="sensor-card-header">
              <div className="sensor-card-title-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <h3>Trạng thái Module</h3>
              </div>
            </div>

            <div className="module-status-list">
              {/* Item 1: GPS */}
              <div className="module-item">
                <div className="module-icon-wrap blue">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                </div>
                <div className="module-info">
                  <strong>GPS Module</strong>
                  <small>{telemetry.satellites} Satellites Locked</small>
                </div>
                <span className="module-badge-good">Tốt</span>
              </div>

              {/* Item 2: Accelerometer */}
              <div className="module-item">
                <div className="module-icon-wrap purple">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M3 12h3M18 12h3M12 3v3M12 18v3" />
                  </svg>
                </div>
                <div className="module-info">
                  <strong>Accelerometer</strong>
                  <small>Calibrated</small>
                </div>
                <span className="module-badge-good">Tốt</span>
              </div>

              {/* Item 3: Gyroscope */}
              <div className="module-item">
                <div className="module-icon-wrap cyan">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z" />
                    <path d="M12 6v6l4 2" />
                  </svg>
                </div>
                <div className="module-info">
                  <strong>Gyroscope</strong>
                  <small>Calibrated</small>
                </div>
                <span className="module-badge-good">Tốt</span>
              </div>

              {/* Item 4: Battery Temp */}
              <div className="module-item">
                <div className="module-icon-wrap orange">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" />
                  </svg>
                </div>
                <div className="module-info">
                  <strong>Nhiệt độ Pin</strong>
                  <small>Bình thường</small>
                </div>
                <span className="module-temp-val">{telemetry.batteryTemp}°C</span>
              </div>
            </div>
          </div>

          {/* Card 5: Thông số kỹ thuật */}
          <div className="sensor-card tech-specs-card">
            <div className="sensor-card-header">
              <div className="sensor-card-title-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                  <rect x="2" y="3" width="20" height="14" rx="2" />
                  <line x1="8" y1="21" x2="16" y2="21" />
                  <line x1="12" y1="17" x2="12" y2="21" />
                </svg>
                <h3>Thông số kỹ thuật</h3>
              </div>
            </div>

            <div className="tech-specs-list">
              <div className="tech-spec-row">
                <span>Tần số lấy mẫu (Sampling Rate)</span>
                <span className="spec-badge">50 Hz</span>
              </div>

              <div className="tech-spec-row">
                <span>Firmware Version</span>
                <span className="spec-code-tag">v2.4.1-stable</span>
              </div>

              <div className="tech-spec-row">
                <span>Trạng thái hiệu chuẩn (Calibration)</span>
                <strong className="spec-val-green">Đã hoàn tất</strong>
              </div>

              <div className="tech-spec-row">
                <span>Chế độ kết nối</span>
                <strong className="spec-val-blue">📶 4G LTE</strong>
              </div>

              <div className="tech-spec-row">
                <span>Băng thông Payload</span>
                <strong>12 kbps</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SensorData;