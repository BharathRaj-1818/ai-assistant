import json
from datetime import datetime

FILE_PATH = "data/reminders.json"

def save_reminder(message):

    reminder = {
        "task": message,
        "created_at": str(datetime.now())
    }

    with open(FILE_PATH, "r") as file:
        reminders = json.load(file)

    reminders.append(reminder)

    with open(FILE_PATH, "w") as file:
        json.dump(reminders, file, indent=4)

    return reminder