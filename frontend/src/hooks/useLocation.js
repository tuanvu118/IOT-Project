import { useCallback, useEffect, useRef, useState } from "react";
import { getDeviceLocation } from "../services/locationService";

function useLocation(deviceId) {
  const [location, setLocation] = useState(null);
  const [device, setDevice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  const isFetchingRef = useRef(false);
  const controllerRef = useRef(null);

  const fetchLocation = useCallback(
    async (manual = false) => {
      if (!deviceId || isFetchingRef.current) {
        return;
      }

      isFetchingRef.current = true;

      if (manual) {
        setRefreshing(true);
      }

      controllerRef.current = new AbortController();

      try {
        const result = await getDeviceLocation(
          deviceId,
          controllerRef.current.signal
        );

        setDevice(result.device);
        setLocation(result.location);
        setError("");
        setLastUpdated(new Date());
      } catch (err) {
        if (err.name !== "AbortError") {
          setError("Không thể tải vị trí hiện tại.");
        }
      } finally {
        isFetchingRef.current = false;
        setLoading(false);

        if (manual) {
          setRefreshing(false);
        }
      }
    },
    [deviceId]
  );

  useEffect(() => {
    if (!deviceId) {
      setLocation(null);
      setDevice(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    // Lấy ngay khi vào trang hoặc đổi thiết bị
    fetchLocation();

    // Tự động cập nhật mỗi 3 giây
    const intervalId = setInterval(() => {
      fetchLocation();
    }, 3000);

    return () => {
      clearInterval(intervalId);

      if (controllerRef.current) {
        controllerRef.current.abort();
      }

      isFetchingRef.current = false;
    };
  }, [deviceId, fetchLocation]);

  const refreshLocation = useCallback(() => {
    fetchLocation(true);
  }, [fetchLocation]);

  return {
    location,
    device,
    loading,
    refreshing,
    error,
    lastUpdated,
    refreshLocation,
  };
}

export default useLocation;