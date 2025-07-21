import { useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { getRutaConMetricas } from "../servicios/ruteo.js";

export default function DebugRuta({ origen, destino }) {
  useEffect(() => {
    if (!origen || !destino) return;

    if (L.DomUtil.get("mapa-debug")?._leaflet_id) {
      L.DomUtil.get("mapa-debug").innerHTML = "";
    }

    const map = L.map("mapa-debug").setView(origen, 13);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors"
    }).addTo(map);

    L.marker(origen).addTo(map).bindPopup("🚑 Centro logístico");
    L.marker(destino).addTo(map).bindPopup("⚠️ Emergencia");

    async function trazar() {
      try {
        const { ruta, distancia, duracion } = await getRutaConMetricas(origen, destino);

        L.polyline(ruta, { color: "blue", weight: 4 }).addTo(map);

        console.log(`🛣️ Distancia: ${(distancia / 1000).toFixed(2)} km`);
        console.log(`🕓 Duración: ${(duracion / 60).toFixed(1)} min`);
      } catch (err) {
        console.error("❌ Error ORS:", err.message);
      }
    }

    trazar();
  }, [origen, destino]);

  return (
    <div style={{ marginTop: "1rem", height: "300px", border: "2px dashed #ccc", borderRadius: "8px" }}>
      <h3>🔍 Debug Ruta ORS</h3>
      <div id="mapa-debug" style={{ width: "100%", height: "100%" }}></div>
    </div>
  );
}
