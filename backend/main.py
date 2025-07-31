from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests  # 👈 Import necesario para usar Nominatim

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

@app.get("/")
def inicio():
    return {"mensaje": "Backend del simulador activo"}

# 🚨 Emergencias
class Emergencia(BaseModel):
    zona: str         # Ej: "Belgrano"
    tipo_via: str     # "avenida" o "calle"
    distancia_km: float

def calcular_eta(distancia_km, tipo_via):
    velocidad = 60 if tipo_via == "avenida" else 40  # km/h
    eta = (distancia_km / velocidad) * 60            # minutos
    return round(eta, 2)

@app.post("/asignar")
def asignar_ambulancia(datos: Emergencia):
    eta = calcular_eta(datos.distancia_km, datos.tipo_via)
    ambulancia = f"AMB-{hash(datos.zona) % 100:02d}"
    return {
        "ambulancia": ambulancia,
        "zona": datos.zona,
        "tipo_via": datos.tipo_via,
        "eta_minutos": eta
    }

@app.post("/asignar-ia")
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

# 🧭 Geocodificación: Dirección → Coordenadas
@app.post("/geocodificar")
async def geocodificar_direccion(request: Request):
direccion = data["direccion"]
ciudad = data.get("ciudad")  # 👈 Asegurate de enviar esto desde el frontend


# 📦 Bounding boxes por ciudad
BOUNDING_BOXES = {
    "Ciudad de Buenos Aires": [-58.531, -34.705, -58.335, -34.526],
    "Córdoba": [-64.264, -31.500, -64.059, -31.340],
    "Rosario": [-60.765, -32.997, -60.620, -32.880],
    "Mendoza": [-69.646, -35.619, -67.413, -32.345],
    "La Plata": [-58.052, -35.000, -57.890, -34.890]
}

    bbox = BOUNDING_BOXES.get(ciudad)
    if not bbox:
        return {"error": "Ciudad no soportada"}

    # 🧭 Construir URL con bounding box
    bbox_str = ",".join(map(str, bbox))
    url = (
        f"https://nominatim.openstreetmap.org/search"
        f"?format=json&q={direccion}"
        f"&viewbox={bbox_str}&bounded=1"
    )


    
    response = requests.get(url, headers={"User-Agent": "simulador-ruteo"})
    datos = response.json()

    if datos:
        lat = datos[0]["lat"]
        lon = datos[0]["lon"]
        return {"lat": lat, "lng": lon}
    else:
        return {"error": "Dirección no encontrada"}
