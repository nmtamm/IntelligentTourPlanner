import datetime
import json
import os
import random
from ..routers.places import get_available_categories, get_types_dict_from_stats
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from sqlalchemy import text
from groq import Groq
from ..place_models import Place
from sqlalchemy.types import JSON, Float, Integer

# categories_path = os.path.join(os.path.dirname(__file__), "..", "categories.json")
# with open(categories_path, "r", encoding="utf-8") as f:
#     CATEGORIES = json.load(f)


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
        Return your answer as a JSON object with a single field: "starting_point".
        Example:
        {{"starting_point": "HCMC, Vietnam"}}

        Paragraph:
        {paragraph}
        """
        try:
            temp_response = client.chat.completions.create(
                model="meta-llama/llama-4-maverick-17b-128e-instruct",
                messages=[
                    {
                        "role": "system",
                        "content": "Extract the starting point city from the paragraph.",
                    },
                    {"role": "user", "content": temp_prompt},
                ],
                response_format={"type": "json_object"},
            )
            temp_data = json.loads(temp_response.choices[0].message.content)
            city_name = temp_data.get("starting_point", "HCMC, Vietnam").strip()
            print("Extracted city_name:", city_name)
        except Exception as model_exc:
            print("Model call failed:", model_exc)
            city_name = "HCMC, Vietnam"

        try:
            available_types_dict = get_types_dict_from_stats(city_name, db)
        except Exception as type_exc:
            print("Type extraction failed:", type_exc)

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
            # model="meta-llama/llama-4-maverick-17b-128e-instruct",
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
        result.starting_point = city_name
        result.categories = filtered_categories
        return result
    except Exception as e:
        return {"error": str(e)}


# def list_all_tourist_categories():
#     try:
#         category_names = [item["name"] for cat in CATEGORIES.values() for item in cat]
#         return category_names
#     except Exception as e:
#         return {"error": str(e)}


def load_commands():
    command_path = os.path.join(os.path.dirname(__file__), "..", "commands.json")
    with open(command_path, "r", encoding="utf-8") as f:
        return json.load(f)["commands"]


def detect_and_execute_command(
    client: Groq, user_prompt: str, plan: dict, db: Session
) -> dict:
    commands = load_commands()
    # Prepare a list of natural expressions and descriptions for the prompt
    command_expressions = [f'{cmd["natural_expression"]}' for cmd in commands]
    natural_to_name = {cmd["natural_expression"]: cmd["name"] for cmd in commands}
    name_to_command = {cmd["name"]: cmd for cmd in commands}

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
        print("Detected command result:", result)
        natural_expression = result.get("natural_expression", "unknown")
    except Exception:
        return {"error": "Could not parse command from LLM response."}

    # Map the detected natural expression back to the internal command name
    command = natural_to_name.get(natural_expression, "unknown")
    command_info = name_to_command.get(command, {})

    response_en = command_info.get("response_en", "")
    response_vi = command_info.get("response_vi", "")
    error_response_en = command_info.get(
        "error_response_en", "An error occurred. Please try again."
    )
    error_response_vi = command_info.get(
        "error_response_vi", "Đã xảy ra lỗi. Vui lòng thử lại."
    )

    if command == "create_itinerary":
        categories = list_tourist_recommendations(client, user_prompt, db)
        if isinstance(categories, dict) and "error" in categories:
            return {
                "command": command,
                "error": categories["error"],
                "response_en": error_response_en,
                "response_vi": error_response_vi,
            }
        return {
            "command": "create_itinerary",
            "itinerary": categories,
            "response_en": response_en,
            "response_vi": response_vi,
        }
    elif command == "update_trip_name":
        info = extract_trip_info(client, user_prompt)
        if "error" in info:
            return {
                "command": command,
                "error": info["error"],
                "response_en": error_response_en,
                "response_vi": error_response_vi,
            }
        return {
            "command": command,
            "trip_name": info.get("trip_name", ""),
            "response_en": response_en,
            "response_vi": response_vi,
        }
    elif command == "update_members":
        info = extract_trip_info(client, user_prompt)
        if "error" in info:
            return {
                "command": command,
                "error": info["error"],
                "response_en": error_response_en,
                "response_vi": error_response_vi,
            }
        return {
            "command": command,
            "members": info.get("members", 0),
            "response_en": response_en,
            "response_vi": response_vi,
        }
    elif command == "update_start_date":
        info = extract_trip_info(client, user_prompt)
        if "error" in info:
            return {
                "command": command,
                "error": info["error"],
                "response_en": error_response_en,
                "response_vi": error_response_vi,
            }
        return {
            "command": command,
            "start_day": info.get("start_day", ""),
            "response_en": response_en,
            "response_vi": response_vi,
        }
    elif command == "update_end_date":
        info = extract_trip_info(client, user_prompt)
        if "error" in info:
            return {
                "command": command,
                "error": info["error"],
                "response_en": error_response_en,
                "response_vi": error_response_vi,
            }
        return {
            "command": command,
            "end_day": info.get("end_day", ""),
            "response_en": response_en,
            "response_vi": response_vi,
        }
    elif command == "swap_day":
        info = swap_day(client, user_prompt)
        if "error" in info:
            return {
                "command": command,
                "error": info["error"],
                "response_en": error_response_en,
                "response_vi": error_response_vi,
            }
        return {
            "command": command,
            "day1": info.get("day1", 0),
            "day2": info.get("day2", 0),
            "response_en": response_en,
            "response_vi": response_vi,
        }
    elif command == "add_new_day_after_ith":
        print("Executing add_day_after_ith_day command")
        info = add_new_day_after_ith_day(client, user_prompt)
        if "error" in info:
            return {
                "command": command,
                "error": info["error"],
                "response_en": error_response_en,
                "response_vi": error_response_vi,
            }
        return {
            "command": command,
            "day": info.get("day", 0),
            "response_en": response_en,
            "response_vi": response_vi,
        }
    elif command == "delete_range_of_days":
        info = delete_day_range(client, user_prompt)
        if "error" in info:
            return {
                "command": command,
                "error": info["error"],
                "response_en": error_response_en,
                "response_vi": error_response_vi,
            }
        return {
            "command": command,
            "start_day": info.get("start_day", 0),
            "end_day": info.get("end_day", 0),
            "response_en": response_en,
            "response_vi": response_vi,
        }
    elif command == "search_new_destination":
        info = search_new_destination(client, user_prompt, db)
        return {
            "command": command,
            "destination": info.get("destination", ""),
            "matches": info.get("matches", []),
            "response_en": response_en,
            "response_vi": response_vi,
        }
    elif command == "delete_saved_plan_ith":
        info = delete_saved_plan_ith(client, user_prompt)
        if "error" in info:
            return {
                "command": command,
                "error": info["error"],
                "response_en": error_response_en,
                "response_vi": error_response_vi,
            }
        return {
            "command": command,
            "plan_index": info.get("plan_index", 0),
            "response_en": response_en,
            "response_vi": response_vi,
        }
    elif command == "find_route_of_pair_ith":
        info = find_route_of_pair_ith(client, user_prompt)
        if "error" in info:
            return {
                "command": command,
                "error": info["error"],
                "response_en": error_response_en,
                "response_vi": error_response_vi,
            }
        return {
            "command": command,
            "pair_index": info.get("pair_index", 0),
            "response_en": response_en,
            "response_vi": response_vi,
        }
    elif command == "add_new_destination":
        info = add_new_destination(client, user_prompt, plan, db)
        if info.get("error") == 201:
            return {
                "command": command,
                "response_en": "There is a conflict with existing destinations. If you want to add anyway, please write Confirm before add new destination. Else abort. If you want to delete the current plan, please write Delete current plan.",
                "response_vi": "Có sự xung đột với các điểm đến hiện có. Nếu bạn vẫn muốn thêm, vui lòng viết Xác nhận trước khi thêm điểm mới. Hoặc hủy bỏ. Nếu bạn muốn xóa kế hoạch hiện tại, vui lòng viết Xóa kế hoạch hiện tại.",
            }
        elif "error" in info:
            return {
                "command": command,
                "error": info["error"],
                "response_en": error_response_en,
                "response_vi": error_response_vi,
            }
        return {
            "command": command,
            "destination": info.get("destination", {}),
            "day": info.get("day", 0),
            "response_en": response_en,
            "response_vi": response_vi,
        }
    elif command == "confirm_add_new_destination":
        info = add_conflict_destination(client, user_prompt, plan, db)
        if "error" in info:
            return {
                "command": command,
                "error": info["error"],
                "response_en": error_response_en,
                "response_vi": error_response_vi,
            }
        return {
            "command": command,
            "destination": info.get("destination", {}),
            "day": info.get("day", 0),
            "response_en": response_en,
            "response_vi": response_vi,
        }
    elif command == "replace_destination_in_plan":
        info = replace_destination_in_plan(client, user_prompt, plan, db)
        if "error" in info:
            return {
                "command": command,
                "error": info["error"],
                "response_en": error_response_en,
                "response_vi": error_response_vi,
            }
        return {
            "command": command,
            "remove_id": info.get("remove_place_id", 0),
            "new_destination": info.get("add_place", {}),
            "day": info.get("day", 0),
            "response_en": response_en,
            "response_vi": response_vi,
        }
    elif command == "extract_type_from_prompt":
        info = extract_and_search_type(client, user_prompt, db)
        if "error" in info:
            return {
                "command": command,
                "error": info["error"],
                "response_en": error_response_en,
                "response_vi": error_response_vi,
            }
        return {
            "command": command,
            "type": info,
            "response_en": response_en,
            "response_vi": response_vi,
        }
    elif command == "find_information_for_a_place":
        info = extract_and_get_place_detail(client, user_prompt, db)
        if "error" in info:
            return {
                "command": command,
                "error": info["error"],
                "response_en": error_response_en,
                "response_vi": error_response_vi,
            }
        return {
            "command": command,
            "place_info": info,
            "response_en": response_en,
            "response_vi": response_vi,
        }
    elif command in [cmd["name"] for cmd in commands]:
        return {
            "command": command,
            "response_en": response_en,
            "response_vi": response_vi,
        }
    else:
        return {
            "error": "No matching command found.",
            "response_en": "No matching command found.",
            "response_vi": "Không tìm thấy lệnh phù hợp.",
        }


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
Convert all ordinal words (first, second, third) or relative terms into an integer
Return as JSON: {{"day": ...}}.
Instruction: {user_prompt}
"""
    try:
        response = client.chat.completions.create(
            model="meta-llama/llama-4-maverick-17b-128e-instruct",
            messages=[
                {
                    "role": "system",
                    "content": "Extract day number to add a new day after.",
                },
                {"role": "user", "content": prompt},
            ],
            response_format={"type": "json_object"},
        )
        result = json.loads(response.choices[0].message.content)

        if result.get("day") is not None:
            print("Add New Day After Ith Day Result:", result)
            return result
        return {"Error": "Could not extract day number."}
    except Exception as e:
        return {"error": str(e)}


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


def search_new_destination(client: Groq, user_prompt: str, db: Session) -> dict:
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

        matches = manual_search_places(destination, db, limit=10)
        # Optionally, fetch full records from places table as you do now
        full_matches = []
        for match in matches:
            place_id = match.get("place_id")
            if place_id:
                place_sql = text("SELECT * FROM places WHERE place_id = :id")
                place_row = db.execute(place_sql, {"id": place_id}).fetchone()
                if place_row:
                    full_matches.append(dict(place_row._mapping))
                else:
                    print("No full place record found for match:", match)
                    full_matches.append(dict(match))
            else:
                print("No place_id in match:", match)
                full_matches.append(dict(match))
        return {"destination": destination, "matches": full_matches}
    except Exception as e:
        return {"error": str(e)}


def manual_search_places(query: str, db: Session, limit: int = 20):
    sql = text("SELECT * FROM places_search WHERE title MATCH :q LIMIT :limit")
    results = db.execute(sql, {"q": query, "limit": limit}).mappings().all()
    return list(results)


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


# def add_new_destination(
#     client: Groq, user_prompt: str, plan: dict, db: Session
# ) -> dict:
#     # Step 1: Extract destination name and day number from user prompt
#     print("Adding new destination with prompt:", user_prompt)
#     prompt = f"""
# From the following instruction, extract the destination to be added and the day which it want to add the destination in the itinerary.
# Return as JSON: {{"destination": "...", "day": ...}}.

# Instruction: {user_prompt}
# """
#     response = client.chat.completions.create(
#         model="meta-llama/llama-4-maverick-17b-128e-instruct",
#         messages=[
#             {"role": "system", "content": "Extract destination and day number to add."},
#             {"role": "user", "content": prompt},
#         ],
#         response_format={"type": "json_object"},
#     )

#     # Step 2: Search for matching places in the database
#     try:
#         result = json.loads(response.choices[0].message.content)
#         print("Extracted add_new_destination result:", result)
#         destination = result.get("destination", "").strip()
#         day = result.get("day", 0)
#         if not destination:
#             print("No destination found in prompt.")
#             return {"error": "No destination found in prompt."}

#         # Only the first match is needed here
#         matches = manual_search_places(destination, db, limit=1)
#     except Exception as e:
#         return {"error": str(e)}

#     # Step 3: Traverse the plan, get to the day, check the destinations available of that day,
#     # if their latitude when convert to int is the same as the match, return the place
#     try:
#         if not matches:
#             print("No matches found for destination:", destination)
#             return {"error": "No matching places found."}

#         match = matches[0]
#         place_id = match.get("place_id")
#         if not place_id:
#             print("No place_id in matched place:", match)
#             return {"error": "No place_id in matched place."}

#         # Fetch full record from places table
#         place_sql = text("SELECT * FROM places WHERE place_id = :id")
#         place_row = db.execute(place_sql, {"id": place_id}).fetchone()
#         if not place_row:
#             print("No full place record found for place_id:", place_id)
#             return {"error": "No full place record found for matched place."}

#         # Check if the place is already in the specified day
#         day_index = day - 1  # Convert to 0-based index
#         if day_index < 0 or day_index >= len(plan.get("days", [])):
#             print("Invalid day number:", day)
#             return {"error": "Invalid day number."}
#         day_plan = plan["days"][day_index]

#         # Check if the destination already exists in the day's destinations
#         already_exists = False
#         for dest in day_plan.get("destinations", []):
#             # Compare by id or by lat/lon if needed
#             if str(dest.get("id")) == str(place_id) or (
#                 int(float(dest.get("latitude", 0))) == int(float(place_row.latitude))
#                 and int(float(dest.get("longitude", 0)))
#                 == int(float(place_row.longitude))
#             ):
#                 already_exists = True
#                 break

#         # If it already exists, return a message indicating so
#         if already_exists:
#             print("Destination already exists in day", day)
#             return {"error": "Destination already exists in the specified day."}

#         # If not exist, check if all destinations have latitude when convert to int the same as the match
#         # if no, return 201 error, asking if for user opinion
#         all_same_latitude = True
#         for dest in day_plan.get("destinations", []):
#             if int(float(dest.get("latitude", 0))) != int(float(place_row.latitude)):
#                 all_same_latitude = False
#                 break
#         print("All same latitude check:", all_same_latitude)
#         if not all_same_latitude:
#             return {"error": "201"}
#         return {
#             "destination": dict(place_row._mapping),
#             "day": day,
#         }
#     except Exception as e:
#         print("Exception occurred in add_new_destination:", e, flush=True)
#         return {"error": str(e)}

import json


def add_new_destination(
    client: Groq, user_prompt: str, plan: dict, db: Session
) -> dict:
    print("Adding new destination with prompt:", user_prompt)
    prompt = f"""
From the following instruction, extract the destination to be added and the day which it want to add the destination in the itinerary.
Return as JSON: {{"destination": "...", "day": ...}}.

Instruction: {user_prompt}
"""
    response = client.chat.completions.create(
        model="meta-llama/llama-4-maverick-17b-128e-instruct",
        messages=[
            {"role": "system", "content": "Extract destination and day number to add."},
            {"role": "user", "content": prompt},
        ],
        response_format={"type": "json_object"},
    )

    try:
        result = json.loads(response.choices[0].message.content)
        print("Extracted add_new_destination result:", result)
        destination = result.get("destination", "").strip()
        day = result.get("day", 0)
        if not destination:
            print("No destination found in prompt.")
            return {"error": "No destination found in prompt."}

        matches = manual_search_places(destination, db, limit=1)
    except Exception as e:
        print("Exception during LLM or search:", e, flush=True)
        return {"error": str(e)}

    try:
        if not matches:
            print("No matches found for destination:", destination)
            return {"error": "No matching places found."}

        match = matches[0]
        place_id = match.get("place_id")
        if not place_id:
            print("No place_id in matched place:", match)
            return {"error": "No place_id in matched place."}

        # Fetch full record from places table
        place_sql = text("SELECT * FROM places WHERE place_id = :id")
        place_row = db.execute(place_sql, {"id": place_id}).fetchone()
        if not place_row:
            print("No full place record found for place_id:", place_id)
            return {"error": "No full place record found for matched place."}

        # Extract latitude and longitude from gps_coordinates JSON field
        gps_coordinates = place_row._mapping.get("gps_coordinates")
        if gps_coordinates:
            try:
                gps_data = json.loads(gps_coordinates)
                latitude = gps_data.get("latitude", 0)
                longitude = gps_data.get("longitude", 0)
            except Exception as json_exc:
                print("Error parsing gps_coordinates JSON:", json_exc)
                latitude = 0
                longitude = 0
        else:
            latitude = 0
            longitude = 0

        # Check if the place is already in the specified day
        day_index = day - 1
        if day_index < 0 or day_index >= len(plan.get("days", [])):
            print("Invalid day number:", day)
            return {"error": "Invalid day number."}
        day_plan = plan["days"][day_index]

        already_exists = False
        for dest in day_plan.get("destinations", []):
            if str(dest.get("id")) == str(place_id) or (
                int(float(dest.get("latitude", 0))) == int(float(latitude))
                and int(float(dest.get("longitude", 0))) == int(float(longitude))
            ):
                already_exists = True
                break

        if already_exists:
            print("Destination already exists in day", day)
            return {"error": "Destination already exists in the specified day."}

        # If not exist, check if all destinations have latitude when convert to int the same as the match
        all_same_latitude = True
        for dest in day_plan.get("destinations", []):
            if int(float(dest.get("latitude", 0))) != int(float(latitude)):
                all_same_latitude = False
                break
        print("All same latitude check:", all_same_latitude)
        if not all_same_latitude:
            return {"error": 201}
        # Add latitude and longitude to the returned destination info
        place_info = row_to_dict(place_row, Place)
        return {
            "destination": place_info,
            "day": day,
        }
    except Exception as e:
        print("Exception occurred in add_new_destination:", e, flush=True)
        return {"error": str(e)}


def add_conflict_destination(
    client: Groq, user_prompt: str, plan: dict, db: Session
) -> dict:
    prompt = f"""
From the following instruction, extract the destination to be added and the day which it want to add the destination in the itinerary.
Return as JSON: {{"destination": "...", "day": ...}}.

Instruction: {user_prompt}
"""
    response = client.chat.completions.create(
        model="meta-llama/llama-4-maverick-17b-128e-instruct",
        messages=[
            {"role": "system", "content": "Extract destination and day number to add."},
            {"role": "user", "content": prompt},
        ],
        response_format={"type": "json_object"},
    )

    try:
        result = json.loads(response.choices[0].message.content)
        destination = result.get("destination", "").strip()
        day = result.get("day", 0)
        if not destination:
            return {"error": "No destination found in prompt."}

        matches = manual_search_places(destination, db, limit=1)
    except Exception as e:
        return {"error": str(e)}

    try:
        if not matches:
            return {"error": "No matching places found."}

        match = matches[0]
        place_id = match.get("place_id")
        if not place_id:
            return {"error": "No place_id in matched place."}

        # Fetch full record from places table
        place_sql = text("SELECT * FROM places WHERE place_id = :id")
        place_row = db.execute(place_sql, {"id": place_id}).fetchone()
        if not place_row:
            return {"error": "No full place record found for matched place."}

        # Extract latitude and longitude from gps_coordinates JSON field
        gps_coordinates = place_row._mapping.get("gps_coordinates")
        if gps_coordinates:
            try:
                gps_data = json.loads(gps_coordinates)
                latitude = gps_data.get("latitude", 0)
                longitude = gps_data.get("longitude", 0)
            except Exception as json_exc:
                latitude = 0
                longitude = 0
        else:
            latitude = 0
            longitude = 0

        day_index = day - 1  # Convert to 0-based index
        if day_index < 0 or day_index >= len(plan.get("days", [])):
            return {"error": "Invalid day number."}
        day_plan = plan["days"][day_index]

        already_exists = False
        for dest in day_plan.get("destinations", []):
            if str(dest.get("id")) == str(place_id) or (
                int(float(dest.get("latitude", 0))) == int(float(latitude))
                and int(float(dest.get("longitude", 0))) == int(float(longitude))
            ):
                already_exists = True
                break

        if already_exists:
            return {"error": "Destination already exists in the specified day."}

        place_info = row_to_dict(place_row, Place)
        return {
            "destination": place_info,
            "day": day,
        }
    except Exception as e:
        print("Exception occurred in add_conflict_destination:", e, flush=True)
        return {"error": str(e)}


def row_to_dict(row, model):
    columns = [col.name for col in model.__table__.columns]
    types = {col.name: col.type for col in model.__table__.columns}
    place = {}
    for idx, col in enumerate(columns):
        value = row[idx]
        col_type = types[col]
        if isinstance(col_type, JSON):
            try:
                value = json.loads(value) if value is not None else None
            except Exception:
                pass
        elif isinstance(col_type, Float):
            value = float(value) if value is not None else None
        elif isinstance(col_type, Integer):
            value = int(value) if value is not None else None
        place[col] = value
    return place


def replace_destination_in_plan(
    client: Groq, prompt: str, plan: dict, db: Session
) -> dict:
    """
    Replace a destination in the current plan with another one.
    Args:
        plan (dict): The current plan.
        prompt (str): User instruction.
        db (Session): SQLAlchemy session.
        client (Groq): LLM client.
    Returns:
        dict: { "remove_place_id": ..., "add_place": {...} }
    """
    # 1. Extract old and new destination names from prompt
    extract_prompt = f"""
From the following instruction, extract the name of the place to be replaced and the new place to add.
Return as JSON: {{"old_destination": "...", "new_destination": "..."}}.
Instruction: {prompt}
"""
    try:
        response = client.chat.completions.create(
            model="meta-llama/llama-4-maverick-17b-128e-instruct",
            messages=[
                {"role": "system", "content": "Extract old and new destination names."},
                {"role": "user", "content": extract_prompt},
            ],
            response_format={"type": "json_object"},
        )
        result = json.loads(response.choices[0].message.content)
        old_name = result.get("old_destination", "").strip()
        new_name = result.get("new_destination", "").strip()
        if not old_name or not new_name:
            return {"error": "Could not extract destination names from prompt."}
    except Exception as e:
        return {"error": f"LLM extraction failed: {e}"}

    # 2. Find 5 most related places for the old destination
    try:
        old_matches = manual_search_places(old_name, db, limit=5)
        if not old_matches:
            return {"error": f"No matches found for old destination: {old_name}"}
    except Exception as e:
        return {"error": f"DB search failed for old destination: {e}"}

    # 3. Find the place_id in plan that matches one of the 5
    plan_place_ids = set()
    for day in plan.get("days", []):
        for dest in day.get("destinations", []):
            if "id" in dest:
                plan_place_ids.add(str(dest["id"]))
    remove_place_id = None
    for match in old_matches:
        match_id = str(match.get("place_id"))
        if match_id in plan_place_ids:
            remove_place_id = match_id
            break
    if not remove_place_id:
        return {"error": "No matching place in plan to replace."}

    # 4. Find 1 place for the new destination
    try:
        new_matches = manual_search_places(new_name, db, limit=1)
        if not new_matches:
            return {"error": f"No matches found for new destination: {new_name}"}
        new_place_id = new_matches[0].get("place_id")
        if not new_place_id:
            return {"error": "No place_id for new destination."}
        place_sql = text("SELECT * FROM places WHERE place_id = :id")
        place_row = db.execute(place_sql, {"id": new_place_id}).fetchone()
        if not place_row:
            return {"error": "No full record for new destination."}
        add_place = row_to_dict(place_row, Place)
    except Exception as e:
        return {"error": f"DB search failed for new destination: {e}"}

    return {
        "remove_place_id": remove_place_id,
        "add_place": add_place,
    }


def manual_search_types(query: str, db: Session, limit: int = 20):
    sql = text("SELECT * FROM types_search WHERE type_id MATCH :q LIMIT :limit")
    results = db.execute(sql, {"q": query, "limit": limit}).mappings().all()
    return list(results)


def extract_and_search_type(client: Groq, user_prompt: str, db: Session) -> dict:
    prompt = f"""
From the following instruction, extract the type of place the user wants (e.g., museum, park, restaurant).
Return as JSON: {{"type": "..."}}.
Instruction: {user_prompt}
"""
    try:
        response = client.chat.completions.create(
            model="meta-llama/llama-4-maverick-17b-128e-instruct",
            messages=[
                {"role": "system", "content": "Extract type of place."},
                {"role": "user", "content": prompt},
            ],
            response_format={"type": "json_object"},
        )
        result = json.loads(response.choices[0].message.content)
        type_query = result.get("type", "").strip().lower()
        if not type_query:
            return {"error": "No type found in prompt."}
    except Exception as e:
        return {"error": f"LLM extraction failed: {e}"}

    try:
        matches = manual_search_types(type_query, db, limit=1)
        if not matches:
            return {"error": f"No matches found for type: {type_query}"}
        return matches[0]
    except Exception as e:
        return {"error": f"DB search failed: {e}"}


def extract_and_get_place_detail(client: Groq, user_prompt: str, db: Session) -> dict:
    prompt = f"""
From the following instruction, extract the destination (place) the user is referring to.
Return as JSON: {{"destination": "..."}}.
Instruction: {user_prompt}
"""
    try:
        response = client.chat.completions.create(
            model="meta-llama/llama-4-maverick-17b-128e-instruct",
            messages=[
                {"role": "system", "content": "Extract destination name."},
                {"role": "user", "content": prompt},
            ],
            response_format={"type": "json_object"},
        )
        result = json.loads(response.choices[0].message.content)
        destination = result.get("destination", "").strip()
        if not destination:
            return {"error": "No destination found in prompt."}
    except Exception as e:
        return {"error": f"LLM extraction failed: {e}"}

    # 2. Find that destination using manual_search_places
    try:
        matches = manual_search_places(destination, db, limit=1)
        if not matches:
            return {"error": f"No matches found for destination: {destination}"}
        place_id = matches[0].get("place_id")
        if not place_id:
            return {"error": "No place_id found for matched destination."}
    except Exception as e:
        return {"error": f"DB search failed: {e}"}

    # 3. Find that place in the places table
    try:
        place_sql = text("SELECT * FROM places WHERE place_id = :id")
        place_row = db.execute(place_sql, {"id": place_id}).fetchone()
        if not place_row:
            return {"error": "No full place record found for matched place."}
    except Exception as e:
        return {"error": f"DB fetch failed: {e}"}

    # 4. Use row_to_dict to return the whole record
    try:
        place_info = row_to_dict(place_row, Place)
        return place_info
    except Exception as e:
        return {"error": f"Failed to convert row to dict: {e}"}
