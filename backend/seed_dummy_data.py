from dataclasses import dataclass

from sqlalchemy import select

from app.auth.hashing import hash_password
from app.database import Base, SessionLocal, engine
from app.models.prototype import Prototype
from app.models.user import User, UserRole


@dataclass(frozen=True)
class SeedUser:
    name: str
    email: str
    password: str
    role: UserRole


SEED_USERS: list[SeedUser] = [
    SeedUser(name="Admin Demo", email="admin.demo@example.com", password="Admin@12345", role=UserRole.ADMIN),
    SeedUser(name="Prototyper Demo", email="prototyper.demo@example.com", password="Proto@12345", role=UserRole.PROTOTYPER),
    SeedUser(name="Business Demo", email="business.demo@example.com", password="Business@12345", role=UserRole.BUSINESS),
]

SEED_PROTOTYPES: list[dict[str, str]] = [
    {
        "title": "Smart Hydroponics Monitor",
        "description": "IoT-enabled nutrient and pH monitoring with mobile alerts for small urban farms.",
        "owner_email": "prototyper.demo@example.com",
    },
    {
        "title": "Campus EV Shuttle Planner",
        "description": "Route optimization prototype for electric shuttles to reduce idle time and charging bottlenecks.",
        "owner_email": "prototyper.demo@example.com",
    },
    {
        "title": "SME Credit Risk Assist",
        "description": "Business intelligence prototype that predicts invoice default risk from accounting signals.",
        "owner_email": "admin.demo@example.com",
    },
]


def upsert_users() -> dict[str, User]:
    users_by_email: dict[str, User] = {}
    with SessionLocal() as db:
        for seed_user in SEED_USERS:
            existing = db.scalar(select(User).where(User.email == seed_user.email))
            if existing:
                existing.name = seed_user.name
                existing.role = seed_user.role
                existing.hashed_password = hash_password(seed_user.password)
                users_by_email[seed_user.email] = existing
                continue

            user = User(
                name=seed_user.name,
                email=seed_user.email,
                hashed_password=hash_password(seed_user.password),
                role=seed_user.role,
            )
            db.add(user)
            db.flush()
            users_by_email[seed_user.email] = user

        db.commit()

        for email, user in list(users_by_email.items()):
            db.refresh(user)
            users_by_email[email] = user

    return users_by_email


def upsert_prototypes(users_by_email: dict[str, User]) -> None:
    with SessionLocal() as db:
        for seed_prototype in SEED_PROTOTYPES:
            owner = users_by_email[seed_prototype["owner_email"]]
            existing = db.scalar(
                select(Prototype).where(
                    Prototype.title == seed_prototype["title"],
                    Prototype.created_by == owner.id,
                )
            )
            if existing:
                existing.description = seed_prototype["description"]
                continue

            prototype = Prototype(
                title=seed_prototype["title"],
                description=seed_prototype["description"],
                created_by=owner.id,
            )
            db.add(prototype)

        db.commit()


def main() -> None:
    Base.metadata.create_all(bind=engine)
    users_by_email = upsert_users()
    upsert_prototypes(users_by_email)

    print("Dummy seed data is ready.")
    print("Manual test accounts:")
    for seed_user in SEED_USERS:
        print(f"- {seed_user.role.value}: {seed_user.email} / {seed_user.password}")


if __name__ == "__main__":
    main()
