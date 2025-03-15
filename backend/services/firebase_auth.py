from pydantic import BaseModel, EmailStr

class ExtendedUserCreate(BaseModel):
    email: EmailStr
    password: str
    display_name: Optional[str] = None
    phone_number: str
    first_name: str
    last_name: str
    company: Optional[str] = None
    address: Optional[str] = None
    country: str
    zip_code: str