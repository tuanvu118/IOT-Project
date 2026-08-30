import { Link } from "react-router-dom";
import "./Home.css";

const features = [
  {
    icon: "gps",
    title: "Theo dõi vị trí",
    description:
      "Xác định vị trí xe theo thời gian thực trên bản đồ số với độ chính xác cao nhờ tích hợp GPS/GLONASS.",
  },
  {
    icon: "accident",
    title: "Phát hiện tai nạn",
    description:
      "Cảm biến gia tốc 6 trục thông minh tự động nhận diện va chạm mạnh hoặc xe đổ ngã bất thường.",
  },
  {
    icon: "alert",
    title: "Cảnh báo khẩn cấp",
    description:
      "Gửi thông báo đẩy, SMS hoặc cuộc gọi đến số điện thoại người thân và ứng dụng ngay lập tức.",
  },
  {
    icon: "lock",
    title: "Chống trộm",
    description:
      "Khóa động cơ từ xa, bật còi báo động khi có dấu hiệu dắt xe, mở khóa trái phép hoặc ra khỏi vùng an toàn.",
  },
];

function FeatureIcon({ type }) {
  if (type === "gps") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 3v3m0 12v3M3 12h3m12 0h3" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2.4" />
      </svg>
    );
  }

  if (type === "accident") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 16h11l2 3h2" />
        <path d="M5 16l2-5h8l1 5" />
        <circle cx="7" cy="18" r="1.6" />
        <circle cx="15" cy="18" r="1.6" />
        <path d="M18 4v6m0 4h.01" />
      </svg>
    );
  }

  if (type === "alert") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M7 10a5 5 0 0 1 10 0v4l2 3H5l2-3z" />
        <path d="M10 20h4" />
        <path d="M4 10h2m12 0h2M12 3v2" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="6" y="10" width="12" height="10" rx="2" />
      <path d="M9 10V7a3 3 0 0 1 6 0v3" />
      <path d="M12 14v3" />
    </svg>
  );
}

function LogoMark() {
  return (
    <span className="home-logo-mark" aria-hidden="true">
      <svg viewBox="0 0 32 32">
        <path d="M16 3 27 7v8c0 7-4.5 11.4-11 14C9.5 26.4 5 22 5 15V7z" />
        <path d="M11 15.5 14.2 19 22 10.8" />
        <path d="M10 9.5 16 7l6 2.5" />
      </svg>
    </span>
  );
}

function Home() {
  return (
    <main className="home-page">
      <header className="home-header">
        <Link className="home-brand" to="/">
          <LogoMark />
          <span>SmartBike IoT</span>
        </Link>

        <nav className="home-nav" aria-label="Điều hướng chính">
          <Link className="home-login-link" to="/login">
            Đăng nhập
          </Link>
          <Link className="home-register-link" to="/register">
            Đăng ký
          </Link>
        </nav>
      </header>

      <section className="home-hero">
        <div className="home-hero-content">
          <div className="home-badge">
            <span className="home-badge-icon">shield</span>
            Giải pháp bảo vệ toàn diện 24/7
          </div>

          <h1>
            Giám sát và bảo vệ
            <span>phương tiện của bạn</span>
          </h1>

          <p>
            Theo dõi vị trí xe bằng GPS, giám sát thiết bị IoT và nhận cảnh báo
            ngay lập tức khi phát hiện tai nạn, va chạm hoặc các tình huống bất
            thường.
          </p>

          <div className="home-actions">
            <Link className="home-primary-button" to="/register">
              Bắt đầu ngay
              <span aria-hidden="true">{"->"}</span>
            </Link>
            <Link className="home-secondary-button" to="/login">
              Đăng nhập
            </Link>
          </div>

          <div className="home-supported">
            <span className="home-vehicle-icons" aria-hidden="true">
              <span>car</span>
              <span>bike</span>
              <span>moto</span>
            </span>
            <strong>Hỗ trợ đa dạng các dòng xe máy</strong>
          </div>
        </div>

        <div className="home-hero-visual" aria-label="Bảng điều khiển giám sát">
          <span className="home-floating-dot" aria-hidden="true" />

          <div className="home-dashboard-card">
            <div className="home-map-panel">
              <div className="home-panel-title">
                <span className="home-pin" aria-hidden="true" />
                <strong>Vị trí hiện tại</strong>
                <span className="home-online">Trực tuyến</span>
              </div>

              <div className="home-map">
                <div className="home-map-bar" />
                <div className="home-road road-a" />
                <div className="home-road road-b" />
                <div className="home-road road-c" />
                <div className="home-block block-a" />
                <div className="home-block block-b" />
                <div className="home-block block-c" />
                <div className="home-block block-d" />
                <div className="home-bike-marker">bike</div>
                <div className="home-map-label">Honda SH - 45km/h</div>
                <div className="home-map-toast">
                  Đang kết nối...
                  <span>SmartBike IoT đang giám sát vị trí.</span>
                </div>
              </div>
            </div>

            <div className="home-status-card home-protect-card">
              <span className="home-shield-icon">
                <LogoMark />
              </span>
              <strong>Chế độ bảo vệ</strong>
              <span>Đang kích hoạt</span>
            </div>

            <div className="home-status-card home-battery-card">
              <div className="home-signal-row">
                <span>device</span>
                <span>wifi</span>
              </div>
              <small>PIN THIẾT BỊ</small>
              <div className="home-battery-row">
                <span className="home-battery-track">
                  <span />
                </span>
                <strong>85%</strong>
              </div>
            </div>

            <div className="home-alert-card">
              <span className="home-alert-icon">!</span>
              <div>
                <strong>Cảnh báo mô phỏng</strong>
                <p>
                  Phát hiện rung lắc mạnh lúc 10:45 AM. Đã tự động bật còi hú.
                </p>
              </div>
              <Link to="/login">Kiểm tra</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="home-features">
        <div className="home-section-heading">
          <h2>Tính năng nổi bật</h2>
          <p>
            Hệ thống IoT thông minh giúp bạn kiểm soát hoàn toàn phương tiện của
            mình mọi lúc, mọi nơi với độ trễ cực thấp.
          </p>
        </div>

        <div className="home-feature-grid">
          {features.map((feature) => (
            <article className={`home-feature-card ${feature.icon}`} key={feature.title}>
              <span className="home-feature-icon">
                <FeatureIcon type={feature.icon} />
              </span>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </article>
          ))}
        </div>
      </section>

      <footer className="home-footer">
        <div className="home-footer-brand">
          <LogoMark />
          <span>SmartBike IoT</span>
        </div>
        <p>© 2024 Hệ thống Giám sát Xe máy. All rights reserved.</p>
      </footer>
    </main>
  );
}

export default Home;
