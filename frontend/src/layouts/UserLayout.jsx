import { Outlet } from "react-router-dom";

import Header from "../components/layout/Header";
import AlertPopup from "../components/layout/AlertPopup";
import UserSidebar from "../components/layout/UserSidebar";
import MobileBottomNav from "../components/layout/MobileBottomNav";

import "../styles/user-dashboard.css";

function UserLayout() {
  return (
    <div className="user-shell">
      <UserSidebar />

      <div className="user-main-shell">
        <Header />

        <main className="user-content">
          <Outlet />
        </main>
      </div>

      <AlertPopup />
      <MobileBottomNav />
    </div>
  );
}

export default UserLayout;