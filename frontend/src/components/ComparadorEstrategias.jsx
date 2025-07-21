import { useEffect, useState } from "react";

export default function ComparadorEstrategias({ zona, tipo_via, distancia_km }) {
  const [tradicional, setTradicional] = useState(null);
  const [inteligente, setInteligente] = useState(null);

  useEffect(() => {
    async function comparar() {
      const payload = { zona, tipo_via, distancia_km };

      const resTrad = await fetch("http://localhost:8000/asignar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const datosTrad = await resTrad.json();
      setTradicional(datosTrad);

      const resIA = await fetch("http://localhost:8000/asignar-ia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const datosIA = await resIA.json();
      setInteligente(datosIA);
    }

    comparar();
  }, [zona, tipo_via, distancia_km]);

  const tarjetaEstilo = {
    background: "#f9f9f9",
    borderRadius: "8px",
    padding: "1rem",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
    flex: "1",
    minWidth: "250px"
  };

  return (
    <div style={{ marginTop: "2rem" }}>
      <h2>🧠 Comparador de Estrategias</h2>
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
        {tradicional && (
          <div style={tarjetaEstilo}>
            <h3>📐 Tradicional</h3>
            <p><strong>Ambulancia:</strong> {tradicional.ambulancia}</p>
            <p><strong>ETA:</strong> {tradicional.eta_minutos} min</p>
            <p><strong>Centro:</strong> {tradicional.centro || "N/A"}</p>
            <p><strong>Justificación:</strong> ETA más baja + disponibilidad</p>
          </div>
        )}
        {inteligente && (
          <div style={tarjetaEstilo}>
            <h3>🤖 Inteligente (IA)</h3>
            <p><strong>Ambulancia:</strong> {inteligente.ambulancia}</p>
            <p><strong>ETA:</strong> {inteligente.eta_minutos} min</p>
            <p><strong>Centro:</strong> {inteligente.centro}</p>
            <p><strong>Justificación:</strong> {inteligente.justificacion}</p>
          </div>
        )}
      </div>
    </div>
  );
}
