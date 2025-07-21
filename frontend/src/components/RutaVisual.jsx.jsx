import { useState } from "react";
import SimuladorForm from "./SimuladorForm.jsx";
import MapaEmergencias from "./MapaEmergencias.jsx";

export default function RutaVisual() {
  const [origen, setOrigen] = useState(null);
  const [destino, setDestino] = useState(null);

  function actualizar({ origen, destino }) {
    setOrigen(origen);
    setDestino(destino);
  }

  return (
    <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start", flexWrap: "wrap" }}>
      <div style={{ flex: 1, minWidth: "300px" }}>
        <SimuladorForm onCoordenadasSeleccionadas={actualizar} />
      </div>
      <div style={{ flex: 1, minWidth: "300px" }}>
        {origen && destino && (
          <MapaEmergencias origen={origen} destino={destino} />
        )}
      </div>
    </div>
  );
}
