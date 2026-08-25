import { Link } from "react-router-dom";

function Home() {
  return (
    <div>
      <h1>Hệ thống giám sát an toàn xe máy</h1>

      <p>
        Theo dõi vị trí phương tiện và phát hiện
        va chạm/tai nạn bằng thiết bị IoT.
      </p>

      <div>
        <Link to="/login">
          <button>Đăng nhập</button>
        </Link>

        <Link to="/register">
          <button>Đăng ký</button>
        </Link>
      </div>
    </div>
  );
}

export default Home;