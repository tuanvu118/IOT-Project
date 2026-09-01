import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { getAllUsers } from "../../services/userService";
import { getAllDevicesAdmin } from "../../services/deviceService";

function AdminDashboard() {
  const [usersCount, setUsersCount] = useState(45231);
  const [activeCount, setActiveCount] = useState(12840);
  const [devicesCount, setDevicesCount] = useState(48500);
  const [syncing, setSyncing] = useState(false);
  const [alertFilter, setAlertFilter] = useState("all");
  const [alerts, setAlerts] = useState([]);

  // Load live counts & real device alerts from system
  const loadSystemStats = async () => {
    try {
      const [uRes, dRes] = await Promise.allSettled([
        getAllUsers(),
        getAllDevicesAdmin(),
      ]);

      // 1. Total Users
      let allUsers = [];
      if (uRes.status === "fulfilled" && Array.isArray(uRes.value)) {
        allUsers = uRes.value;
      }
      const customUsers = JSON.parse(localStorage.getItem("admin_custom_created_users") || "[]");
      const combinedUsers = [...customUsers, ...allUsers];
      const seenUsers = new Set();
      const uniqueUsers = combinedUsers.filter((u) => {
        const key = u.id || u.email;
        if (seenUsers.has(key)) return false;
        seenUsers.add(key);
        return true;
      });
      const totalUsers = uniqueUsers.length > 0 ? uniqueUsers.length : 4;
      setUsersCount(totalUsers);

      // 2. Total Devices & Active Bikes
      let allDevices = [];
      if (dRes.status === "fulfilled" && Array.isArray(dRes.value)) {
        allDevices = dRes.value;
      }
      const customDevs = JSON.parse(localStorage.getItem("admin_custom_devices") || "[]");
      const combinedDevs = [...customDevs, ...allDevices];

      const seenDevs = new Set();
      const uniqueDevs = combinedDevs.filter((d) => {
        const key = d.id || d.imei || d.verification_code;
        if (seenDevs.has(key)) return false;
        seenDevs.add(key);
        return true;
      });

      const totalDevs = uniqueDevs.length > 0 ? uniqueDevs.length : 0;
      const activeDevs = uniqueDevs.filter(
        (d) => d.status === 1 || d.status === "online" || d.isOnline
      ).length;

      setDevicesCount(totalDevs);
      setActiveCount(activeDevs);

      // 3. Generate alerts ONLY from ACTIVATED devices that are offline or low-battery
      const realAlerts = [];
      uniqueDevs.forEach((d) => {
        const isActivated = Boolean(
          d.user_id ||
          d.userId ||
          (d.vehicle && (d.vehicle.brand || d.vehicle.model || d.vehicle.license_plate || d.vehicle.licensePlate))
        );

        // Bỏ qua các thiết bị trong kho chưa được người dùng kích hoạt
        if (!isActivated) return;

        const code = d.verification_code || d.imei || d.id;
        const isOff = d.status === 0 || d.status === "offline" || d.isOnline === false;
        const battery = d.battery ?? 15;

        if (isOff) {
          realAlerts.push({
            id: `alt-offline-${code}`,
            deviceId: code,
            targetId: d.id || code,
            type: "offline",
            typeName: "Device Offline / Mất kết nối",
            severity: "HIGH",
            location: d.locations?.[0]?.address || "Hà Nội",
            timestamp: d.heartbeat || "Vừa xong",
            status: "unacknowledged",
          });
        } else if (battery < 20) {
          realAlerts.push({
            id: `alt-bat-${code}`,
            deviceId: code,
            targetId: d.id || code,
            type: "battery",
            typeName: `Cảnh báo pin yếu (${battery}%)`,
            severity: "WARNING",
            location: d.locations?.[0]?.address || "Hà Nội",
            timestamp: "Vừa xong",
            status: "unacknowledged",
          });
        }
      });

      setAlerts(realAlerts);
    } catch (err) {
      console.warn("Load system stats error:", err);
    }
  };

  useEffect(() => {
    loadSystemStats();
  }, []);

  const handleSyncData = () => {
    setSyncing(true);
    setTimeout(() => {
      loadSystemStats();
      setSyncing(false);
    }, 800);
  };

  // Filtered alerts
  const filteredAlerts = useMemo(() => {
    if (alertFilter === "all") return alerts;
    return alerts.filter((a) => {
      if (alertFilter === "critical") return a.severity === "CRITICAL";
      if (alertFilter === "high") return a.severity === "HIGH";
      if (alertFilter === "warning") return a.severity === "WARNING";
      return true;
    });
  }, [alerts, alertFilter]);

  const handleAcknowledge = (alertId) => {
    setAlerts((prev) => prev.filter((a) => a.id !== alertId));
  };

  return (
    <div className="admin-dashboard-page">
      {/* Top Header Row */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-dashboard-main-title">System Overview</h1>
          <p className="admin-dashboard-subtitle">
            Real-time telemetry and health monitoring.
          </p>
        </div>

        <button
          type="button"
          className="admin-sync-btn"
          onClick={handleSyncData}
          disabled={syncing}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            className={syncing ? "spinning" : ""}
            aria-hidden="true"
          >
            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
          </svg>
          {syncing ? "Syncing..." : "Sync Data"}
        </button>
      </div>

      {/* Top 4 KPI Metric Cards */}
      <div className="admin-overview-kpi-grid">
        {/* Card 1: Total Users */}
        <div className="admin-overview-kpi-card">
          <div className="kpi-card-header">
            <div className="kpi-icon-badge blue">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <span className="kpi-pill-badge green">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                <polyline points="17 6 23 6 23 12" />
              </svg>
              +12%
            </span>
          </div>
          <small className="kpi-label-text">Total Users</small>
          <strong className="kpi-value-text">{usersCount.toLocaleString()}</strong>
        </div>

        {/* Card 2: Active Bikes (Live) */}
        <div className="admin-overview-kpi-card">
          <div className="kpi-card-header">
            <div className="kpi-icon-badge green">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <circle cx="18.5" cy="17.5" r="3.5" />
                <circle cx="5.5" cy="17.5" r="3.5" />
                <circle cx="15" cy="5" r="1" />
                <path d="M12 17.5V14l-3-3 4-3 2 3h2" />
              </svg>
            </div>
            <div className="kpi-live-dot-wrap">
              <span className="kpi-live-dot" />
            </div>
          </div>
          <small className="kpi-label-text">Active Bikes (Live)</small>
          <strong className="kpi-value-text">{activeCount.toLocaleString()}</strong>
        </div>

        {/* Card 3: Total IoT Devices */}
        <div className="admin-overview-kpi-card">
          <div className="kpi-card-header">
            <div className="kpi-icon-badge amber">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <rect x="4" y="4" width="16" height="16" rx="2" />
                <rect x="9" y="9" width="6" height="6" />
                <line x1="9" y1="1" x2="9" y2="4" />
                <line x1="15" y1="1" x2="15" y2="4" />
                <line x1="9" y1="20" x2="9" y2="23" />
                <line x1="15" y1="20" x2="15" y2="23" />
                <line x1="20" y1="9" x2="23" y2="9" />
                <line x1="20" y1="14" x2="23" y2="14" />
                <line x1="1" y1="9" x2="4" y2="9" />
                <line x1="1" y1="14" x2="4" y2="14" />
              </svg>
            </div>
            <span className="kpi-pill-badge blue">All Regions</span>
          </div>
          <small className="kpi-label-text">Total IoT Devices</small>
          <strong className="kpi-value-text">{devicesCount.toLocaleString()}</strong>
        </div>

        {/* Card 4: System Uptime */}
        <div className="admin-overview-kpi-card">
          <div className="kpi-card-header">
            <div className="kpi-icon-badge slate">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <rect x="2" y="2" width="20" height="8" rx="2" />
                <rect x="2" y="14" width="20" height="8" rx="2" />
                <line x1="6" y1="6" x2="6.01" y2="6" />
                <line x1="6" y1="18" x2="6.01" y2="18" />
              </svg>
            </div>
            <span className="kpi-pill-badge mint-solid">Stable</span>
          </div>
          <small className="kpi-label-text">System Uptime</small>
          <strong className="kpi-value-text">99.98%</strong>
        </div>
      </div>

      {/* Middle Row: Event & Alert Volume Chart & System Health */}
      <div className="admin-dashboard-mid-grid">
        {/* Left Column: Event & Alert Volume Chart */}
        <div className="admin-chart-card">
          <div className="chart-card-header">
            <div>
              <h2 className="chart-title">Event & Alert Volume</h2>
              <small className="chart-subtitle">Last 24 Hours</small>
            </div>

            <div className="chart-legend-wrap">
              <span className="legend-item routine">
                <span className="legend-dot blue" /> Routine
              </span>
              <span className="legend-item critical">
                <span className="legend-dot red" /> Critical
              </span>
            </div>
          </div>

          {/* SVG Vector Chart matching the screenshot */}
          <div className="chart-svg-container">
            <svg viewBox="0 0 600 240" className="admin-wave-svg" preserveAspectRatio="none">
              <defs>
                <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563eb" stopOpacity="0.22" />
                  <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="40" y1="40" x2="580" y2="40" stroke="#f1f5f9" strokeDasharray="3 3" />
              <line x1="40" y1="120" x2="580" y2="120" stroke="#f1f5f9" strokeDasharray="3 3" />
              <line x1="40" y1="200" x2="580" y2="200" stroke="#e2e8f0" />

              {/* Blue Routine Area Fill */}
              <path
                d="M 40 195 C 110 190, 160 190, 200 150 C 240 115, 270 120, 310 160 C 350 195, 380 185, 420 120 C 460 40, 500 20, 530 45 C 550 70, 565 120, 580 145 L 580 200 L 40 200 Z"
                fill="url(#blueGradient)"
              />

              {/* Blue Routine Smooth Stroke */}
              <path
                d="M 40 195 C 110 190, 160 190, 200 150 C 240 115, 270 120, 310 160 C 350 195, 380 185, 420 120 C 460 40, 500 20, 530 45 C 550 70, 565 120, 580 145"
                fill="none"
                stroke="#0066cc"
                strokeWidth="4.5"
                strokeLinecap="round"
              />

              {/* Red Dashed Critical Alerts Line */}
              <path
                d="M 40 200 L 130 200 L 145 180 L 160 200 L 380 200 L 405 160 L 430 200 L 580 200"
                fill="none"
                stroke="#b91c1c"
                strokeWidth="3.5"
                strokeDasharray="6 4"
                strokeLinecap="round"
              />
            </svg>

            {/* Y-Axis Labels */}
            <div className="chart-y-axis">
              <span>1k</span>
              <span>500</span>
              <span>0k</span>
            </div>

            {/* X-Axis Labels */}
            <div className="chart-x-axis">
              <span>00:00</span>
              <span>06:00</span>
              <span>12:00</span>
              <span>18:00</span>
              <span>Now</span>
            </div>
          </div>
        </div>

        {/* Right Column: System Health */}
        <div className="admin-health-card">
          <div className="health-card-header">
            <h2 className="chart-title">System Health</h2>
            <button type="button" className="health-more-btn" title="Options">
              <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                <circle cx="12" cy="5" r="2" />
                <circle cx="12" cy="12" r="2" />
                <circle cx="12" cy="19" r="2" />
              </svg>
            </button>
          </div>

          <div className="health-items-list">
            {/* Item 1: Core Servers */}
            <div className="health-item-row">
              <div className="health-item-left">
                <div className="health-icon-badge slate">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="4" y="4" width="16" height="16" rx="2" />
                    <rect x="9" y="9" width="6" height="6" />
                    <line x1="9" y1="1" x2="9" y2="4" />
                    <line x1="15" y1="1" x2="15" y2="4" />
                    <line x1="9" y1="20" x2="9" y2="23" />
                    <line x1="15" y1="20" x2="15" y2="23" />
                  </svg>
                </div>
                <div>
                  <strong className="health-item-title">Core Servers</strong>
                  <p className="health-item-meta">CPU: 42% | RAM: 68%</p>
                </div>
              </div>
              <span className="health-status-badge online">
                <span className="dot" /> Online
              </span>
            </div>

            {/* Item 2: Main Database */}
            <div className="health-item-row">
              <div className="health-item-left">
                <div className="health-icon-badge slate">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <ellipse cx="12" cy="5" rx="9" ry="3" />
                    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
                    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
                  </svg>
                </div>
                <div>
                  <strong className="health-item-title">Main Database</strong>
                  <p className="health-item-meta">Latency: 12ms</p>
                </div>
              </div>
              <span className="health-status-badge online">
                <span className="dot" /> Online
              </span>
            </div>

            {/* Item 3: API Gateway */}
            <div className="health-item-row">
              <div className="health-item-left">
                <div className="health-icon-badge rose">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
                    <path d="M4.93 4.93l2.12 2.12M16.95 16.95l2.12 2.12M4.93 19.07l2.12-2.12M16.95 7.05l2.12-2.12" />
                  </svg>
                </div>
                <div>
                  <strong className="health-item-title">API Gateway</strong>
                  <p className="health-item-meta error-text">High Error Rate (5xx)</p>
                </div>
              </div>
              <span className="health-status-badge degraded">
                <span className="warning-icon">⚠</span> Degraded
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Table Card: Recent Critical Alerts */}
      <div className="admin-table-card" style={{ marginTop: "24px" }}>
        <div className="admin-table-toolbar">
          <div>
            <h2 className="admin-table-title" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ color: "#e11d48" }}>📢</span> Recent Critical Alerts
            </h2>
            <p style={{ margin: "2px 0 0", color: "#64748b", fontSize: "12.5px" }}>
              Showing most recent unacknowledged alerts.
            </p>
          </div>

          <div className="admin-filter-select-wrap">
            <select
              value={alertFilter}
              onChange={(e) => setAlertFilter(e.target.value)}
              style={{
                height: "36px",
                border: "1.5px solid #cbd5e1",
                borderRadius: "8px",
                padding: "0 12px",
                fontSize: "13px",
                fontWeight: "600",
                color: "#334155",
                background: "#ffffff",
              }}
            >
              <option value="all">All Types</option>
              <option value="critical">Critical Only</option>
              <option value="high">High Only</option>
              <option value="warning">Warning Only</option>
            </select>
          </div>
        </div>

        {filteredAlerts.length === 0 ? (
          <div className="admin-empty-state">
            <p>No unacknowledged critical alerts.</p>
          </div>
        ) : (
          <div className="admin-table-responsive">
            <table className="admin-users-table">
              <thead>
                <tr>
                  <th>Device ID</th>
                  <th>Alert Type</th>
                  <th>Severity</th>
                  <th>Location</th>
                  <th>Timestamp</th>
                  <th style={{ textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredAlerts.map((alert) => (
                  <tr key={alert.id}>
                    <td>
                      <Link
                        to={`/admin/devices/${alert.deviceId}`}
                        style={{
                          color: "#2563eb",
                          fontWeight: "750",
                          textDecoration: "none",
                          fontSize: "13.5px",
                        }}
                      >
                        {alert.deviceId}
                      </Link>
                    </td>

                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13.5px", fontWeight: "600", color: "#1e293b" }}>
                        {alert.type === "crash" && <span>🚨</span>}
                        {alert.type === "vibration" && <span>📳</span>}
                        {alert.type === "battery" && <span>🔋</span>}
                        {alert.type === "fall" && <span>⚠️</span>}
                        <span>{alert.typeName}</span>
                      </div>
                    </td>

                    <td>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "2px 8px",
                          borderRadius: "6px",
                          fontSize: "11px",
                          fontWeight: "800",
                          letterSpacing: "0.5px",
                          color: "#ffffff",
                          background:
                            alert.severity === "CRITICAL"
                              ? "#dc2626"
                              : alert.severity === "HIGH"
                              ? "#d97706"
                              : "#f97316",
                        }}
                      >
                        {alert.severity}
                      </span>
                    </td>

                    <td style={{ color: "#475569", fontSize: "13px" }}>
                      📍 {alert.location}
                    </td>

                    <td style={{ color: "#64748b", fontSize: "13px" }}>
                      {alert.timestamp}
                    </td>

                    <td style={{ textAlign: "right" }}>
                      <button
                        type="button"
                        onClick={() => handleAcknowledge(alert.id)}
                        style={{
                          border: "1px solid #cbd5e1",
                          background: "#ffffff",
                          borderRadius: "6px",
                          padding: "4px 10px",
                          fontSize: "12px",
                          fontWeight: "600",
                          color: "#475569",
                          cursor: "pointer",
                        }}
                      >
                        Acknowledge
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;