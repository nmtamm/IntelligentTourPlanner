# main.py
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routers import auth
from .routers import user
from .routers import geocode_router
from .routers import trips
from .routers import location
from .routers import osrm_router
from .routers import gemini

app = FastAPI(debug=True)

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(user.router)
app.include_router(geocode_router.router)
app.include_router(auth.router, prefix="/auth")
app.include_router(trips.router)
app.include_router(location.router)
app.include_router(osrm_router.router)
app.include_router(gemini.router)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
