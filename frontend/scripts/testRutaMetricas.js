import { getRutaConMetricas } from "../src/servicios/ruteo.js";

const origen = [-34.56, -58.42];
const destino = [-34.587, -58.392];

getRutaConMetricas(origen, destino)
  .then(({ ruta, distancia, duracion }) => {
    console.log("✅ Ruta decodificada:", ruta);
    console.log(`🛣️ Distancia: ${(distancia / 1000).toFixed(2)} km`);
    console.log(`🕓 Duración: ${(duracion / 60).toFixed(1)} min`);
  })
  .catch((err) => {
    console.error("❌ Error al obtener la ruta con métricas:", err.message);
  });
