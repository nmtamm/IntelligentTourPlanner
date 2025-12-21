import datetime
import json
import os
import random
from ..routers.places import get_available_categories, get_types_dict_from_stats
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from groq import Groq

categories_path = os.path.join(os.path.dirname(__file__), "..", "categories.json")
with open(categories_path, "r", encoding="utf-8") as f:
    CATEGORIES = json.load(f)


class TripInfo(BaseModel):
    trip_name: str = ""
    start_day: str = ""
    end_day: str = ""
    num_people: int = 0


class CategoryItem(BaseModel):
    name: str
    additional: bool


class GeminiResult(BaseModel):
    trip_info: TripInfo
    starting_point: str = ""
    desired_destinations: list[str] = []
    valid_starting_point: bool = True
    categories: list[CategoryItem] = []


def list_tourist_recommendations(
    client: Groq,
    paragraph: str,
    db: Session,
    categories: dict = None,  # Not used anymore
):
    try:
        # First, try to extract the city name from the paragraph using Groq (or set a default)
        temp_prompt = f"""
        From the following paragraph, extract the desired starting point city (if mentioned).
        Return your answer as a JSON object with a single field: "starting_point".

        Example:
        {{"starting_point": "HCMC, Vietnam"}}

        Paragraph:
        {paragraph}
        """
        temp_response = client.chat.completions.create(
            model="moonshotai/kimi-k2-instruct-0905",
            messages=[
                {
                    "role": "system",
                    "content": "Extract the starting point city from the paragraph.",
                },
                {"role": "user", "content": temp_prompt},
            ],
            response_format={"type": "json_object"},
        )
        try:
            temp_data = json.loads(temp_response.choices[0].message.content)
            city_name = temp_data.get("starting_point", "HCMC, Vietnam").strip()
        except Exception:
            city_name = "HCMC, Vietnam"

        available_types_dict = get_types_dict_from_stats(city_name, db)

        prompt = f"""
Here is a list of categories for tourist locations. Each category contains an item with a "name" and an "id":

{available_types_dict}

From the following paragraph, extract the following information:
- Up to 10 category names by understanding the user's intent and matching the described places or activities to the "name" values in the categories, even if the wording is not exact.
    - For each match, return the corresponding "name" and set "additional": false.
    - If fewer than 10 names are found, select additional names from the same categories as those already matched, until you have 10 in total. For these, set "additional": true.
- The trip name, start day, end day, and number of people if mentioned.
- Any specific desired destinations if mentioned (e.g. landmarks, attractions).
- A desired starting point if mentioned.

**Date calculation requirements:**  
- If the user provides only a start date or only an end date, automatically calculate the missing date so that the trip duration is at least 2 or 3 days.
    - For example, if the user says "starting from 12th December" and wants a 3-day trip, set start_day to "YYYY-12-12" and end_day to "YYYY-12-14", where YYYY is the **current year (now: {datetime.datetime.now().year})**.
    - If the user says "ending on 15th December" and wants a 3-day trip, set end_day to "YYYY-12-15" and start_day to "YYYY-12-13", where YYYY is the **current year (now: {datetime.datetime.now().year})**.
- If the user does not specify any dates, choose a time interval that is 2 or 3 days long, starting about 1 or 2 weeks from the current date, and use the **current year ({datetime.datetime.now().year})**.
- Never set the same value for both start and end date unless the trip is explicitly for one day.

**Validation requirement:**  
If the starting point is not one of the following cities (accepting all common spellings, abbreviations, and Vietnamese tone/case variations): 
- "Ho Chi Minh City", "HCMC", "Saigon", "Thành phố Hồ Chí Minh", "TP.HCM"
- "Da Lat", "Dalat", "Đà Lạt", "đà lạt", "Đà lạt"
- "Hue", "Huế", "huế"
(with or without ', Vietnam'), set a field `valid_starting_point` to `false` and do not generate any plan.  
Otherwise, set `valid_starting_point` to `true` and always format the starting point as '<city>, Vietnam'.
For the field `starting_point`, always return one of the following exact values:
- "HCMC, Vietnam"
- "Dalat, Vietnam"
- "Hue, Vietnam"
Do not use any other spelling, abbreviation, or format. If the city is not one of these, set `valid_starting_point` to `false`.

**Date formatting requirement:**  
For the fields `start_day` and `end_day`, always return dates in ISO format: "YYYY-MM-DD" (e.g., "2024-06-10").  
Do not use other formats.

Return the result using this schema:
- trip_info: object with trip_name (str), start_day (str), end_day (str), num_people (int)
- starting_point: str
- desired_destinations: list of str
- valid_starting_point: bool
- categories: list of objects with name (str) and additional (bool)

Paragraph:
{paragraph}
"""

        response = client.chat.completions.create(
            model="moonshotai/kimi-k2-instruct-0905",
            messages=[
                {
                    "role": "system",
                    "content": "Extract structured trip information from the paragraph using the provided schema.",
                },
                {"role": "user", "content": prompt},
            ],
            response_format={
                "type": "json_schema",
                "json_schema": {
                    "name": "gemini_result",
                    "schema": GeminiResult.model_json_schema(),
                },
            },
        )

        result = GeminiResult.model_validate(
            json.loads(response.choices[0].message.content)
        )
        result_dict = json.loads(response.choices[0].message.content)
        if not result_dict.get("valid_starting_point", True):
            return {"error": "Invalid starting point"}

        city_name = result.starting_point.strip()
        available_types_dict = get_types_dict_from_stats(city_name, db)

        filtered_categories = result.categories.copy()
        needed = 10 - len(filtered_categories)
        already_chosen = set(cat.name for cat in filtered_categories)
        remaining_types = [
            t["name"]
            for t in available_types_dict["types"]
            if t["name"] not in already_chosen
        ]
        for i in range(min(needed, len(remaining_types))):
            filtered_categories.append(
                CategoryItem(name=remaining_types[i], additional=True)
            )

        result.categories = filtered_categories
        return result
    except Exception as e:
        return {"error": str(e)}


def list_all_tourist_categories():
    try:
        category_names = [item["name"] for cat in CATEGORIES.values() for item in cat]
        return category_names
    except Exception as e:
        return {"error": str(e)}
