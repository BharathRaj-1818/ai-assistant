"""
Email tool for NeuroAI — reads emails via IMAP.
Credentials stored in UserSettings table (set via Settings panel).
"""
import imaplib
import email as email_lib
from email.header import decode_header
import os

def read_emails(count: int = 5) -> str:
    """Reads the latest unread emails from the configured IMAP inbox."""
    # Load credentials from env or settings
    imap_host = os.environ.get("IMAP_HOST", "")
    imap_user = os.environ.get("IMAP_USER", "")
    imap_pass = os.environ.get("IMAP_PASS", "")

    if not all([imap_host, imap_user, imap_pass]):
        return (
            "Email not configured. Please set your IMAP credentials in the Settings panel: "
            "IMAP Host, Email, and App Password."
        )

    try:
        mail = imaplib.IMAP4_SSL(imap_host)
        mail.login(imap_user, imap_pass)
        mail.select("inbox")

        _, messages = mail.search(None, "UNSEEN")
        email_ids = messages[0].split()[-count:]  # Latest N unread

        if not email_ids:
            return "No unread emails found."

        result = f"**Latest {len(email_ids)} Unread Emails:**\n\n"
        for eid in reversed(email_ids):
            _, msg_data = mail.fetch(eid, "(RFC822)")
            msg = email_lib.message_from_bytes(msg_data[0][1])

            subject, enc = decode_header(msg["Subject"])[0]
            if isinstance(subject, bytes):
                subject = subject.decode(enc or "utf-8")
            sender = msg.get("From", "Unknown")
            date = msg.get("Date", "Unknown")

            body = ""
            if msg.is_multipart():
                for part in msg.walk():
                    if part.get_content_type() == "text/plain":
                        body = part.get_payload(decode=True).decode(errors="replace")[:300]
                        break
            else:
                body = msg.get_payload(decode=True).decode(errors="replace")[:300]

            result += f"**From:** {sender}\n**Subject:** {subject}\n**Date:** {date}\n> {body.strip()}\n\n---\n\n"

        mail.logout()
        return result
    except Exception as e:
        return f"Error reading emails: {str(e)}"
