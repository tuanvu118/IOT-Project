import { Outlet } from "react-router-dom";

import Header from "../components/layout/Header";
import UserSidebar from "../components/layout/UserSidebar";

function UserLayout() {
  return (
    <div>
      <UserSidebar />

      <div>
        <Header />

        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default UserLayout;