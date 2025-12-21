import json
from fastapi import APIRouter, Depends, Query
from ..place_models import Place, CityType, PlaceBase
from ..place_schemas import PlaceIn, PlacesPayload, GPSCoordinates
from ..place_database import get_db
from sqlalchemy.orm import Session
from sqlalchemy import Integer, desc, func, text, JSON, Float

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
    rows = db.execute(
        text(
            "SELECT type_id FROM type_stats WHERE city_name = :city_name ORDER BY type_score DESC"
        ),
        {"city_name": city_name},
    ).fetchall()
    return {"types": [{"name": row[0], "id": row[0]} for row in rows]}


@router.get("/api/places/manualsearch")
def search_places(query: str, db=Depends(get_db)):
    try:
        sql = text("SELECT * FROM places_search WHERE title MATCH :q LIMIT 10")
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
