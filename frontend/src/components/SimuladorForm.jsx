import { useState } from 'react'; 
import MetricasEficiencia from './MetricasEficiencia.jsx'; 
import ComparadorEstrategias from './ComparadorEstrategias.jsx'; 
export default function SimuladorForm({ onCoordenadasSeleccionadas }) 
{ const [resultado, setResultado] = useState(null); 
const [historial, setHistorial] = useState([]); const [direccion, setDireccion] = useState(""); 
const [ubicacion, setUbicacion] = useState(null);
const coordenadasZona = { Palermo: [-34.578, -58.429], Belgrano: [-34.563, -58.460], Recoleta: [-34.587, -58.392], Caballito: [-34.618, -58.441], Barracas: [-34.630, -58.373], }; 
const coordenadasCentro = { "Centro Norte": [-34.560, -58.420], "Centro Este": [-34.580, -58.425], "Centro Sur": [-34.640, -58.400], }; 
function determinarCentro(zona) { if (["Palermo", "Recoleta"].includes(zona)) return "Centro Norte"; 
if (["Belgrano", "Caballito"].includes(zona)) return "Centro Este"; 
return "Centro Sur"; } 
const buscarUbicacion = async () => { if (!direccion) return alert("Ingresá una dirección"); 
try { const res = await fetch("https://simulador-ruteo.onrender.com/geocodificar", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ direccion }) }); 
const data = await res.json();
if (data.lat && data.lng) { setUbicacion({ lat: parseFloat(data.lat), lng: parseFloat(data.lng) }); 
alert(`📍 Ubicación encontrada: ${data.lat}, ${data.lng}`); 
console.log("📌 Coordenadas:", data.lat, data.lng); 
