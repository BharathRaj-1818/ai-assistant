def detect_intent(message):

    message = message.lower()

    if "remind me" in message or "task" in message or "todo" in message:
        return "reminder"

    elif "schedule" in message:
        return "schedule"

    elif "note" in message:
        return "notes"

    else:
        return "general"