import json
from fastapi import APIRouter, Depends, Query
from ..place_models import Place, CityType, PlaceBase
from ..place_schemas import PlaceIn, PlacesPayload, GPSCoordinates
from ..place_database import get_db
from ..services.gtranslate_service import translateEnToVi, translateViToEn
from sqlalchemy.orm import Session
from sqlalchemy import Integer, desc, func, text, JSON, Float
import asyncio

router = APIRouter()


@router.post("/api/places/save")
async def save_places(payload: PlacesPayload, db: Session = Depends(get_db)):
    try:
        columns = {c.name for c in Place.__table__.columns}
        for place in payload.places:
            exists = db.query(Place).filter_by(place_id=place.place_id).first()
            if exists:
                continue  # Skip if already exists
            place_data = {k: v for k, v in place.dict().items() if k in columns}
            db.add(Place(**place_data))
        db.commit()
        return {"status": "success", "count": len(payload.places)}
    except Exception as e:
        db.rollback()
        return {"status": "error", "message": str(e)}


@router.get("/api/places/search")
async def search_places(
    type: str = Query(...),
    latitude: float = Query(...),
    longitude: float = Query(...),
    db: Session = Depends(get_db),
):
    try:
        lat_int = int(latitude)
        sql = text(
            """
            SELECT * FROM places
            WHERE EXISTS (
                SELECT 1 FROM json_each(places.type_ids)
                WHERE json_each.value = :type
            )
            AND CAST(json_extract(gps_coordinates, '$.latitude') AS INTEGER) = :lat_int
            ORDER BY POI_score DESC
            """
        )
        results = db.execute(sql, {"type": type, "lat_int": lat_int}).fetchall()
        columns = [col.name for col in Place.__table__.columns]
        types = {col.name: col.type for col in Place.__table__.columns}

        places_json = []
        for row in results:
            place = {}
            for idx, col in enumerate(columns):
                value = row[idx]
                col_type = types[col]
                # Handle JSON columns
                if isinstance(col_type, JSON):
                    try:
                        value = json.loads(value) if value is not None else None
                    except Exception:
                        pass
                # Handle Float
                elif isinstance(col_type, Float):
                    value = float(value) if value is not None else None
                # Handle Integer
                elif isinstance(col_type, Integer):
                    value = int(value) if value is not None else None
                # Otherwise, leave as is (String, etc.)
                place[col] = value
            places_json.append(place)

        return {"status": "success", "count": len(places_json), "places": places_json}
    except Exception as e:
        return {"status": "error", "message": str(e)}


def get_available_categories(city_name: str, db: Session):
    return set(
        t.type_name for t in db.query(CityType).filter_by(city_name=city_name).all()
    )


def get_types_dict_from_stats(city_name: str, db: Session):
    limit = 330 if city_name == "HCMC, Vietnam" else None
    sql = "SELECT type_id FROM type_stats WHERE city_name = :city_name ORDER BY type_score DESC"
    if limit:
        sql += " LIMIT :limit"
        rows = db.execute(
            text(sql),
            {"city_name": city_name, "limit": limit},
        ).fetchall()
    else:
        rows = db.execute(
            text(sql),
            {"city_name": city_name},
        ).fetchall()
    return {"types": [{"name": row[0], "id": row[0]} for row in rows]}


@router.get("/api/places/manualsearch")
def search_places(query: str, db=Depends(get_db)):
    try:
        sql = text("SELECT * FROM places_search WHERE title MATCH :q LIMIT 20")
        results = db.execute(sql, {"q": query}).mappings().all()
        return list(results)
    except Exception as e:
        return {"status": "error", "message": str(e)}


@router.get("/api/places/byid")
def get_place_by_id(id: str, db=Depends(get_db)):
    try:
        sql = text("SELECT * FROM places WHERE place_id = :id")
        row = db.execute(sql, {"id": id}).fetchone()
        if not row:
            return None

        columns = [col.name for col in Place.__table__.columns]
        types = {col.name: col.type for col in Place.__table__.columns}
        place = {}
        for idx, col in enumerate(columns):
            value = row[idx]
            col_type = types[col]
            # Handle JSON columns
            if isinstance(col_type, JSON):
                try:
                    value = json.loads(value) if value is not None else None
                except Exception:
                    pass
            # Handle Float
            elif isinstance(col_type, Float):
                value = float(value) if value is not None else None
            # Handle Integer
            elif isinstance(col_type, Integer):
                value = int(value) if value is not None else None
            # Otherwise, leave as is (String, etc.)
            place[col] = value
        return place
    except Exception as e:
        return {"status": "error", "message": str(e)}


# @router.get("/api/places/unique-top-types")
# async def get_unique_top_types_per_city_json(db=Depends(get_db)):
#     # Get all city names
#     city_names = [
#         row[0]
#         for row in db.execute(
#             text("SELECT DISTINCT city_name FROM type_stats")
#         ).fetchall()
#     ]
#     used_type_ids = set()
#     all_items = []

#     for city in city_names:
#         rows = db.execute(
#             text(
#                 "SELECT type_id FROM type_stats WHERE city_name = :city_name ORDER BY type_score DESC"
#             ),
#             {"city_name": city},
#         ).fetchall()
#         selected = []
#         for row in rows:
#             type_id = row[0]
#             if type_id not in used_type_ids:
#                 selected.append(type_id)
#                 used_type_ids.add(type_id)
#             if len(selected) == 10:
#                 break
#         # Prepare label_en for translation
#         for type_id in selected:
#             label_en = type_id.replace("_", " ")
#             all_items.append({"id": type_id, "labelEN": label_en})

#     async def translate(item):
#         label_vi = await translateEnToVi(item["labelEN"])
#         item["labelVI"] = label_vi
#         return item

#     all_items = all_items = await asyncio.gather(
#         *(translate(item) for item in all_items)
#     )

#     return all_items


@router.get("/api/places/unique-top-types")
def get_unique_top_types_per_city_json(db=Depends(get_db)):
    # Get all city names
    city_names = [
        row[0]
        for row in db.execute(
            text("SELECT DISTINCT city_name FROM type_stats")
        ).fetchall()
    ]
    used_type_ids = set()
    all_items = []

    for city in city_names:
        rows = db.execute(
            text(
                "SELECT type_id, type_id_en, type_id_vi FROM type_stats WHERE city_name = :city_name ORDER BY type_score DESC"
            ),
            {"city_name": city},
        ).fetchall()
        selected = []
        for row in rows:
            type_id = row[0]
            if type_id not in used_type_ids:
                selected.append(
                    (type_id, row[1], row[2])
                )  # (type_id, type_id_en, type_id_vi)
                used_type_ids.add(type_id)
            if len(selected) == 10:
                break
        for type_id, type_id_en, type_id_vi in selected:
            all_items.append(
                {"id": type_id, "labelEN": type_id_en, "labelVI": type_id_vi}
            )

    return all_items


@router.get("/api/places/nearby")
def find_places_nearby(latitude, longitude, type, radius_m=1000, db=Depends(get_db)):
    sql = text(
        """
    SELECT *,
        (
            6371000 * acos(
                cos(radians(:lat)) * cos(radians(json_extract(gps_coordinates, '$.latitude')))
                * cos(radians(json_extract(gps_coordinates, '$.longitude')) - radians(:lng))
                + sin(radians(:lat)) * sin(radians(json_extract(gps_coordinates, '$.latitude')))
            )
        ) AS distance
    FROM places
    WHERE EXISTS (
        SELECT 1 FROM json_each(places.type_ids)
        WHERE json_each.value = :type
    )
    AND (
        6371000 * acos(
            cos(radians(:lat)) * cos(radians(json_extract(gps_coordinates, '$.latitude')))
            * cos(radians(json_extract(gps_coordinates, '$.longitude')) - radians(:lng))
            + sin(radians(:lat)) * sin(radians(json_extract(gps_coordinates, '$.latitude')))
        )
    ) < :radius
    ORDER BY distance ASC, POI_score DESC
    LIMIT 20
    """
    )
    results = db.execute(
        sql, {"lat": latitude, "lng": longitude, "type": type, "radius": radius_m}
    ).fetchall()
    columns = [col.name for col in Place.__table__.columns]
    types = {col.name: col.type for col in Place.__table__.columns}

    places_json = []
    for row in results:
        place = {}
        for idx, col in enumerate(columns):
            value = row[idx]
            col_type = types[col]
            # Handle JSON columns
            if isinstance(col_type, JSON):
                try:
                    value = json.loads(value) if value is not None else None
                except Exception:
                    pass
            # Handle Float
            elif isinstance(col_type, Float):
                value = float(value) if value is not None else None
            # Handle Integer
            elif isinstance(col_type, Integer):
                value = int(value) if value is not None else None
            # Otherwise, leave as is (String, etc.)
            place[col] = value
        places_json.append(place)

    return {"status": "success", "count": len(places_json), "places": places_json}
