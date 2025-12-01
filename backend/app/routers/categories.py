from fastapi import APIRouter
from ..services.gemini_service import list_all_tourist_categories

router = APIRouter()


@router.get("/categories")
def get_all_categories():
    """
    Returns a JSON list of all tourist category names.
    """
    return list_all_tourist_categories()
