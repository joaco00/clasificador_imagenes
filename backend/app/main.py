from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from . import models, schemas, crud, database

models.Base.metadata.create_all(bind=database.engine)

app = FastAPI()

# 🔹 Permitir frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/images/", response_model=list[schemas.Image])
def read_images(skip: int = 0, limit: int = 1, db: Session = Depends(get_db)):
    return crud.get_images(db, skip=skip, limit=limit)

@app.get("/images/processed", response_model=list[schemas.Image])
def read_processed_images(db: Session = Depends(get_db)):
    return crud.get_processed_images(db)

@app.get("/images/unprocessed", response_model=list[schemas.Image])
def read_unprocessed_images(db: Session = Depends(get_db)):
    return crud.get_unprocessed_images(db)

@app.get("/filters/", response_model=list[schemas.Filter])
def read_filters(db: Session = Depends(get_db)):
    return crud.get_filters(db)

@app.post("/filters/", response_model=schemas.Filter)
def create_filter(filter: schemas.FilterCreate, db: Session = Depends(get_db)):
    return crud.create_filter(db=db, filter=filter)

@app.post("/images/{image_id}/filters/{filter_id}", response_model=schemas.Image)
def add_filter(image_id: int, filter_id: int, db: Session = Depends(get_db)):
    return crud.add_filter_to_image(db, image_id=image_id, filter_id=filter_id)

@app.put("/filters/{filter_id}", response_model=schemas.Filter)
def update_filter_name(filter_id: int, filter: schemas.FilterCreate, db: Session = Depends(get_db)):
    db_filter = db.query(models.Filter).filter(models.Filter.id == filter_id).first()
    if not db_filter:
        raise HTTPException(status_code=404, detail="Etiqueta no encontrada")
    db_filter.name = filter.name
    db.commit()
    db.refresh(db_filter)
    return db_filter

@app.delete("/images/{image_id}/filters")
def remove_all_filters_from_image(image_id: int, db: Session = Depends(get_db)):
    image = db.query(models.Image).filter(models.Image.id == image_id).first()
    if not image:
        raise HTTPException(status_code=404, detail="Imagen no encontrada")
    image.filters = []
    db.commit()
    db.refresh(image)
    return {"ok": True}
