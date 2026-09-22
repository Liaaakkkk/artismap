import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";

import L from "leaflet";

import "leaflet/dist/leaflet.css";

import categoryConfig from "../utils/categoryConfig";

function createCategoryIcon(category) {
  const config = categoryConfig[category];

  return L.divIcon({
    className: "custom-marker-wrapper",
    html: `
      <div class="custom-marker">
        <span>${config?.icon || "📍"}</span>
      </div>
    `,
    iconSize: [44, 44],
    iconAnchor: [22, 44],
    popupAnchor: [0, -44],
  });
}

function MapCenter({ userLocation }) {
  const map = useMap();

  if (userLocation) {
    map.setView(userLocation, 15);
  }

  return null;
}

function MapView({ points, userLocation }) {
  const initialPosition = [-3.73186, -38.52667];

  return (
    <div className="map-container">
      <MapContainer
        center={initialPosition}
        zoom={13}
        scrollWheelZoom={true}
        className="map"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {userLocation && <MapCenter userLocation={userLocation} />}

        {points.map((point) => (
          <Marker
            key={point.id}
            position={[point.latitude, point.longitude]}
            icon={createCategoryIcon(point.category)}
            title={point.name}
          >
            <Popup>
              <div className="popup-content">
                <div className="popup-category">
                  {categoryConfig[point.category]?.icon}{" "}
                  {categoryConfig[point.category]?.label}
                </div>

                <h3>{point.name}</h3>

                <p>{point.description}</p>

                <div className="popup-info">
                  <strong>📍 Endereço</strong>
                  <span>
                    {point.address}, {point.city}
                  </span>
                </div>

                {point.date && (
                  <div className="popup-info">
                    <strong>📅 Data</strong>
                    <span>{point.date}</span>
                  </div>
                )}

                {point.time && (
                  <div className="popup-info">
                    <strong>🕐 Horário</strong>
                    <span>{point.time}</span>
                  </div>
                )}

                <div className="popup-info">
                  <strong>💰 Entrada</strong>
                  <span>{point.price}</span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

export default MapView;