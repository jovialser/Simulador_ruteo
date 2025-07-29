import { useState } from 'react';
import MetricasEficiencia from './MetricasEficiencia.jsx';
import ComparadorEstrategias from './ComparadorEstrategias.jsx';

export default function SimuladorForm({ onCoordenadasSeleccionadas }) {
  const [resultado, setResultado] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [direccion, setDireccion] = useState("");
  const [ubicacion, setUbicacion] = useState(null);

  const coordenadasZona = {
    "Buenos Aires": [-34.6037, -58.3816],
    "Córdoba": [-31.4201, -64.1888],
    "Rosario": [-32.9442, -60.6505],
    "Mar del Plata": [-38.0055, -57.5426],
    "San Miguel de Tucumán": [-26.8241, -65.2226],
    "Salta": [-24.7821, -65.4232],
    "Santa Fe": [-31.623, -60.695],
    "Corrientes": [-27.4697, -58.8306],
    "Bahía Blanca": [-38.7183, -62.2676],
    "Resistencia": [-27.4516, -58.986],
    "Posadas": [-27.3671, -55.8961],
    "Merlo": [-34.6645, -58.7277],
    "Quilmes": [-34.729, -58.267],
    "San Salvador de Jujuy": [-24.1946, -65.2971],
    "Guaymallén": [-32.8834, -68.8387],
    "Santiago del Estero": [-27.7951, -64.2615],
    "Paraná": [-31.7433, -60.5176],
    "Neuquén": [-38.9517, -68.0591],
    "Formosa": [-26.1852, -58.1765],
    "Lanús": [-34.7076, -58.3915],
    "La Plata": [-34.9214, -57.954],
    "Godoy Cruz": [-32.9167, -68.8333],
    "La Rioja": [-29.4131, -66.8558],
    "Comodoro Rivadavia": [-45.8648, -67.4825]
  };

  function determinarCentro(ciudad) {
    const regiones = {
      norte: ["Salta", "San Miguel de Tucumán", "San Salvador de Jujuy", "Santiago del Estero", "Formosa"],
      centro: ["Buenos Aires", "Córdoba", "Rosario", "Santa Fe", "Paraná", "La Plata", "Merlo", "Quilmes", "Lanús"],
      cuyo: ["Mendoza", "Guaymallén", "Godoy Cruz", "La Rioja"],
      sur: ["Bahía Blanca", "Neuquén", "Comodoro Rivadavia", "Mar del Plata"],
      litoral: ["Corrientes", "Resistencia", "Posadas"]
    };

    for (const [region, ciudades] of Object.entries(regiones)) {
      if (ciudades.includes(ciudad)) return region;
    }
    return "desconocido";
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
    const origenCoords = coordenadasZona[centro] || [0, 0]; // coordenadas genéricas si no se encuentra
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
        <label>Ciudad:
          <select name="zona" required>
            <option value="">-- Seleccionar ciudad --</option>
            {Object.keys(coordenadasZona).map((ciudad, i) => (
              <option key={i} value={ciudad}>{ciudad}</option>
            ))}
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

