import { useEffect, useState } from "react";

export default function AsignacionesActivas() {
  const [asignadas, setAsignadas] = useState([]);

  useEffect(() => {
    // Simulación inicial; luego se puede conectar al backend
    setAsignadas([
      { id: "AMB-85", zona: "Palermo", eta: 4.2, estado: "en camino" },
      { id: "AMB-42", zona: "Belgrano", eta: 3.5, estado: "asignada" },
      { id: "AMB-33", zona: "Barracas", eta: 5.8, estado: "esperando" }
    ]);
  }, []);

  return (
    <div style={{ marginTop: "2rem" }}>
      <h2>📋 Ambulancias Asignadas</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Zona</th>
            <th>ETA (min)</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {asignadas.map(a => (
            <tr key={a.id}>
              <td>{a.id}</td>
              <td>{a.zona}</td>
              <td>{a.eta}</td>
              <td>{a.estado}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
