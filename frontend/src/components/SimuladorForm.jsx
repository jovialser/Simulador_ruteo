import { useState } from 'react';
import MetricasEficiencia from './MetricasEficiencia.jsx';
import ComparadorEstrategias from './ComparadorEstrategias.jsx';

export default function SimuladorForm({ onCoordenadasSeleccionadas }) {
  const [resultado, setResultado] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [direccion, setDireccion] = useState("");
  const [ubicacion, setUbicacion] = useState(null);
  
const ciudadesArgentinas = {
  "Buenos Aires": "Av. Rivadavia 1234, Buenos Aires",
  "Córdoba": "Av. Colón 350, Córdoba",
  "Rosario": "Calle San Luis 123, Rosario",
  "Mendoza": "Av. San Martín 750, Mendoza",
  "La Plata": "Calle 12 456, La Plata"
};
  
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

  const buscarUbicacion = async () => {
    if (!direccion) return alert("Ingresá una dirección");

    try {
      const res = await fetch("https://simulador-ruteo.onrender.com/geocodificar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ direccion })
      });

      const data = await res.json();

      if (data.lat && data.lng) {
        setUbicacion({ lat: parseFloat(data.lat), lng: parseFloat(data.lng) });
        alert(`📍 Ubicación encontrada: ${data.lat}, ${data.lng}`);
        console.log("📌 Coordenadas:", data.lat, data.lng);

        if (onCoordenadasSeleccionadas) {
          onCoordenadasSeleccionadas({ origen: [data.lat, data.lng], destino: null });
        }
      } else {
        alert("❌ Dirección no encontrada.");
      }
    } catch (err) {
      console.error("⚠️ Error al buscar ubicación:", err);
      alert("Hubo un problema al conectarse con el backend.");
    }
  };

  const enviar = async (e) => {
    e.preventDefault();
    console.log("🚨 Simulación iniciada");

    const zona = e.target.zona.value;
    const tipo_via = e.target.tipo_via.value;
    const distancia_km = parseFloat(e.target.distancia_km.value);

    let datos;
    try {
      const res = await fetch("https://simulador-ruteo.onrender.com/asignar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ zona, tipo_via, distancia_km }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      datos = await res.json();
      console.log("✅ Respuesta recibida:", datos);
      setResultado(datos);
    } catch (err) {
      console.error("❌ Error en fetch:", err.message);
      setResultado(null);
      return;
    }

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
      excedido: false
    };

    setHistorial(prev => [...prev, simulacion]);
  };

 return (
    <div>
      {/* 🔍 Buscador de dirección */}
      <div style={{ marginBottom: "1rem", padding: "1rem", background: "#f0f8ff", borderRadius: "8px" }}>
        <h3>📌 Buscar ubicación manual</h3>

        {/* 🌎 Selector de ciudades argentinas */}
        <label style={{ display: "block", marginBottom: "0.5rem" }}>
          🌎 Ciudad rápida:
          <select onChange={(e) => setDireccion(ciudadesArgentinas[e.target.value])}>
            <option value="">-- Seleccionar ciudad --</option>
            {Object.keys(ciudadesArgentinas).map(ciudad => (
              <option key={ciudad} value={ciudad}>{ciudad}</option>
            ))}
          </select>
        </label>

        {/* Campo de dirección */}
        <input
          type="text"
          placeholder="Ej: Av. Rivadavia 1234"
          value={direccion}
          onChange={(e) => setDireccion(e.target.value)}
          style={{ marginRight: "0.5rem" }}
        />
        <button onClick={buscarUbicacion}>Buscar ubicación</button>

        {ubicacion && (
          <p>🧭 Coordenadas: <strong>{ubicacion.lat}, {ubicacion.lng}</strong></p>
        )}
      </div>

      {/* 🧪 Formulario de simulación */}
      <form onSubmit={enviar}>
        <label>Zona:
          <select name="zona" required>
            <option value="">-- Seleccionar zona --</option>
            <option value="Palermo">Palermo</option>
            <option value="Belgrano">Belgrano</option>
            <option value="Recoleta">Recoleta</option>
            <option value="Caballito">Caballito</option>
            <option value="Barracas">Barracas</option>
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

      {/* 🎯 Resultado */}
      {resultado ? (
        <>
          <div style={{ marginTop: "1rem", background: "#e3ffe3", padding: "1rem", borderRadius: "8px" }}>
            <h2>🟢 Resultado (Tradicional)</h2>
            <p>Ambulancia: <strong>{resultado.ambulancia}</strong></p>
            <p>ETA: <strong>{resultado.eta_minutos} minutos</strong></p>
            <p>Zona: {resultado.zona}</p>
            <p>Tipo de vía: {resultado.tipo_via}</p>
          </div>

          <ComparadorEstrategias
            zona={resultado.zona}
            tipo_via={resultado.tipo_via}
            distancia_km={parseFloat(resultado.eta_minutos) / (resultado.tipo_via === "avenida" ? 1.0 : 1.5)}
          />
        </>
      ) : null}

      {/* 📊 Métricas */}
      <MetricasEficiencia historial={historial} />
    </div>
);

}
