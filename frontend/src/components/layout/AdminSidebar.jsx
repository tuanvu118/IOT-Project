import { NavLink } from "react-router-dom";

function AdminSidebar() {
  return (
    <aside>
      <h2>IoT Admin</h2>

      <nav>
        <div>
          <NavLink to="/admin">Tổng quan</NavLink>
        </div>

        <div>
          <NavLink to="/admin/users">
            Quản lý người dùng
          </NavLink>
        </div>

        <div>
          <NavLink to="/admin/devices">
            Quản lý thiết bị
          </NavLink>
        </div>
      </nav>
    </aside>
  );
}

export default AdminSidebar;