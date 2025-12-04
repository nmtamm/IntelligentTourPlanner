from fastapi import APIRouter, Body
from ..services.gtranslate_service import translateEnToVi, translateViToEn

router = APIRouter(prefix="/api/translate", tags=["translate"])


@router.post("/en-to-vi")
def en_to_vi(data: dict = Body(...)):
    text = data.get("text", "")
    return {"translation": translateEnToVi(text)}


@router.post("/vi-to-en")
def vi_to_en(data: dict = Body(...)):
    text = data.get("text", "")
    return {"translation": translateViToEn(text)}
