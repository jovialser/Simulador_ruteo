import { useState, useEffect } from "react";

export default function MetricasEficiencia({ historial }) {
  const [simulaciones, setSimulaciones] = useState(0);
  const [etaPromedio, setEtaPromedio] = useState(0);
  const [centros, setCentros] = useState({});
  const [exito, setExito] = useState(0);

// 👇 ACA VA el estilo compartido
  const tarjetaEstilo = {
    background: "#ffffff",
    borderRadius: "8px",
    padding: "1rem",
    boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
    minWidth: "180px",
    flex: "1"
  };

  useEffect(() => {
    if (!historial || historial.length === 0) return;

    setSimulaciones(historial.length);

    const totalETA = historial.reduce((acc, s) => acc + s.eta_minutos, 0);
    setEtaPromedio((totalETA / historial.length).toFixed(2));

    const centrosEstado = {};
    let exitos = 0;

    historial.forEach(sim => {
      centrosEstado[sim.centro] = (centrosEstado[sim.centro] || 0) + 1;
      if (!sim.excedido) exitos += 1;
    });

    setCentros(centrosEstado);
    setExito(((exitos / historial.length) * 100).toFixed(1));
  }, [historial]);

  return (
  <div style={{ marginTop: "2rem" }}>
    <h2>📈 Métricas de Eficiencia</h2>

    <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginTop: "1rem" }}>
      <div style={tarjetaEstilo}>
        <h3>🚑 Simulaciones</h3>
        <p>{simulaciones}</p>
      </div>

      <div style={tarjetaEstilo}>
        <h3>⏱️ ETA promedio</h3>
        <p>{etaPromedio} min</p>
      </div>

      <div style={tarjetaEstilo}>
        <h3>✅ Tasa de éxito</h3>
        <p>{exito}%</p>
      </div>

      <div style={tarjetaEstilo}>
        <h3>🏥 Centros</h3>
        <ul style={{ paddingLeft: "1rem" }}>
          {Object.entries(centros).map(([c, v]) => (
            <li key={c}>{c}: {v} / 5</li>
          ))}
        </ul>
      </div>
    </div>
  </div>
);
}
