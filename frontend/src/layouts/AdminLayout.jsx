import { Outlet } from "react-router-dom";

import Header from "../components/layout/Header";
import AdminSidebar from "../components/layout/AdminSidebar";

function AdminLayout() {
  return (
    <div>
      <AdminSidebar />

      <div>
        <Header />

        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;