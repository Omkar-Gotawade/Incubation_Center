from sqlalchemy import select

from app.database import Base, SessionLocal, engine
from app.models.prototype import Prototype
from app.models.user import User

TEMPLATES: list[tuple[str, str]] = [
    (
        "AI Inventory Forecast Assistant",
        "Predicts stock movement and re-order recommendations using sales seasonality and lead-time signals.",
    ),
    (
        "Mentor Match Recommendation Engine",
        "Matches founders with mentors based on domain, stage, and prior engagement outcomes.",
    ),
    (
        "Prototype Readiness Scorecard",
        "Computes a launch-readiness score from usability checks, bug trends, and validation milestones.",
    ),
]


def seed_for_gmail_users() -> tuple[int, int]:
    Base.metadata.create_all(bind=engine)

    created = 0
    users_count = 0

    with SessionLocal() as db:
        gmail_users = db.scalars(select(User).where(User.email.ilike("%@gmail.com"))).all()
        users_count = len(gmail_users)

        for user in gmail_users:
            for title_template, description in TEMPLATES:
                title = f"{title_template} - {user.name}"
                exists = db.scalar(
                    select(Prototype).where(
                        Prototype.created_by == user.id,
                        Prototype.title == title,
                    )
                )
                if exists:
                    continue

                db.add(
                    Prototype(
                        title=title,
                        description=description,
                        created_by=user.id,
                    )
                )
                created += 1

        db.commit()

    return users_count, created


def main() -> None:
    users_count, created = seed_for_gmail_users()
    print(f"Gmail users found: {users_count}")
    print(f"Dummy prototypes created: {created}")


if __name__ == "__main__":
    main()
