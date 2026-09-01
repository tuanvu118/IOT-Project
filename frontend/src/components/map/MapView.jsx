import { useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  useMap,
} from "react-leaflet";

import VehicleMarker from "./VehicleMarker";

import "leaflet/dist/leaflet.css";

const DEFAULT_POSITION = [21.0285, 105.8542];

function InitialMapCenter({ latitude, longitude }) {
  const map = useMap();
  const hasCenteredRef = useRef(false);

  useEffect(() => {
    if (hasCenteredRef.current) return;

    if (
      typeof latitude !== "number" ||
      typeof longitude !== "number"
    ) {
      return;
    }

    map.setView([latitude, longitude], 16);
    hasCenteredRef.current = true;
  }, [latitude, longitude, map]);

  return null;
}

function MapView({
  latitude,
  longitude,
  device,
}) {
  return (
    <MapContainer
      center={DEFAULT_POSITION}
      zoom={13}
      scrollWheelZoom={true}
      style={{
        width: "100%",
        height: "100%",
        minHeight: "340px",
        borderRadius: "16px",
      }}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <InitialMapCenter
        latitude={latitude}
        longitude={longitude}
      />

      <VehicleMarker
        latitude={latitude}
        longitude={longitude}
        device={device}
      />
    </MapContainer>
  );
}

export default MapView;