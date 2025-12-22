import datetime
import json
import os
import random
from ..routers.places import get_available_categories, get_types_dict_from_stats
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from sqlalchemy import text
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
            # model="moonshotai/kimi-k2-instruct-0905",
            model="meta-llama/llama-4-maverick-17b-128e-instruct",
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


def load_commands():
    command_path = os.path.join(os.path.dirname(__file__), "..", "commands.json")
    with open(command_path, "r", encoding="utf-8") as f:
        return json.load(f)["commands"]


def detect_and_execute_command(client: Groq, user_prompt: str, db: Session) -> dict:
    commands = load_commands()
    # Prepare a list of natural expressions and descriptions for the prompt
    command_expressions = [
        f'- "{cmd["natural_expression"]}": {cmd.get("description", "")}'
        for cmd in commands
    ]
    natural_to_name = {cmd["natural_expression"]: cmd["name"] for cmd in commands}

    # Build a prompt for Groq to classify the command
    groq_prompt = f"""
You are an intelligent assistant for a travel planning website.
Given the user's instruction, classify it as one of the following actions by natural expression only (no description, no extra text):

{chr(10).join(command_expressions)}

If the instruction does not match any action, return "unknown".

User instruction:
{user_prompt}

GUIDELINES:
1. If the user mentions planning, visiting places, or asking for recommendations for a city/trip, classify it as 'create itinerary'.
2. If the user provides multiple pieces of information (dates, destination), pick the primary action intended.
3. Return ONLY a JSON object with the key "natural_expression".

Return your answer as a JSON object: {{"natural_expression": "<expression>"}}
"""

    response = client.chat.completions.create(
        model="meta-llama/llama-4-scout-17b-16e-instruct",
        messages=[
            {
                "role": "system",
                "content": "Classify the user's instruction as a natural language action.",
            },
            {"role": "user", "content": groq_prompt},
        ],
        response_format={"type": "json_object"},
    )

    try:
        result = json.loads(response.choices[0].message.content)
        print("Groq Command Detection Result:", result)
        natural_expression = result.get("natural_expression", "unknown")
    except Exception:
        return {"error": "Could not parse command from LLM response."}

    # Map the detected natural expression back to the internal command name
    command = natural_to_name.get(natural_expression, "unknown")

    if command == "create_itinerary":
        categories = list_tourist_recommendations(client, user_prompt, db)
        return {"command": "create_itinerary", "itinerary": categories}
    elif command == "update_trip_name":
        info = extract_trip_info(client, user_prompt)
        return {"command": command, "trip_name": info.get("trip_name", "")}
    elif command == "update_members":
        info = extract_trip_info(client, user_prompt)
        return {"command": command, "members": info.get("members", 0)}
    elif command == "update_start_date":
        info = extract_trip_info(client, user_prompt)
        return {"command": command, "start_day": info.get("start_day", "")}
    elif command == "update_end_date":
        info = extract_trip_info(client, user_prompt)
        return {"command": command, "end_day": info.get("end_day", "")}
    elif command == "swap_day":
        info = swap_day(client, user_prompt)
        return {
            "command": command,
            "day1": info.get("day1", 0),
            "day2": info.get("day2", 0),
        }
    elif command == "add_day_after_ith_day":
        info = add_new_day_after_ith_day(client, user_prompt)
        return {"command": command, "day": info.get("day", 0)}
    elif command == "delete_range_of_days":
        info = delete_day_range(client, user_prompt)
        return {
            "command": command,
            "start_day": info.get("start_day", 0),
            "end_day": info.get("end_day", 0),
        }
    elif command == "add_new_destination":
        info = add_new_destination(client, user_prompt, db)
        return {
            "command": command,
            "destination": info.get("destination", ""),
            "place": info.get("place", None),
        }
    elif command == "delete_saved_plan_ith":
        info = delete_saved_plan_ith(client, user_prompt)
        return {"command": command, "plan_index": info.get("plan_index", 0)}
    elif command == "find_route_of_pair_ith":
        info = find_route_of_pair_ith(client, user_prompt)
        return {"command": command, "pair_index": info.get("pair_index", 0)}
    elif command in [cmd["name"] for cmd in commands]:
        return {"command": command}
    else:
        return {"error": "No matching command found."}


def extract_trip_info(client: Groq, user_prompt: str) -> dict:
    prompt = f"""
From the following instruction, extract the trip name and number of members if mentioned.
Return as JSON: {{"trip_name": "...", "members": ..., "start_day": ..., "end_day": ...}}.
Instruction: {user_prompt}
"""
    response = client.chat.completions.create(
        model="meta-llama/llama-4-maverick-17b-128e-instruct",
        messages=[
            {"role": "system", "content": "Extract trip name and members."},
            {"role": "user", "content": prompt},
        ],
        response_format={"type": "json_object"},
    )
    try:
        return json.loads(response.choices[0].message.content)
    except Exception:
        return {}


def swap_day(client: Groq, user_prompt: str) -> dict:
    prompt = f"""
From the following instruction, extract the two day numbers to be swapped in the itinerary.
Return as JSON: {{"day1": ..., "day2": ...}}.
Instruction: {user_prompt}
"""
    response = client.chat.completions.create(
        model="meta-llama/llama-4-maverick-17b-128e-instruct",
        messages=[
            {"role": "system", "content": "Extract day numbers to swap."},
            {"role": "user", "content": prompt},
        ],
        response_format={"type": "json_object"},
    )
    try:
        return json.loads(response.choices[0].message.content)
    except Exception:
        return {}


def add_new_day_after_ith_day(client: Groq, user_prompt: str) -> dict:
    prompt = f"""
From the following instruction, extract the day number after which a new day should be added in the itinerary.
Return as JSON: {{"day": ...}}.
Instruction: {user_prompt}
"""
    response = client.chat.completions.create(
        model="meta-llama/llama-4-maverick-17b-128e-instruct",
        messages=[
            {"role": "system", "content": "Extract day number to add a new day after."},
            {"role": "user", "content": prompt},
        ],
        response_format={"type": "json_object"},
    )
    try:
        return json.loads(response.choices[0].message.content)
    except Exception:
        return {}


def delete_day_range(client: Groq, user_prompt: str) -> dict:
    prompt = f"""
From the following instruction, extract the start and end day numbers to be deleted in the itinerary.
Return as JSON: {{"start_day": ..., "end_day": ...}}.
Instruction: {user_prompt}
"""
    response = client.chat.completions.create(
        model="meta-llama/llama-4-maverick-17b-128e-instruct",
        messages=[
            {"role": "system", "content": "Extract day range to delete."},
            {"role": "user", "content": prompt},
        ],
        response_format={"type": "json_object"},
    )
    try:
        return json.loads(response.choices[0].message.content)
    except Exception:
        return {}


def add_new_destination(client: Groq, user_prompt: str, db: Session) -> dict:
    prompt = f"""
From the following instruction, extract the destination to be added to the itinerary.
Return as JSON: {{"destination": "..."}}.
Instruction: {user_prompt}
"""
    response = client.chat.completions.create(
        model="meta-llama/llama-4-maverick-17b-128e-instruct",
        messages=[
            {"role": "system", "content": "Extract destination to add."},
            {"role": "user", "content": prompt},
        ],
        response_format={"type": "json_object"},
    )
    try:
        result = json.loads(response.choices[0].message.content)
        destination = result.get("destination", "").strip()
        if not destination:
            return {"error": "No destination found in prompt."}

        # Use the manualsearch function logic to search for the place by name
        sql = text("SELECT * FROM places_search WHERE title MATCH :q LIMIT 1")
        db_result = db.execute(sql, {"q": destination}).mappings().first()
        if db_result:
            # Optionally, get full place info from places table by place_id
            place_id = db_result.get("place_id")
            if place_id:
                place_sql = text("SELECT * FROM places WHERE place_id = :id")
                place_row = db.execute(place_sql, {"id": place_id}).fetchone()
                if place_row:
                    columns = [col.name for col in db_result.keys()]
                    place = dict(place_row)
                    return {"destination": destination, "place": place}
            return {"destination": destination, "place": dict(db_result)}
        else:
            return {"destination": destination, "place": None}
    except Exception as e:
        return {"error": str(e)}


def delete_saved_plan_ith(client: Groq, user_prompt: str) -> dict:
    prompt = f"""
From the following instruction, extract the index of the saved plan to be deleted.
Return as JSON: {{"plan_index": ...}}.
Instruction: {user_prompt}
"""
    response = client.chat.completions.create(
        model="meta-llama/llama-4-maverick-17b-128e-instruct",
        messages=[
            {"role": "system", "content": "Extract saved plan index to delete."},
            {"role": "user", "content": prompt},
        ],
        response_format={"type": "json_object"},
    )
    try:
        return json.loads(response.choices[0].message.content)
    except Exception:
        return {}


def find_route_of_pair_ith(client: Groq, user_prompt: str) -> dict:
    prompt = f"""
From the following instruction, extract the index of the pair of destinations whose route is to be displayed.
Return as JSON: {{"pair_index": ...}}.
Instruction: {user_prompt}
"""
    response = client.chat.completions.create(
        model="meta-llama/llama-4-maverick-17b-128e-instruct",
        messages=[
            {"role": "system", "content": "Extract pair index for route display."},
            {"role": "user", "content": prompt},
        ],
        response_format={"type": "json_object"},
    )
    try:
        return json.loads(response.choices[0].message.content)
    except Exception:
        return {}
