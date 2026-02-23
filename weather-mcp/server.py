import httpx
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("weather")

GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search"
WEATHER_URL = "https://api.open-meteo.com/v1/forecast"

WMO_CODES = {
    0: "Clear sky",
    1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
    45: "Fog", 48: "Icy fog",
    51: "Light drizzle", 53: "Moderate drizzle", 55: "Dense drizzle",
    61: "Slight rain", 63: "Moderate rain", 65: "Heavy rain",
    71: "Slight snow", 73: "Moderate snow", 75: "Heavy snow",
    80: "Slight showers", 81: "Moderate showers", 82: "Violent showers",
    95: "Thunderstorm", 96: "Thunderstorm with hail", 99: "Thunderstorm with heavy hail",
}


@mcp.tool()
def get_weather(city: str) -> str:
    """Get the current weather for a given city."""
    with httpx.Client() as client:
        # Step 1: Geocode city name → lat/lon
        geo = client.get(GEOCODING_URL, params={
            "name": city, "count": 1, "language": "en", "format": "json"
        })
        geo.raise_for_status()
        results = geo.json().get("results")
        if not results:
            return f"City not found: {city}"

        location = results[0]
        lat, lon = location["latitude"], location["longitude"]
        display_name = f"{location['name']}, {location.get('country', '')}"

        # Step 2: Fetch current weather
        weather = client.get(WEATHER_URL, params={
            "latitude": lat,
            "longitude": lon,
            "current_weather": True,
            "timezone": "auto",
        })
        weather.raise_for_status()
        current = weather.json()["current_weather"]

    description = WMO_CODES.get(current["weathercode"], f"Code {current['weathercode']}")

    return (
        f"Weather in {display_name}:\n"
        f"  Condition:   {description}\n"
        f"  Temperature: {current['temperature']}°C\n"
        f"  Wind speed:  {current['windspeed']} km/h"
    )


if __name__ == "__main__":
    mcp.run()
