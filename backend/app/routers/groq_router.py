import os
from fastapi import APIRouter, Body, Depends
from ..place_database import get_db
from sqlalchemy.orm import Session
from groq import Groq
from ..services.groq_service import list_tourist_recommendations

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
