from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session

from db.models import *
from db.session import *
from schemas.laptops import *

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Welcome to Laptop Management API!"}

@app.post("/laptops/")
def create_laptop(laptop: LaptopCreate, db: Session = Depends(get_db)):
    '''
    Insert new laptop into database
    '''
    new_laptop = Laptop(**laptop.dict())
    db.add(new_laptop)
    db.commit()
    db.refresh(new_laptop)
    return {"message": "Laptop added successfully", "laptop": new_laptop}
