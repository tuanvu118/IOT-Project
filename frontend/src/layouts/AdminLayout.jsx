import { Outlet } from "react-router-dom";
import Header from "../components/layout/Header";
import AdminSidebar from "../components/layout/AdminSidebar";
import "../styles/user-dashboard.css";

function AdminLayout() {
  return (
    <div className="user-shell admin-shell">
      <AdminSidebar />

      <div className="user-main-shell">
        <Header />

        <main className="user-content admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;