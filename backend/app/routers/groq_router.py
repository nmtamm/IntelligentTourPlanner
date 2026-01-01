import os
from fastapi import APIRouter, Body, Depends
from ..place_database import get_db
from sqlalchemy.orm import Session
from groq import Groq
from ..services.groq_service import (
    list_tourist_recommendations,
    detect_and_execute_command,
)
from pydantic import BaseModel
from typing import Any, Dict

router = APIRouter(prefix="/api/groq", tags=["groq"])


@router.post("/")
def get_itinerary(
    paragraph: str = Body(..., embed=True), db: Session = Depends(get_db)
):
    try:
        api_key = os.getenv("GROQ_API_KEY")
        client = Groq(api_key=api_key)
        itinerary = list_tourist_recommendations(client, paragraph, db)
        return itinerary
    except Exception as e:
        return {"error": str(e)}


class DetectCommandRequest(BaseModel):
    prompt: str
    plan: Dict[str, Any]


@router.post("/detect-command")
def detect_command(body: DetectCommandRequest, db: Session = Depends(get_db)):
    try:
        api_key = os.getenv("GROQ_API_KEY")
        client = Groq(api_key=api_key)
        # Pass both prompt and plan to your service
        result = detect_and_execute_command(client, body.prompt, body.plan, db)
        return result
    except Exception as e:
        return {"error": str(e)}
