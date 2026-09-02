import { Outlet } from "react-router-dom";
import Header from "../components/layout/Header";
import AlertPopup from "../components/layout/AlertPopup";
import UserSidebar from "../components/layout/UserSidebar";

import "../styles/user-dashboard.css";
import "../styles/responsive.css";

function DesktopUserLayout() {
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
    </div>
  );
}

export default DesktopUserLayout;
