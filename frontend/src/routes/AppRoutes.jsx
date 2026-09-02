import { Routes, Route } from "react-router-dom";
import useIsMobile from "../hooks/useIsMobile";

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

// ================= USER (ORIGINAL DESKTOP WEB) =================

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

// ================= USER (DEDICATED PWA MOBILE) =================
import MobileDashboard from "../pages/mobile/MobileDashboard";
import MobileTracking from "../pages/mobile/MobileTracking";
import MobileAlerts from "../pages/mobile/MobileAlerts";
import MobileVehicles from "../pages/mobile/MobileVehicles";
import MobileAddVehicle from "../pages/mobile/MobileAddVehicle";
import MobileDevices from "../pages/mobile/MobileDevices";
import MobileAddDevice from "../pages/mobile/MobileAddDevice";
import MobileLinkDevice from "../pages/mobile/MobileLinkDevice";
import MobileDeviceDetail from "../pages/mobile/MobileDeviceDetail";
import MobileProfile from "../pages/mobile/MobileProfile";

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

/**
 * AdaptiveRoute dynamically renders the Mobile PWA Component on phones/PWA mode,
 * and the original Desktop Web Component on PC browsers.
 */
function AdaptiveRoute({ desktop: DesktopComponent, mobile: MobileComponent }) {
  const isMobile = useIsMobile();
  if (isMobile && MobileComponent) {
    return <MobileComponent />;
  }
  return <DesktopComponent />;
}

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
        <Route
          path="/dashboard"
          element={<AdaptiveRoute desktop={Dashboard} mobile={MobileDashboard} />}
        />

        {/* Tracking */}
        <Route
          path="/tracking"
          element={<AdaptiveRoute desktop={Tracking} mobile={MobileTracking} />}
        />

        {/* Alerts */}
        <Route
          path="/alerts"
          element={<AdaptiveRoute desktop={AccidentHistory} mobile={MobileAlerts} />}
        />
        <Route path="/alerts/:id" element={<AccidentDetail />} />

        {/* Vehicles */}
        <Route
          path="/vehicles"
          element={<AdaptiveRoute desktop={Vehicles} mobile={MobileVehicles} />}
        />
        <Route
          path="/vehicles/add"
          element={<AdaptiveRoute desktop={AddVehicle} mobile={MobileAddVehicle} />}
        />
        <Route path="/vehicles/:id/edit" element={<EditVehicle />} />

        {/* Devices */}
        <Route
          path="/devices"
          element={<AdaptiveRoute desktop={Devices} mobile={MobileDevices} />}
        />
        <Route
          path="/devices/add"
          element={<AdaptiveRoute desktop={AddDevice} mobile={MobileAddDevice} />}
        />
        <Route
          path="/devices/link"
          element={<AdaptiveRoute desktop={LinkDevice} mobile={MobileLinkDevice} />}
        />
        <Route
          path="/devices/:id"
          element={<AdaptiveRoute desktop={DeviceDetail} mobile={MobileDeviceDetail} />}
        />
        <Route path="/devices/:id/sensors" element={<SensorData />} />

        {/* Profile */}
        <Route
          path="/profile"
          element={<AdaptiveRoute desktop={Profile} mobile={MobileProfile} />}
        />
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