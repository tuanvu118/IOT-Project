import useIsMobile from "../hooks/useIsMobile";
import DesktopUserLayout from "./DesktopUserLayout";
import MobileUserLayout from "./MobileUserLayout";

function UserLayout() {
  const isMobile = useIsMobile();
  return isMobile ? <MobileUserLayout /> : <DesktopUserLayout />;
}

export default UserLayout;