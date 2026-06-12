"use client";

import { useEffect } from "react";
import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";

const iconFix = () => {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png"
  });
};

const driverIcon = () => new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const hotspots = [
  { label: "Main Gate", position: [29.8649, 77.8958], type: "Pickup hotspot" },
  { label: "Lecture Hall Complex", position: [29.8682, 77.8947], type: "Active destination" },
  { label: "Student Activity Centre", position: [29.8668, 77.8992], type: "Driver cluster" }
];

export default function CampusMap({ drivers = [] }) {
  useEffect(() => {
    iconFix();
  }, []);

  return (
    <div style={{ height: 320, overflow: "hidden", borderRadius: 8, border: "1px solid var(--line)" }}>
      <MapContainer center={[29.8666, 77.8968]} zoom={15} scrollWheelZoom={false} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {hotspots.map((point) => (
          <Marker key={point.label} position={point.position}>
            <Popup>
              <strong>{point.label}</strong><br />{point.type}
            </Popup>
          </Marker>
        ))}
        {drivers.filter((d) => d.latitude && d.longitude).map((driver) => (
          <Marker key={driver.id} position={[driver.latitude, driver.longitude]} icon={driverIcon()}>
            <Popup>
              <strong>🚗 {driver.user?.name || "Driver"}</strong><br />
              {driver.vehicleNumber}<br />
              {driver.currentLocation}<br />
              ⭐ {driver.averageRating || 0}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
