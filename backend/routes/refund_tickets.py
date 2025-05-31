from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import List, Optional

from db.models import RefundTicket
from schemas.refund_tickets import (
    RefundTicketCreate,
    RefundTicketUpdate,
    RefundTicketResponse,
)
from db.session import get_db
from db.models import Order

refund_tickets_router = APIRouter(prefix="/refund_tickets", tags=["refund_tickets"])


@refund_tickets_router.post("/", response_model=RefundTicketResponse)
async def create_refund_ticket(
    refund_ticket: RefundTicketCreate, db: Session = Depends(get_db)
):
    print(f"Creating refund ticket: {refund_ticket}")
    existing_ticket = (
        db.query(RefundTicket)
        .filter_by(email=refund_ticket.email, phone_number=refund_ticket.phone_number, order_id=refund_ticket.order_id)
        .first()
    )

    if existing_ticket:
        raise HTTPException(
            status_code=400,
            detail="Refund ticket already exists for this email and phone number combination.",
        )


    # Check if the order exists and is delivered
    order = db.query(Order).filter(Order.id == refund_ticket.order_id).first()

    print(f"Order found: {order.status if order else 'None'}")
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.status != "delivered":
        raise HTTPException(status_code=400, detail="Refund can only be requested for delivered orders")

    new_refund_ticket = RefundTicket(
        email=refund_ticket.email,
        phone_number=refund_ticket.phone_number,
        order_id=refund_ticket.order_id,
        reason=refund_ticket.reason,
        status=refund_ticket.status,
    )

    try:
        db.add(new_refund_ticket)
        db.commit()
        db.refresh(new_refund_ticket)

        return RefundTicketResponse(
            id=new_refund_ticket.id,
            email=new_refund_ticket.email,
            phone_number=new_refund_ticket.phone_number,
            order_id=new_refund_ticket.order_id,
            reason=new_refund_ticket.reason,
            status=new_refund_ticket.status,
            created_at=new_refund_ticket.created_at,
            resolved_at=new_refund_ticket.resolved_at,
        )

    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=500, detail="Error creating the refund ticket.")


@refund_tickets_router.get("/", response_model=List[RefundTicketResponse])
async def get_refund_tickets(
    email: Optional[str] = None,
    phone_number: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
):
    query = db.query(RefundTicket)

    if email:
        query = query.filter(RefundTicket.email == email)
    if phone_number:
        query = query.filter(RefundTicket.phone_number == phone_number)
    if status:
        query = query.filter(RefundTicket.status == status)

    return query.all()


@refund_tickets_router.put("/{refund_ticket_id}", response_model=RefundTicketResponse)
async def update_refund_ticket(
    refund_ticket_id: int,
    refund_ticket_update: RefundTicketUpdate,
    db: Session = Depends(get_db),
):
    refund_ticket = (
        db.query(RefundTicket).filter(RefundTicket.id == refund_ticket_id).first()
    )

    if not refund_ticket:
        raise HTTPException(status_code=404, detail="Refund ticket not found")

    if refund_ticket_update.status:
        refund_ticket.status = refund_ticket_update.status
    if refund_ticket_update.resolved_at:
        refund_ticket.resolved_at = refund_ticket_update.resolved_at

    db.commit()
    db.refresh(refund_ticket)

    return refund_ticket
