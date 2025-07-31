from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests

app = FastAPI()

# Middleware CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://simulador-ruteo.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def inicio():
    return {"mensaje": "Backend del simulador activo"}

# Clase Emergencia
class Emergencia(BaseModel):
    zona: str
    tipo_via: str
    distancia_km: float

# Función para calcular ETA
def calcular_eta(distancia_km, tipo_via):
    velocidad = 60 if tipo_via == "avenida" else 40
    eta = (distancia_km / velocidad) * 60
    return round(eta, 2)

# Endpoint /asignar
def asignar_ambulancia(datos: Emergencia):
    eta = calcular_eta(datos.distancia_km, datos.tipo_via)
    ambulancia = f"AMB-{hash(datos.zona) % 100:02d}"
    return {
        "ambulancia": ambulancia,
        "zona": datos.zona,
        "tipo_via": datos.tipo_via,
        "eta_minutos": eta
    }

# Endpoint /asignar-ia
def asignar_ambulancia_ia(datos: Emergencia):
    eta = calcular_eta(datos.distancia_km, datos.tipo_via) * 0.9
    ambulancia = f"AMB-{(hash(datos.zona) + 42) % 100:02d}"
    centro = "Centro Sur" if datos.zona in ["Barracas", "Caballito"] else "Centro Norte"
    justificacion = "Asignación basada en demanda histórica y reserva estratégica"
    return {
        "ambulancia": ambulancia,
        "zona": datos.zona,
        "tipo_via": datos.tipo_via,
        "eta_minutos": round(eta, 2),
        "centro": centro,
        "justificacion": justificacion
    }

# Endpoint /geocodificar (Versión Original y Estable)
async def geocodificar_direccion(request: Request):
    data = await request.json()
    direccion = data["direccion"]

    url = f"https://nominatim.openstreetmap.org/search?format=json&q={direccion}"
    
    headers = {'User-Agent': 'SimuladorDeRuteo/1.0'}
    
    response = requests.get(url, headers=headers)
    datos = response.json()

    if datos:
        lat = datos[0]["lat"]
        lon = datos[0]["lon"]
        return {"lat": lat, "lng": lon}
    else:
        return {"error": "Dirección no encontrada"}
