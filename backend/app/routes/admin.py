from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth.dependencies import require_roles
from app.database import get_db
from app.models.user import User, UserRole
from app.schemas.email import EmailBroadcastResponse
from app.services.email_service import email_service
from app.services.tasks import task_dispatcher

router = APIRouter(tags=["Admin"])


@router.post("/send-meeting-email", response_model=EmailBroadcastResponse, status_code=status.HTTP_202_ACCEPTED)
async def send_meeting_email(
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN)),
) -> EmailBroadcastResponse:
    del current_user

    try:
        email_service.validate_configuration()
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    users = db.scalars(select(User)).all()
    recipients = [user.email for user in users]

    task_dispatcher.dispatch(background_tasks, email_service.send_bulk_meeting_email, recipients)

    return EmailBroadcastResponse(
        message="Meeting email dispatch started",
        recipients_count=len(recipients),
    )
