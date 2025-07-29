import React, { useState } from "react";

const ciudadesArgentinas = {
  "Buenos Aires": [-34.6037, -58.3816],
  "Córdoba": [-31.4201, -64.1888],
  "Rosario": [-32.9442, -60.6505],
  "Mendoza": [-32.8895, -68.8458],
  "San Miguel de Tucumán": [-26.8083, -65.2176],
  "Salta": [-24.7821, -65.4232],
  "Santa Fe": [-31.6333, -60.7000],
  "Mar del Plata": [-38.0055, -57.5426],
  "La Plata": [-34.9214, -57.9545],
  "San Juan": [-31.5375, -68.5364],
  "Resistencia": [-27.4517, -58.9867],
  "Neuquén": [-38.9516, -68.0591],
  "Posadas": [-27.3671, -55.8961],
  "San Salvador de Jujuy": [-24.1858, -65.2995],
  "Bahía Blanca": [-38.7183, -62.2663],
  "Paraná": [-31.7311, -60.5238],
  "Formosa": [-26.1775, -58.1781],
  "San Luis": [-33.2950, -66.3356],
  "Catamarca": [-28.4686, -65.7795],
  "La Rioja": [-29.4131, -66.8570],
  "Rio Gallegos": [-51.6333, -69.2167],
  "Ushuaia": [-54.8019, -68.3030],
  "Río Grande": [-53.7877, -67.7099],
  "Viedma": [-40.8135, -62.9967]
};

export default function SimuladorForm() {
  const [zonaSeleccionada, setZonaSeleccionada] = useState("");
  const [ciudadSeleccionada, setCiudadSeleccionada] = useState("");
  const [direccion, setDireccion] = useState("");

  const manejarBusqueda = () => {
    if (!ciudadSeleccionada || !direccion) return;
    // Lógica de búsqueda geográfica basada en ciudad + dirección
    console.log("Buscando:", ciudadSeleccionada, direccion);
  };

  return (
    <form>
      {/* 🟩 Selector de zona de CABA */}
      <label>Asignar ambulancia a zona de CABA</label>
      <select
        value={zonaSeleccionada}
        onChange={(e) => setZonaSeleccionada(e.target.value)}
        required
      >
        <option value="">-- Seleccionar zona --</option>
        <option value="Palermo">Palermo</option>
        <option value="Belgrano">Belgrano</option>
        <option value="Recoleta">Recoleta</option>
        <option value="Caballito">Caballito</option>
        <option value="Barracas">Barracas</option>
      </select>

      {/* 🔷 Selector de ciudad argentina */}
      <label>Buscar ubicación en ciudad</label>
      <select
        value={ciudadSeleccionada}
        onChange={(e) => setCiudadSeleccionada(e.target.value)}
      >
        <option value="">-- Seleccionar ciudad --</option>
        {Object.keys(ciudadesArgentinas).map((nombre, i) => (
          <option key={i} value={nombre}>{nombre}</option>
        ))}
      </select>

      {/* 📍 Dirección */}
      <input
        type="text"
        placeholder="Ingresar dirección"
        value={direccion}
        onChange={(e) => setDireccion(e.target.value)}
      />

      {/* 🔘 Botón de búsqueda */}
      <button type="button" onClick={manejarBusqueda}>
        Buscar ubicación
      </button>
    </form>
  );
}
