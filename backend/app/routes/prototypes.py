from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import desc, select
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user, require_roles
from app.database import get_db
from app.models.prototype import Prototype
from app.models.user import User, UserRole
from app.schemas.prototype import PrototypeCreate, PrototypeResponse

router = APIRouter(prefix="/prototypes", tags=["Prototypes"])


@router.post(
    "",
    response_model=PrototypeResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_prototype(
    payload: PrototypeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.PROTOTYPER)),
) -> PrototypeResponse:
    prototype = Prototype(
        title=payload.title.strip(),
        description=payload.description.strip(),
        created_by=current_user.id,
    )
    db.add(prototype)
    db.commit()
    db.refresh(prototype)
    return prototype


@router.get("", response_model=list[PrototypeResponse])
async def list_prototypes(
    search: str | None = Query(default=None, min_length=1, max_length=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[PrototypeResponse]:
    del current_user
    query = select(Prototype)
    if search:
        query = query.where(Prototype.title.ilike(f"%{search.strip()}%"))

    records = db.scalars(query.order_by(desc(Prototype.created_at))).all()
    return list(records)


@router.get("/{prototype_id}", response_model=PrototypeResponse)
async def get_prototype(
    prototype_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> PrototypeResponse:
    del current_user
    prototype = db.get(Prototype, prototype_id)
    if not prototype:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prototype not found")

    return prototype


@router.delete("/{prototype_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_prototype(
    prototype_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    prototype = db.get(Prototype, prototype_id)
    if not prototype:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prototype not found")

    is_owner = prototype.created_by == current_user.id
    is_admin = current_user.role == UserRole.ADMIN
    if not (is_owner or is_admin):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed to delete this prototype")

    db.delete(prototype)
    db.commit()
