import os
from fastapi import APIRouter, Body, Depends
from ..place_database import get_db
from sqlalchemy.orm import Session
from google import genai
from ..services.gemini_service import list_tourist_recommendations

router = APIRouter(prefix="/api/itinerary", tags=["gemini"])


@router.post("/")
def get_itinerary(
    paragraph: str = Body(..., embed=True), db: Session = Depends(get_db)
):
    try:
        api_key = os.getenv("GEMINI_API_KEY")
        client = genai.Client(api_key=api_key)
        itinerary = list_tourist_recommendations(client, paragraph, db)
        return itinerary
    except Exception as e:
        return {"error": str(e)}
