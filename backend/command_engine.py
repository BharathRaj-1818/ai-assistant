from database.database import SessionLocal
from database import crud

def process_command(message: str) -> dict:
    """
    Processes slash commands to bypass LLM and execute fast tasks.
    Returns None if it's not a command.
    """
    if not message.startswith("/"):
        return None

    parts = message.split(" ", 1)
    command = parts[0].lower()
    args = parts[1] if len(parts) > 1 else ""

    if command == "/weather":
        city = args if args else "your location"
        # In a real app, call a weather API here.
        return {
            "type": "weather",
            "response": f"🌤️ The weather in {city} is currently 24°C, partly cloudy. Good day for coding!"
        }

    elif command == "/note":
        if not args:
            return {"type": "note", "response": "⚠️ Please provide a note to save. Example: `/note Buy milk`"}
        with SessionLocal() as db:
            crud.add_note(db, content=args)
        return {
            "type": "note",
            "response": f"📝 Note saved: '{args}'"
        }

    elif command == "/todo":
        if not args:
            return {"type": "todo", "response": "⚠️ Please provide a task. Example: `/todo Complete the UI`"}
        with SessionLocal() as db:
            crud.add_reminder(db, task=args)
        return {
            "type": "todo",
            "response": f"✅ Task added to your list: '{args}'"
        }

    elif command == "/clear":
        return {
            "type": "clear",
            "response": "🧹 Memory and chat history cleared."
        }

    elif command == "/help":
        return {
            "type": "help",
            "response": """### System Commands
- `/weather [city]` - Check current weather
- `/note [text]` - Save a quick note
- `/todo [task]` - Add a task to your list
- `/clear` - Clear current context
- `/help` - Show this menu"""
        }

    else:
        return {
            "type": "unknown",
            "response": f"Unknown command: `{command}`. Type `/help` for available commands."
        }