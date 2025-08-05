import { useState } from 'react';
import MetricasEficiencia from './MetricasEficiencia.jsx';
import ComparadorEstrategias from './ComparadorEstrategias.jsx';

export default function SimuladorForm({ onCoordenadasSeleccionadas }) {
  const [resultado, setResultado] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [ciudad, setCiudad] = useState("");
  const [direccion, setDireccion] = useState("");
  const [ubicacion, setUbicacion] = useState(null);
  const [direccionDestino, setDireccionDestino] = useState("");
  const [ubicacionDestino, setUbicacionDestino] = useState(null);
  const [coordenadasRuta, setCoordenadasRuta] = useState({ origen: null, destino: null });

  const ciudadesArgentinas = [
    "Ciudad de Buenos Aires", "Córdoba", "Rosario", "Mendoza", "La Plata"
  ];

  const coordenadasZona = {
    Palermo: [-34.578, -58.429],
    Belgrano: [-34.563, -58.460],
    Recoleta: [-34.587, -58.392],
    Caballito: [-34.618, -58.441],
    Barracas: [-34.630, -58.373],
  };

  const coordenadasCentro = {
    "Centro Norte": [-34.560, -58.420],
    "Centro Este": [-34.580, -58.425],
    "Centro Sur": [-34.640, -58.400],
  };

  function determinarCentro(zona) {
    if (["Palermo", "Recoleta"].includes(zona)) return "Centro Norte";
    if (["Belgrano", "Caballito"].includes(zona)) return "Centro Este";
    return "Centro Sur";
  }

  const geocodificarDireccion = async (direccionTexto, tipo) => {
    if (!direccionTexto.trim() || !ciudad.trim()) {
      alert(`Ingresá una ciudad y una dirección ${tipo === "destino" ? "de destino" : ""}`);
      return;
    }

    const direccionCompleta = `${direccionTexto}, ${ciudad}, Argentina`;
    console.log(`📨 Enviando dirección ${tipo}:`, direccionCompleta);

    try {
      const res = await fetch("https://simulador-ruteo.onrender.com/geocodificar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ direccion: direccionCompleta, ciudad }),
      });

      const data = await res.json();
      if (data.lat && data.lng) {
        const coords = { lat: parseFloat(data.lat), lng: parseFloat(data.lng) };

        if (tipo === "destino") {
          setUbicacionDestino(coords);
          setCoordenadasRuta(prev => {
            const nuevas = { ...prev, destino: coords };
            if (nuevas.origen && onCoordenadasSeleccionadas) {
              onCoordenadasSeleccionadas(nuevas);
            }
            return nuevas;
          });
        } else {
          setUbicacion(coords);
          setCoordenadasRuta(prev => {
            const nuevas = { ...prev, origen: coords };
            if (nuevas.destino && onCoordenadasSeleccionadas) {
              onCoordenadasSeleccionadas(nuevas);
            }
            return nuevas;
          });
        }

        alert(`📍 Ubicación ${tipo} encontrada: ${data.lat}, ${data.lng}`);
        console.log(`📌 Coordenadas ${tipo}:`, data.lat, data.lng);
      } else {
        alert(`❌ Dirección ${tipo} no encontrada.`);
      }
    } catch (err) {
      console.error(`⚠️ Error al buscar ubicación ${tipo}:`, err);
      alert("Hubo un problema al conectarse con el backend.");
    }
  };

  const enviar = async (e) => {
    e.preventDefault();
    console.log("🚨 Simulación iniciada");

    const zona = e.target.zona.value;
    const tipo_via = e.target.tipo_via.value;
    const distancia_km = parseFloat(e.target.distancia_km.value);

    if (isNaN(distancia_km) || distancia_km <= 0) {
      alert("La distancia debe ser un número positivo.");
      return;
    }

    try {
      const res = await fetch("https://simulador-ruteo.onrender.com/asignar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ zona, tipo_via, distancia_km }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const datos = await res.json();
      console.log("✅ Respuesta recibida:", datos);
      setResultado(datos);

      const centro = determinarCentro(zona);
      const origenCoords = coordenadasCentro[centro];
      const destinoCoords = coordenadasZona[zona];

      if (onCoordenadasSeleccionadas) {
        console.log("🛰️ Emitiendo coordenadas:", origenCoords, destinoCoords);
        onCoordenadasSeleccionadas({ origen: origenCoords, destino: destinoCoords });
      }

      const simulacion = {
        id: datos.ambulancia,
        zona: datos.zona,
        tipo_via: datos.tipo_via,
        eta_minutos: datos.eta_minutos,
        centro: determinarCentro(datos.zona),
        excedido: false,
        timestamp: new Date().toISOString()
      };

      setHistorial(prev => [...prev, simulacion]);
      setDireccion("");
      setDireccionDestino("");
      setUbicacion(null);
      setUbicacionDestino(null);
      setCoordenadasRuta({ origen: null, destino: null });
    } catch (err) {
      console.error("❌ Error en fetch:", err.message);
      setResultado(null);
    }
  };

  return (
    <div>
      {/* 🔍 Buscador de dirección */}
      <div style={{ marginBottom: "1rem", padding: "1rem", background: "#f0f8ff", borderRadius: "8px" }}>
        <h3>📌 Buscar ubicación manual</h3>

        <label>🌎 Ciudad:
          <select value={ciudad} onChange={(e) => setCiudad(e.target.value)}>
            <option value="">-- Seleccionar ciudad --</option>
            {ciudadesArgentinas.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label><br />

        <label>📍 Dirección:
          <input
            type="text"
            placeholder="Ej: Av. Rivadavia 1234"
            value={direccion}
            onChange={(e) => setDireccion(e.target.value)}
            style={{ margin: "0.5rem 0" }}
          />
        </label><br />
        <button onClick={() => geocodificarDireccion(direccion, "origen")}>Buscar ubicación</button>

        {ubicacion && (
          <p>🧭 Coordenadas: <strong>{ubicacion.lat}, {ubicacion.lng}</strong></p>
        )}

        <label>📍 Dirección destino:
          <input
            type="text"
            placeholder="Ej: Av. Santa Fe 4321"
            value={direccionDestino}
            onChange={(e) => setDireccionDestino(e.target.value)}
            style={{ margin: "0.5rem 0" }}
          />
        </label><br />
        <button onClick={() => geocodificarDireccion(direccionDestino, "destino")}>Buscar dirección destino</button>

        {ubicacionDestino && (
          <p>🎯 Coordenadas destino: <strong>{ubicacionDestino.lat}, {ubicacionDestino.lng}</strong></p>
        )}
      </div>

      {/* 🧪 Formulario de simulación */}
      <form onSubmit={enviar}>
        <label>Zona:
          <select name="zona" required>
            <option value="">-- Seleccionar zona --</option>
            {Object.keys(coordenadasZona).map((zona) => (
              <option key={zona} value={zona}>{zona}</option>
            ))}
          </select>
        </label><br />

        <label>Tipo de vía:
          <select name="tipo_via">
            <option value="avenida">Avenida</option>
            <option value="calle">Calle</option>
          </select>
        </label><br />

        <label>Distancia (km):
          <input type="number" step="0.1" name="distancia_km" required />
        </label><br />
        <button type="submit">Asignar Ambulancia</button>
      </form>
            </form>
    </div> {/* ← Este cierre faltaba */}
  );
}


     


