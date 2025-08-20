from sqlalchemy.orm import Session
from . import models, schemas
from datetime import datetime

def get_images(db: Session, skip: int = 0, limit: int = 1):
    return db.query(models.Image).offset(skip).limit(limit).all()

def get_image(db: Session, image_id: int):
    return db.query(models.Image).filter(models.Image.id == image_id).first()

def get_filters(db: Session):
    return db.query(models.Filter).all()

def create_filter(db: Session, filter: schemas.FilterCreate):
    db_filter = models.Filter(name=filter.name)
    db.add(db_filter)
    db.commit()
    db.refresh(db_filter)
    return db_filter

def add_filter_to_image(db: Session, image_id: int, filter_id: int):
    image = get_image(db, image_id)
    filter = db.query(models.Filter).filter(models.Filter.id == filter_id).first()
    if image and filter:
        image.filters.append(filter)
        image.processed_at = datetime.now()  # Marcar como procesada
        db.commit()
        db.refresh(image)
    return image

def get_processed_images(db: Session):
    return db.query(models.Image).filter(models.Image.processed_at.isnot(None)).all()

def get_unprocessed_images(db: Session):
    return db.query(models.Image).filter(models.Image.processed_at.is_(None)).all()
