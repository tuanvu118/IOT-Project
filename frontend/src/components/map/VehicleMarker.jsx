import { Marker, Popup } from "react-leaflet";
import L from "leaflet";

const vehicleIcon = L.divIcon({
  className: "",
  html: `
    <div
      style="
        width: 34px;
        height: 34px;
        border-radius: 50%;
        background: #2563eb;
        border: 4px solid white;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 16px;
        font-weight: bold;
      "
    >
      ●
    </div>
  `,
  iconSize: [34, 34],
  iconAnchor: [17, 17],
  popupAnchor: [0, -20],
});

function VehicleMarker({
  latitude,
  longitude,
  device,
}) {
  const hasValidLocation =
    typeof latitude === "number" &&
    typeof longitude === "number";

  if (!hasValidLocation) {
    return null;
  }

  const vehicleName = [
    device?.vehicle?.brand,
    device?.vehicle?.model,
  ]
    .filter(Boolean)
    .join(" ");

  const licensePlate =
    device?.vehicle?.license_plate || "--";

  return (
    <Marker
      position={[latitude, longitude]}
      icon={vehicleIcon}
    >
      <Popup>
        <div>
          <strong>
            {vehicleName || "Phương tiện"}
          </strong>

          <br />

          Biển số: {licensePlate}

          <br />

          Vĩ độ: {latitude}

          <br />

          Kinh độ: {longitude}
        </div>
      </Popup>
    </Marker>
  );
}

export default VehicleMarker;