import { useState, useEffect } from "react";

export default function useIsMobile(breakpoint = 780) {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") return false;
    const isPwa = window.matchMedia("(display-mode: standalone)").matches;
    return isPwa || window.innerWidth <= breakpoint;
  });

  useEffect(() => {
    const handleResize = () => {
      const isPwa = window.matchMedia("(display-mode: standalone)").matches;
      setIsMobile(isPwa || window.innerWidth <= breakpoint);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [breakpoint]);

  return isMobile;
}
