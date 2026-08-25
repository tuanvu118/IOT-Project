import { NavLink } from "react-router-dom";

function UserSidebar() {
  return (
    <aside>
      <h2>IoT Vehicle</h2>

      <nav>
        <div>
          <NavLink to="/dashboard">Tổng quan</NavLink>
        </div>

        <div>
          <NavLink to="/tracking">Theo dõi vị trí</NavLink>
        </div>

        <div>
          <NavLink to="/alerts">Cảnh báo</NavLink>
        </div>

        <div>
          <NavLink to="/vehicles">Phương tiện</NavLink>
        </div>

        <div>
          <NavLink to="/devices">Thiết bị IoT</NavLink>
        </div>

        <div>
          <NavLink to="/profile">Hồ sơ cá nhân</NavLink>
        </div>
      </nav>
    </aside>
  );
}

export default UserSidebar;