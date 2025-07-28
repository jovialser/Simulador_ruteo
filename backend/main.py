from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import requests
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/route")
def get_route(start: str, end: str):
    ors_api_key = os.getenv("ORS_API_KEY")
    url = "https://api.openrouteservice.org/v2/directions/driving-car"
    body = {
        "coordinates": [
            [float(start.split(',')[1]), float(start.split(',')[0])],
            [float(end.split(',')[1]), float(end.split(',')[0])]
        ]
    }
    headers = {
        "Authorization": ors_api_key,
        "Content-Type": "application/json"
    }
    response = requests.post(url, json=body, headers=headers)
    return response.json()
