import { useState } from 'react';
import MetricasEficiencia from './MetricasEficiencia.jsx';
import ComparadorEstrategias from './ComparadorEstrategias.jsx';

export default function SimuladorForm({ onCoordenadasSeleccionadas }) {
  const [resultado, setResultado] = useState(null);
  const [historial, setHistorial] = useState([]);

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

  const enviar = async (e) => {
    e.preventDefault();
    console.log("🚨 Simulación iniciada");

    const zona = e.target.zona.value;
    const tipo_via = e.target.tipo_via.value;
    const distancia_km = parseFloat(e.target.distancia_km.value);

    let datos;
    try {
      const res = await fetch("https://simulador-ruteo.onrender.com", {
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

        <label>Distancia (km): <input type="number" step="0.1" name="distancia_km" required /></label><br />
        <button type="submit">Asignar Ambulancia</button>
      </form>

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

      <MetricasEficiencia historial={historial} />
    </div>
  );
}


