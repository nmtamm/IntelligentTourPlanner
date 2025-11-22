import datetime
from google import genai
from pydantic import BaseModel, Field

# If you don't get it, go read Pydantic's documentation, and see line 18.
# Data models that Gemini uses to restrict output format.
class Visit(BaseModel):
    name: str = Field(description="The location's name.")
    coords: tuple[float,float] = Field(description="The location's coordinates.")
    expected_time_frame: tuple[datetime.time, datetime.time] = Field(description="The expected time frame for the visit.")

class Itinerary(BaseModel):
    optional_accommodation: tuple[float, float] = Field(description="Accommodation coordinates, optional.")
    visits: list[list[Visit]] = Field(description="List of visits for the trip, by day.")

#  Alright, it doesn't seem like you know what you're doing in this project so read carefully.
#  To understand, read Gemini's quickstart guide: https://ai.google.dev/gemini-api/docs/quickstart
# and Gemini's "Structured output" section: https://ai.google.dev/gemini-api/docs/structured-output
#  Remember, in production, ALWAYS put the API key in the ENVIRONMENT VARIABLE `GEMINI_API_KEY`, and
# DON'T BE DUMB AND PUT IT IN THE REPO. For convenience in testing, only hardcode the API key LOCALLY,
# and don't push until you've confirmed that the key is not anywhere in the code.
def list_tourist_recommendations(
    client: genai.Client, # External `client` object stored elsewhere (if unique instance, it should be in `main`). Just try to avoid singletons.
    destination: str | tuple[float, float], # Name or Coords
    start_day: datetime.date, duration_in_days: int,
    budget: tuple[str, str], # Affordable within first and second element. Yes, they are strings so you can specify currency (may change later).
    interests: list[str]
):
    prompt = f"""Generate an itinerary for a person visiting {destination} in {duration_in_days} days starting from {start_day} that satisfies the person's interests and budget.
Provide a recommendation for accomodation. Every day, give recommendations on where to eat breakfast, lunch, and dinner.
Their budget is from {budget[0]} to {budget[1]}.
Their interests are: {', '.join(interests)}.
Time frames must not overlap, and account for travel time.
Return empty for invalid inputs."""
    
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
        config={
            "response_mime_type": "application/json",
            "response_json_schema": Itinerary.model_json_schema(),
        },
    )
    
    itinerary = Itinerary.model_validate_json(response.text)
    return itinerary