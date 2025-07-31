from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
from urllib.parse import quote # <--- IMPORTANTE: Añadir esta línea

app = FastAPI()

# 👇 Agregamos el middleware CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://simulador-ruteo.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def inicio():
    return {"mensaje": "Backend del simulador activo"}

# 🚨 Emergencias
class Emergencia(BaseModel):
    zona: str
    tipo_via: str
    distancia_km: float

def calcular_eta(distancia_km, tipo_via):
    velocidad = 60 if tipo_via == "avenida" else 40  # km/h
    eta = (distancia_km / velocidad) * 60            # minutos
    return round(eta, 2)

def asignar_ambulancia(datos: Emergencia):
    eta = calcular_eta(datos.distancia_km, datos.tipo_via)
    ambulancia = f"AMB-{hash(datos.zona) % 100:02d}"
    return {
        "ambulancia": ambulancia,
        "zona": datos.zona,
        "tipo_via": datos.tipo_via,
        "eta_minutos": eta
    }

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

# 🧭 Geocodificación: Dirección → Coordenadas (VERSIÓN FINAL CORREGIDA)
async def geocodificar_direccion(request: Request):
    data = await request.json()
    direccion = data.get("direccion")

    if not direccion:
        return {"error": "No se proporcionó ninguna dirección"}

    # Codificamos manualmente la dirección para que sea segura en una URL
    direccion_codificada = quote(direccion)
    
    # Volvemos al método de f-string que funcionaba, pero con la dirección ya segura
    url = f"https://nominatim.openstreetmap.org/search?format=json&q={direccion_codificada}"
    
    headers = {
        'User-Agent': 'SimuladorDeRuteo/1.0 (https://simulador-ruteo.vercel.app)'
    }

    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        
        datos = response.json()
        
        if datos:
            lat = datos[0]["lat"]
            lon = datos[0]["lon"]
            return {"lat": lat, "lng": lon}

    except requests.exceptions.RequestException:
        return {"error": "Error de comunicación con el servicio de geocodificación"}

    return {"error": "Dirección no encontrada"}
