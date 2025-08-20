from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from fastapi.responses import StreamingResponse
from .. import models, schemas, database
import io, csv, json
router = APIRouter(prefix="/images", tags=["Images"])

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()
@router.get("/unlabeled", response_model=list[schemas.ImageResponse])
def get_unlabeled_images(db: Session = Depends(get_db)):
    images = db.query(models.Image).all()
    # Filtrar las que no tienen etiquetas
    unlabeled = [img for img in images if len(img.tags) == 0]
    return unlabeled

@router.post("/", response_model=schemas.ImageResponse)
def create_image(image: schemas.ImageCreate, db: Session = Depends(get_db)):
    db_image = db.query(models.Image).filter_by(url=image.url).first()
    if db_image:
        raise HTTPException(status_code=400, detail="Image already exists")
    
    db_image = models.Image(url=image.url)
    for tag_name in image.tags:
        tag = db.query(models.Tag).filter_by(name=tag_name).first()
        if not tag:
            tag = models.Tag(name=tag_name)
        db_image.tags.append(tag)

    db.add(db_image)
    db.commit()
    db.refresh(db_image)
    return db_image
@router.get("/export/json")
def export_json(db: Session = Depends(get_db)):
    images = db.query(models.Image).all()
    data = [
        {"id": img.id, "url": img.url, "tags": [t.name for t in img.tags]}
        for img in images
    ]
    return data

@router.get("/export/csv")
def export_csv(db: Session = Depends(get_db)):
    images = db.query(models.Image).all()
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["id", "url", "tags"])
    for img in images:
        writer.writerow([img.id, img.url, "|".join([t.name for t in img.tags])])
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=clasificacion.csv"},
    )
@router.get("/", response_model=list[schemas.ImageResponse])
def get_images(db: Session = Depends(get_db)):
    return db.query(models.Image).all()

@router.post("/{image_id}/tags", response_model=schemas.ImageResponse)
def add_tags(image_id: int, tags: list[str], db: Session = Depends(get_db)):
    image = db.query(models.Image).filter_by(id=image_id).first()
    if not image:
        raise HTTPException(status_code=404, detail="Image not found")
    
    for tag_name in tags:
        tag = db.query(models.Tag).filter_by(name=tag_name).first()
        if not tag:
            tag = models.Tag(name=tag_name)
        if tag not in image.tags:
            image.tags.append(tag)

    db.commit()
    db.refresh(image)
    return image
