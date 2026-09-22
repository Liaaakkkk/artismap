import { useState } from "react";

function UserLocationButton({
  onLocationFound,
}) {
  function handleLocation() {
    if (!navigator.geolocation) {
      alert(
        "Seu navegador não suporta localização."
      );
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };

        onLocationFound(location);
      },
      () => {
        alert(
          "Não foi possível obter sua localização."
        );
      }
    );
  }

  return (
    <button
      type="button"
      className="location-button"
      onClick={handleLocation}
      aria-label="Mostrar minha localização"
      title="Minha localização"
    >
      📍
    </button>
  );
}

export default UserLocationButton;