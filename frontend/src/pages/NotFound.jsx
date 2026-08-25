import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div>
      <h1>404</h1>
      <p>Không tìm thấy trang.</p>

      <Link to="/">Về trang chủ</Link>
    </div>
  );
}

export default NotFound;