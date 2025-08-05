import { useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { getRutaConMetricas } from "../servicios/ruteo.js";

export default function MapaEmergencias({ origen, destino }) {
  useEffect(() => {
    console.log("🗺️ MapaEmergencias recibió origen y destino:", origen, destino);

    // Validación básica
    if (!origen?.lat || !origen?.lng || !destino?.lat || !destino?.lng) {
      console.warn("❌ Coordenadas inválidas.");
      return;
    }

    const origenCoords = [origen.lat, origen.lng];
    const destinoCoords = [destino.lat, destino.lng];

    // Limpieza del mapa anterior si existe
    const container = L.DomUtil.get("mapa");
    if (container && container._leaflet_id) {
      container.remove();
      const nuevoDiv = document.createElement("div");
      nuevoDiv.setAttribute("id", "mapa");
      nuevoDiv.setAttribute("style", "width: 100%; height: 100%");
      document.querySelector("#mapa-wrapper").appendChild(nuevoDiv);
    }

    // Inicializar mapa
    const map = L.map("mapa").setView(origenCoords, 13);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

    // Marcadores
    L.marker(origenCoords).addTo(map).bindPopup("🚑 Centro").openPopup();
    L.marker(destinoCoords).addTo(map).bindPopup("⚠️ Emergencia");

    // Trazar ruta
    async function trazarRuta() {
      try {
        const { ruta, distancia, duracion } = await getRutaConMetricas(origen, destino);

        if (!ruta || ruta.length === 0) {
          console.warn("⚠️ Ruta vacía o no encontrada.");
          return;
        }

        L.polyline(ruta, { color: "blue", weight: 4 }).addTo(map);

        console.log(
          `🛣️ Distancia: ${distancia.toFixed(0)} m | 🕓 Duración: ${(duracion / 60).toFixed(1)} min`
        );
      } catch (error) {
        console.error("❌ Error al obtener ruta:", error.message);
      }
    }

    trazarRuta();
  }, [origen, destino]);

  return (
    <div style={{ width: "100%", height: "400px", marginTop: "1rem" }} id="mapa-wrapper">
      <h3>🗺️ Mapa Emergencias</h3>
      <div id="mapa" style={{ width: "100%", height: "100%" }}></div>
    </div>
  );
}
