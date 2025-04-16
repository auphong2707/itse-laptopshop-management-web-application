import os
from fastapi import APIRouter, Body, HTTPException, Depends
from firebase_admin import auth, firestore
from db.models import ExtendedUserCreate  # make sure your model is defined properly
from services.firebase_auth import verify_firebase_token  # if you use Depends for auth

accounts_router = APIRouter(prefix="/accounts", tags=["accounts"])

@accounts_router.post("/check")
def check_email_and_phone(data: dict = Body(...)):
    email = data.get("email")
    phone = data.get("phone_number")

    users_ref = firestore.client().collection("users")
    email_exists = False
    phone_exists = False

    if email:
        query = users_ref.where("email", "==", email).limit(1).stream()
        email_exists = any(query)

    if phone:
        query = users_ref.where("phone_number", "==", phone).limit(1).stream()
        phone_exists = any(query)

    return {"email_exists": email_exists, "phone_exists": phone_exists}


@accounts_router.post("")
def create_account(user_data: ExtendedUserCreate):
    try:
        # 1. Role validation
        if user_data.role not in ["admin", "customer"]:
            raise HTTPException(status_code=400, detail="Invalid role.")

        # 2. If admin, require secret key
        if user_data.role == "admin":
            if user_data.secret_key != os.getenv("ADMIN_CREATION_SECRET"):
                raise HTTPException(
                    status_code=403, detail="Unauthorized to create admin account."
                )

        # 3. Create Firebase user
        user_record = auth.create_user(
            email=user_data.email,
            password=user_data.password,
            display_name=user_data.display_name,
            phone_number=user_data.phone_number,
        )

        # 4. Set custom claim
        auth.set_custom_user_claims(user_record.uid, {"role": user_data.role})

        # 5. Store extended profile in Firestore
        firestore.client().collection("users").document(user_record.uid).set(
            {
                "email": user_data.email,
                "phone_number": user_data.phone_number,
                "first_name": user_data.first_name,
                "last_name": user_data.last_name,
                "company": user_data.company,
                "address": user_data.address,
                "country": user_data.country,
                "zip_code": user_data.zip_code,
                "role": user_data.role,
            }
        )

        return {
            "message": f"{user_data.role.capitalize()} account created successfully",
            "uid": user_record.uid,
            "email": user_record.email,
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@accounts_router.delete("/{uid}")
def delete_account(uid: str):
    """
    Delete the user from Firebase by UID.
    """
    try:
        auth.delete_user(uid)
        return {"message": f"Account with UID {uid} deleted successfully."}
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))


@accounts_router.post("/login")
def login_user(user_data=Depends(verify_firebase_token)):
    # user_data contains info like uid, email, etc.
    return {"message": "Login successful", "user": user_data}
