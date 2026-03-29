import smtplib
from email.message import EmailMessage

from app.utils.config import get_settings

settings = get_settings()


class EmailService:
    subject = "Meeting Scheduled"
    body = "A meeting has been scheduled. Please attend."

    def validate_configuration(self) -> None:
        if not settings.EMAIL_ENABLED:
            raise ValueError("Email sending is disabled. Set EMAIL_ENABLED=true in backend/.env")

        if not settings.SMTP_USERNAME or not settings.SMTP_PASSWORD or not settings.SMTP_FROM_EMAIL:
            raise ValueError("SMTP credentials are not fully configured")

    def send_bulk_meeting_email(self, recipients: list[str]) -> int:
        if not recipients:
            return 0

        self.validate_configuration()

        sent_count = 0
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=20) as server:
            if settings.SMTP_USE_TLS:
                server.starttls()
            server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)

            for recipient in recipients:
                message = EmailMessage()
                message["From"] = settings.SMTP_FROM_EMAIL
                message["To"] = recipient
                message["Subject"] = self.subject
                message.set_content(self.body)
                server.send_message(message)
                sent_count += 1

        return sent_count


email_service = EmailService()
