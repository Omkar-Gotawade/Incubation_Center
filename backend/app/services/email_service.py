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

    def _send_single_message(self, recipient: str, subject: str, body: str) -> None:
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=20) as server:
            if settings.SMTP_USE_TLS:
                server.starttls()
            server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)

            message = EmailMessage()
            message["From"] = settings.SMTP_FROM_EMAIL
            message["To"] = recipient
            message["Subject"] = subject
            message.set_content(body)
            server.send_message(message)

    def send_bulk_meeting_email(self, recipients: list[str]) -> int:
        if not recipients:
            return 0

        self.validate_configuration()

        sent_count = 0
        for recipient in recipients:
            self._send_single_message(recipient=recipient, subject=self.subject, body=self.body)
            sent_count += 1

        return sent_count

    def send_password_reset_email(self, recipient: str, reset_link: str) -> None:
        self.validate_configuration()
        body = (
            "We received a request to reset your password.\n\n"
            f"Reset your password using this link:\n{reset_link}\n\n"
            "If you did not request this, you can ignore this email."
        )
        self._send_single_message(recipient=recipient, subject="Reset Your Password", body=body)


email_service = EmailService()
