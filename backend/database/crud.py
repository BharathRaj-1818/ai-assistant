from sqlalchemy.orm import Session
import datetime
from . import models

def get_recent_notes(db: Session, limit: int = 5):
    # Retrieve notes stored in the Memory table (key starting with 'note_')
    notes = db.query(models.Memory).filter(models.Memory.key.startswith("note_")).order_by(models.Memory.updated_at.desc()).limit(limit).all()
    return [{"id": n.id, "content": n.value, "date": n.updated_at.strftime("%Y-%m-%d %H:%M")} for n in notes]

def add_note(db: Session, content: str):
    note_id = f"note_{datetime.datetime.utcnow().timestamp()}"
    db_note = models.Memory(key=note_id, value=content)
    db.add(db_note)
    db.commit()
    db.refresh(db_note)
    return db_note

def delete_note(db: Session, note_id: str):
    note = db.query(models.Memory).filter(models.Memory.id == note_id).first()
    if note:
        db.delete(note)
        db.commit()
        return True
    return False

def get_reminders(db: Session, limit: int = 5):
    reminders = db.query(models.Reminder).order_by(models.Reminder.created_at.desc()).limit(limit).all()
    return [{"id": r.id, "task": r.task, "time": r.time, "completed": r.completed} for r in reminders]

def toggle_reminder(db: Session, reminder_id: int):
    reminder = db.query(models.Reminder).filter(models.Reminder.id == reminder_id).first()
    if reminder:
        reminder.completed = not reminder.completed
        db.commit()
        db.refresh(reminder)
        return True
    return False

def delete_reminder(db: Session, reminder_id: int):
    reminder = db.query(models.Reminder).filter(models.Reminder.id == reminder_id).first()
    if reminder:
        db.delete(reminder)
        db.commit()
        return True
    return False

def add_reminder(db: Session, task: str, time_str: str = "soon"):
    db_reminder = models.Reminder(task=task, time=time_str)
    db.add(db_reminder)
    db.commit()
    db.refresh(db_reminder)
    return db_reminder

def get_activity_stats(db: Session):
    # Returns mock token usage activity for the chart
    import random
    days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    return [{"day": day, "tokens": random.randint(1000, 5000)} for day in days]

def get_calendar_events(db: Session, limit: int = 10):
    events = db.query(models.CalendarEvent).order_by(models.CalendarEvent.date.asc(), models.CalendarEvent.time.asc()).limit(limit).all()
    return [{"id": e.id, "title": e.title, "date": e.date, "time": e.time} for e in events]

def add_calendar_event(db: Session, title: str, date: str, time: str):
    db_event = models.CalendarEvent(title=title, date=date, time=time)
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    return db_event

def delete_calendar_event(db: Session, event_id: int):
    event = db.query(models.CalendarEvent).filter(models.CalendarEvent.id == event_id).first()
    if event:
        db.delete(event)
        db.commit()
        return True
    return False

def get_user_profile(db: Session) -> dict:
    facts = db.query(models.UserProfile).all()
    return {f.key: f.value for f in facts}

def upsert_profile_fact(db: Session, key: str, value: str):
    existing = db.query(models.UserProfile).filter(models.UserProfile.key == key).first()
    if existing:
        existing.value = value
        existing.updated_at = __import__('datetime').datetime.utcnow()
    else:
        db.add(models.UserProfile(key=key, value=value))
    db.commit()
