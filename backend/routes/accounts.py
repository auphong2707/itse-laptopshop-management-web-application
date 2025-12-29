import os
from fastapi import APIRouter, Body, HTTPException, Depends
from sqlalchemy.orm import Session
from services.auth import (
    UserCreate,
    UserLogin,
    Token,
    authenticate_user,
    create_user,
    create_access_token,
    get_current_user,
    get_current_admin_user,
)
from db.session import get_db
from db.models import User

accounts_router = APIRouter(prefix="/accounts", tags=["accounts"])


@accounts_router.post("/check")
def check_email_and_phone(data: dict = Body(...), db: Session = Depends(get_db)):
    """Check if email or phone number already exists"""
    email = data.get("email")
    phone = data.get("phone_number")

    email_exists = False
    phone_exists = False

    if email:
        email_exists = db.query(User).filter(User.email == email).first() is not None

    if phone:
        phone_exists = db.query(User).filter(User.phone_number == phone).first() is not None

    return {"email_exists": email_exists, "phone_exists": phone_exists}


@accounts_router.post("", status_code=201)
def create_account(user_data: UserCreate, db: Session = Depends(get_db)):
    """Create a new user account"""
    try:
        user = create_user(user_data, db)
        
        return {
            "message": f"{user.role.capitalize()} account created successfully",
            "user_id": user.id,
            "email": user.email,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@accounts_router.delete("/{user_id}")
def delete_account(
    user_id: int,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Delete a user account (admin only)"""
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        db.delete(user)
        db.commit()
        
        return {"message": f"Account with ID {user_id} deleted successfully."}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@accounts_router.post("/login", response_model=Token)
def login_user(user_credentials: UserLogin, db: Session = Depends(get_db)):
    """Login and receive access token"""
    user = authenticate_user(user_credentials.email, user_credentials.password, db)
    
    if not user:
        raise HTTPException(
            status_code=401,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=403,
            detail="Account is inactive"
        )
    
    # Create access token
    access_token = create_access_token(
        data={
            "sub": str(user.id),  # JWT spec requires 'sub' to be a string
            "email": user.email,
            "role": user.role
        }
    )
    
    return {"access_token": access_token, "token_type": "bearer"}


@accounts_router.get("/profile")
def get_account_profile(current_user: User = Depends(get_current_user)):
    """Get the complete profile information for the authenticated user"""
    return {
        "id": current_user.id,
        "email": current_user.email,
        "first_name": current_user.first_name,
        "last_name": current_user.last_name,
        "phone_number": current_user.phone_number,
        "shipping_address": current_user.shipping_address,
        "role": current_user.role,
        "is_active": current_user.is_active,
        "created_at": current_user.created_at,
    }


@accounts_router.put("/profile")
def update_account_profile(
    data: dict = Body(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update the authenticated user's profile"""
    try:
        # Fields that can be updated
        updatable_fields = ["first_name", "last_name", "phone_number", "shipping_address"]
        
        for field in updatable_fields:
            if field in data:
                setattr(current_user, field, data[field])
        
        db.commit()
        db.refresh(current_user)
        
        return {
            "message": "Profile updated successfully",
            "user": {
                "id": current_user.id,
                "email": current_user.email,
                "first_name": current_user.first_name,
                "last_name": current_user.last_name,
                "phone_number": current_user.phone_number,
                "shipping_address": current_user.shipping_address,
            }
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))