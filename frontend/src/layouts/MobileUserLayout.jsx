import { Outlet } from "react-router-dom";
import MobileHeader from "../components/mobile/MobileHeader";
import MobileBottomNav from "../components/mobile/MobileBottomNav";
import AlertPopup from "../components/layout/AlertPopup";

import "../styles/user-dashboard.css";
import "../styles/pwa-mobile.css";

function MobileUserLayout() {
  return (
    <div className="pwa-mobile-shell">
      <MobileHeader />

      <main className="pwa-mobile-content">
        <Outlet />
      </main>

      <AlertPopup />
      <MobileBottomNav />
    </div>
  );
}

export default MobileUserLayout;
