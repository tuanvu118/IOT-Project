import { Outlet, Link } from "react-router-dom";

function PublicLayout() {
  return (
    <>
      <header>
        <Link to="/">IoT Vehicle</Link>

        <nav>
          <Link to="/login">Đăng nhập</Link>
          <Link to="/register">Đăng ký</Link>
        </nav>
      </header>

      <Outlet />
    </>
  );
}

export default PublicLayout;