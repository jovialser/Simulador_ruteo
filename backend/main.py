from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

# 👇 Agregamos el middleware CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4321"],  # Solo permite acceso desde Astro en localhost
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def inicio():
    return {"mensaje": "Backend del simulador activo"}

# Modelo de emergencia que recibimos del frontend
class Emergencia(BaseModel):
    zona: str         # Ej: "Belgrano"
    tipo_via: str     # "avenida" o "calle"
    distancia_km: float

# Función para calcular ETA según tipo de vía
def calcular_eta(distancia_km, tipo_via):
    velocidad = 60 if tipo_via == "avenida" else 40  # km/h
    eta = (distancia_km / velocidad) * 60            # minutos
    return round(eta, 2)

# Nuevo endpoint POST para simular asignación
@app.post("/asignar")
def asignar_ambulancia(datos: Emergencia):
    eta = calcular_eta(datos.distancia_km, datos.tipo_via)
    ambulancia = f"AMB-{hash(datos.zona) % 100:02d}"  # ID simulada
    return {
        "ambulancia": ambulancia,
        "zona": datos.zona,
        "tipo_via": datos.tipo_via,
        "eta_minutos": eta
    }
@app.post("/asignar-ia")
def asignar_ambulancia_ia(datos: Emergencia):
    # Simulación IA: heurística + decisión estratégica
    eta = calcular_eta(datos.distancia_km, datos.tipo_via) * 0.9  # IA optimiza ETA
    ambulancia = f"AMB-{(hash(datos.zona) + 42) % 100:02d}"       # ID distinta
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
