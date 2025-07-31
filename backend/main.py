import { useState } from 'react';
import MetricasEficiencia from './MetricasEficiencia.jsx';
import ComparadorEstrategias from './ComparadorEstrategias.jsx';

export default function SimuladorForm({ onCoordenadasSeleccionadas }) {
  const [resultado, setResultado] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [ciudad, setCiudad] = useState("");

  // --- Estados para la primera dirección (Origen) ---
  const [direccion, setDireccion] = useState("");
  const [ubicacion, setUbicacion] = useState(null);

  // --- NUEVO: Estados para la segunda dirección (Destino) ---
  const [direccionDestino, setDireccionDestino] = useState("");
  const [ubicacionDestino, setUbicacionDestino] = useState(null);


  const ciudadesArgentinas = [
    "Buenos Aires", "Córdoba", "Rosario", "Mendoza", "La Plata"
  ];

  const coordenadasZona = {
    Palermo: [-34.578, -58.429],
    Belgrano: [-34.563, -58.460],
    Recoleta: [-34.587, -58.392],
    Caballito: [-34.618, -58.441],
    Barracas: [-34.630, -58.373],
  };

  // --- Función genérica para geocodificar ---
  const geocodificar = async (direccionCompleta) => {
    try {
      const res = await fetch("https://simulador-ruteo.onrender.com/geocodificar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ direccion: direccionCompleta })
      });
      return await res.json();
    } catch (err) {
      console.error("⚠️ Error al buscar ubicación:", err);
      alert("Hubo un problema al conectarse con el backend.");
      return null;
    }
  };

  // --- Función para buscar la ubicación de ORIGEN ---
  const buscarUbicacionOrigen = async () => {
    if (!direccion.trim() || !ciudad.trim()) {
      alert("Ingresá una ciudad y una dirección de origen completa");
      return;
    }
    const direccionCompleta = `${direccion}, ${ciudad}, Argentina`;
    const data = await geocodificar(direccionCompleta);

    if (data && data.lat && data.lng) {
      const nuevasCoords = { lat: parseFloat(data.lat), lng: parseFloat(data.lng) };
      setUbicacion(nuevasCoords);
      alert(`📍 Origen encontrado: ${data.lat}, ${data.lng}`);
      
      // MODIFICADO: Notificar al mapa con ambas coordenadas
      if (onCoordenadasSeleccionadas) {
        const destinoCoords = ubicacionDestino ? [ubicacionDestino.lat, ubicacionDestino.lng] : null;
        onCoordenadasSeleccionadas({ origen: [nuevasCoords.lat, nuevasCoords.lng], destino: destinoCoords });
      }
    } else {
      alert("❌ Dirección de origen no encontrada.");
    }
  };

  // --- NUEVO: Función para buscar la ubicación de DESTINO ---
  const buscarUbicacionDestino = async () => {
    if (!direccionDestino.trim() || !ciudad.trim()) {
      alert("Ingresá una ciudad y una dirección de destino completa");
      return;
    }
    const direccionCompleta = `${direccionDestino}, ${ciudad}, Argentina`;
    const data = await geocodificar(direccionCompleta);

    if (data && data.lat && data.lng) {
      const nuevasCoords = { lat: parseFloat(data.lat), lng: parseFloat(data.lng) };
      setUbicacionDestino(nuevasCoords);
      alert(`📍 Destino encontrado: ${data.lat}, ${data.lng}`);

      // MODIFICADO: Notificar al mapa con ambas coordenadas
      if (onCoordenadasSeleccionadas) {
        const origenCoords = ubicacion ? [ubicacion.lat, ubicacion.lng] : null;
        onCoordenadasSeleccionadas({ origen: origenCoords, destino: [nuevasCoords.lat, nuevasCoords.lng] });
      }
    } else {
      alert("❌ Dirección de destino no encontrada.");
    }
  };


  // --- El resto de tus funciones (enviar, etc.) permanecen igual ---
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
      {/* Selector de ciudad compartido */}
      <div style={{ marginBottom: "1rem", padding: "1rem", background: "#f0f8ff", borderRadius: "8px" }}>
        <label>
          <h3>🌎 Ciudad (para ambas direcciones)</h3>
          <select value={ciudad} onChange={(e) => setCiudad(e.target.value)}>
            <option value="">-- Seleccionar ciudad --</option>
            {ciudadesArgentinas.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>
      </div>

      {/* 🔍 Buscador de dirección de ORIGEN */}
      <div style={{ marginBottom: "1rem", padding: "1rem", background: "#f0f8ff", borderRadius: "8px" }}>
        <h3>📌 Buscar ubicación de Origen</h3>
        <label>📍 Dirección de Origen:
          <input
            type="text"
            placeholder="Ej: Av. Rivadavia 1234"
            value={direccion}
            onChange={(e) => setDireccion(e.target.value)}
            style={{ margin: "0.5rem 0" }}
          />
        </label>
        <br />
        <button onClick={buscarUbicacionOrigen}>Buscar Origen</button>
        {ubicacion && (
          <p>🧭 Coordenadas Origen: <strong>{ubicacion.lat}, {ubicacion.lng}</strong></p>
        )}
      </div>

      {/* NUEVO: Buscador de dirección de DESTINO */}
      <div style={{ marginBottom: "1rem", padding: "1rem", background: "#f0f8ff", borderRadius: "8px" }}>
        <h3>🏁 Buscar ubicación de Destino</h3>
        <label>📍 Dirección de Destino:
          <input
            type="text"
            placeholder="Ej: Hospital Italiano"
            value={direccionDestino}
            onChange={(e) => setDireccionDestino(e.target.value)}
            style={{ margin: "0.5rem 0" }}
          />
        </label>
        <br />
        <button onClick={buscarUbicacionDestino}>Buscar Destino</button>
        {ubicacionDestino && (
          <p>🧭 Coordenadas Destino: <strong>{ubicacionDestino.lat}, {ubicacionDestino.lng}</strong></p>
        )}
      </div>


      {/* 🧪 Formulario de simulación (sin cambios) */}
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

      {/* 🎯 Resultado (sin cambios) */}
      {resultado && (
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
      )}

      {/* 📊 Métricas (sin cambios) */}
      <MetricasEficiencia historial={historial} />
    </div>
  );
}
