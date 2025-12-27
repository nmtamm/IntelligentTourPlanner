from pydantic import BaseModel
from typing import List, Optional, Any, Dict


class GPSCoordinates(BaseModel):
    latitude: Optional[float]
    longitude: Optional[float]


class PlaceIn(BaseModel):
    position: Optional[int] = None
    title: Optional[str] = None
    place_id: str
    data_id: Optional[str] = None
    data_cid: Optional[str] = None
    reviews_link: Optional[str] = None
    photos_link: Optional[str] = None
    gps_coordinates: Optional[Dict[str, float]] = None
    place_id_search: Optional[str] = None
    provider_id: Optional[str] = None
    rating: Optional[float] = None
    reviews: Optional[int] = None
    price: Optional[str] = None
    type: Optional[str] = None
    types: Optional[List[str]] = None
    type_id: Optional[str] = None
    type_ids: Optional[List[str]] = None
    address: Optional[str] = None
    open_state: Optional[str] = None
    hours: Optional[str] = None
    operating_hours: Optional[Dict[str, str]] = None
    phone: Optional[str] = None
    website: Optional[str] = None
    amenities: Optional[List[str]] = None
    description: Optional[str] = None
    service_options: Optional[Dict[str, Any]] = None
    thumbnail: Optional[str] = None
    extensions: Optional[List[Dict[str, Any]]] = None
    unsupported_extensions: Optional[List[Dict[str, Any]]] = None
    serpapi_thumbnail: Optional[str] = None
    user_review: Optional[str] = None
    place_detail: Optional[Dict[str, Any]] = None
    city_name: Optional[str] = None
    POI_score: Optional[float] = None
    en_names: Optional[List[str]] = None
    vi_names: Optional[List[str]] = None

    class Config:
        extra = "allow"


class PlacesPayload(BaseModel):
    places: List[PlaceIn]
