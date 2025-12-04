import datetime
from google import genai
from pydantic import BaseModel, Field

import json
import os

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


#  Alright, it doesn't seem like you know what you're doing in this project so read carefully.
#  To understand, read Gemini's quickstart guide: https://ai.google.dev/gemini-api/docs/quickstart
# and Gemini's "Structured output" section: https://ai.google.dev/gemini-api/docs/structured-output
#  Remember, in production, ALWAYS put the API key in the ENVIRONMENT VARIABLE `GEMINI_API_KEY`, and
# DON'T BE DUMB AND PUT IT IN THE REPO. For convenience in testing, only hardcode the API key LOCALLY,
# and don't push until you've confirmed that the key is not anywhere in the code.
def list_tourist_recommendations(
    client: genai.Client,  # External `client` object stored elsewhere (if unique instance, it should be in `main`). Just try to avoid singletons.
    paragraph: str,
    categories: dict = CATEGORIES,
):
    try:
        prompt = f"""
    Here is a list of categories for tourist locations. Each category contains several items, each with a "name" and an "id":

    {categories}

    From the following paragraph, extract the following information:
    - Up to 10 category names by understanding the user's intent and matching the described places or activities to the "name" values in the categories, even if the wording is not exact.
        - For each match, return the corresponding "name" and set "additional": false.
        - If fewer than 10 names are found, select additional names from the same categories as those already matched, until you have 10 in total. For these, set "additional": true.
    - The trip name, start day, end day, and number of people if mentioned.
    - Any specific desired destinations if mentioned (e.g. city names, landmarks, attractions).
    - A desired starting point if mentioned.

    **Validation requirement:**  
    If the starting point is not one of the following cities (accepting all common spellings, abbreviations, and Vietnamese tone/case variations): 
    - "Ho Chi Minh City", "HCMC", "Saigon", "Thành phố Hồ Chí Minh", "TP.HCM"
    - "Da Lat", "Dalat", "Đà Lạt", "đà lạt", "Đà lạt"
    - "Hue", "Huế", "huế"
    (with or without ', Vietnam'), set a field `valid_starting_point` to `false` and do not generate any plan.  
    Otherwise, set `valid_starting_point` to `true` and always format the starting point as '<city>, Vietnam'.

    Return the result using this schema:
    - trip_info: object with trip_name (str), start_day (str), end_day (str), num_people (int)
    - starting_point: str
    - desired_destinations: list of str
    - valid_starting_point: bool
    - categories: list of objects with name (str) and additional (bool)


    Paragraph:
    {paragraph}
    """

        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
            config={
                "response_mime_type": "application/json",
                "response_json_schema": GeminiResult.model_json_schema(),
            },
        )

        # Parse the response as a list of IDs
        result = GeminiResult.model_validate_json(response.text)
        result_dict = json.loads(response.text)
        if not result_dict.get("valid_starting_point", True):
            print(f"Starting point is invalid: {result.starting_point}")
            return {"error": "Invalid starting point"}
        return result
    except Exception as e:
        return {"error": str(e)}
