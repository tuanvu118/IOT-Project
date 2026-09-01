import { Routes, Route } from "react-router-dom";

// Public
import Home from "../pages/Home";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";

// Layout
import UserLayout from "../layouts/UserLayout";
import AdminLayout from "../layouts/AdminLayout";

// Route protection
import ProtectedRoute from "./ProtectedRoute";
import AdminRoute from "./AdminRoute";

// ================= USER =================

// Dashboard
import Dashboard from "../pages/user/Dashboard";

// Tracking
import Tracking from "../pages/user/tracking/Tracking";

// Accident / Alert
import AccidentHistory from "../pages/user/accident/AccidentHistory";
import AccidentDetail from "../pages/user/accident/AccidentDetail";

// Vehicle
import Vehicles from "../pages/user/vehicle/Vehicles";
import AddVehicle from "../pages/user/vehicle/AddVehicle";
import EditVehicle from "../pages/user/vehicle/EditVehicle";

// Device
import Devices from "../pages/user/device/Devices";
import DeviceDetail from "../pages/user/device/DeviceDetail";
import LinkDevice from "../pages/user/device/LinkDevice";
import AddDevice from "../pages/user/device/AddDevice";

// Sensor
import SensorData from "../pages/user/sensor/SensorData";

// Profile
import Profile from "../pages/user/profile/Profile";
import EditProfile from "../pages/user/profile/EditProfile";
import ChangePassword from "../pages/user/profile/ChangePassword";

// ================= ADMIN =================

import AdminDashboard from "../pages/admin/AdminDashboard";

// User management
import UserList from "../pages/admin/users/UserList";
import UserDetail from "../pages/admin/users/UserDetail";
import EditUser from "../pages/admin/users/EditUser";

// Device management
import AdminDeviceList from "../pages/admin/devices/DeviceList";
import AdminDeviceDetail from "../pages/admin/devices/DeviceDetail";
import AdminAddDevice from "../pages/admin/devices/AddDevice";
import EditDevice from "../pages/admin/devices/EditDevice";

// Settings
import AdminSettings from "../pages/admin/settings/AdminSettings";

// 404
import NotFound from "../pages/NotFound";

function AppRoutes() {
  return (
    <Routes>
      {/* ================= PUBLIC ================= */}

      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* ================= USER ================= */}

      <Route
        element={
          <ProtectedRoute>
            <UserLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Tracking */}
        <Route path="/tracking" element={<Tracking />} />

        {/* Alerts */}
        <Route path="/alerts" element={<AccidentHistory />} />
        <Route path="/alerts/:id" element={<AccidentDetail />} />

        {/* Vehicles */}
        <Route path="/vehicles" element={<Vehicles />} />
        <Route path="/vehicles/add" element={<AddVehicle />} />
        <Route path="/vehicles/:id/edit" element={<EditVehicle />} />

        {/* Devices */}
        <Route path="/devices" element={<Devices />} />
        <Route path="/devices/add" element={<AddDevice />} />
        <Route path="/devices/link" element={<LinkDevice />} />
        <Route path="/devices/:id" element={<DeviceDetail />} />
        <Route path="/devices/:id/sensors" element={<SensorData />} />

        {/* Profile */}
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/edit" element={<EditProfile />} />
        <Route
          path="/profile/change-password"
          element={<ChangePassword />}
        />
      </Route>

      {/* ================= ADMIN ================= */}

      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<AdminDashboard />} />

        {/* User Management */}
        <Route path="users" element={<UserList />} />
        <Route path="users/:id" element={<UserDetail />} />
        <Route path="users/:id/edit" element={<EditUser />} />

        {/* Device Management */}
        <Route path="devices" element={<AdminDeviceList />} />
        <Route path="devices/add" element={<AdminAddDevice />} />
        <Route path="devices/:id" element={<AdminDeviceDetail />} />
        <Route path="devices/:id/sensors" element={<SensorData />} />
        <Route path="devices/:id/edit" element={<EditDevice />} />

        {/* System Settings */}
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      {/* ================= 404 ================= */}

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default AppRoutes;