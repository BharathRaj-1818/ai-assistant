"""
Example NeuroAI Plugin: Weather Tool
Drop this file in the /plugins/ directory and NeuroAI will auto-load it.

Each plugin must define:
- TOOLS: list of Groq-compatible tool schemas
- HANDLERS: dict mapping function name -> callable
"""

def get_weather(location: str) -> str:
    """Returns a mock weather report for the given location."""
    # In production, replace with a real weather API call
    return f"Weather in {location}: 26°C, Partly Cloudy, Humidity 65%. Wind: 12km/h NE."

TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "get_weather",
            "description": "Gets the current weather for a given city or location.",
            "parameters": {
                "type": "object",
                "properties": {
                    "location": {"type": "string", "description": "The city or location name."}
                },
                "required": ["location"]
            }
        }
    }
]

HANDLERS = {
    "get_weather": get_weather
}
