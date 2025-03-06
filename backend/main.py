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

@app.delete("/laptops/{laptop_id}")
def delete_laptop(laptop_id: int, db: Session = Depends(get_db)):
    '''
    Delete laptop from database
    '''
    laptop = db.query(Laptop).filter(Laptop.id == laptop_id).first()
    if laptop is None:
        raise HTTPException(status_code=404, detail="Laptop not found")

    db.delete(laptop)
    db.commit()
    return {"message": "Laptop deleted successfully"}

@app.put("/laptops/{laptop_id}")
def update_laptop(laptop_id: int, laptop_update: LaptopUpdate, db: Session = Depends(get_db)):
    '''
    Update laptop in database
    '''
    laptop = db.query(Laptop).filter(Laptop.id == laptop_id).first()
    if laptop is None:
        raise HTTPException(status_code=404, detail="Laptop not found")

    update_data = laptop_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(laptop, key, value)

    db.commit()
    db.refresh(laptop)

    return {"message": "Laptop updated successfully", "laptop": laptop}

    