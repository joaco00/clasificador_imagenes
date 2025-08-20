import os
import sys
sys.path.append("..")

from app import models, database
from sqlalchemy.orm import Session

BASE_URL = "http://localhost:5173/images"
IMAGE_DIR = "../frontend/public/images"

def load_images():
    db = Session(bind=database.engine)
    for filename in os.listdir(IMAGE_DIR):
        if filename.lower().endswith((".jpg", ".jpeg", ".png", ".gif")):
            url = f"{BASE_URL}/{filename}"
            if not db.query(models.Image).filter_by(url=url).first():
                db.add(models.Image(url=url))
                print(f"Agregada: {url}")
    db.commit()
    db.close()

if __name__ == "__main__":
    models.Base.metadata.create_all(bind=database.engine)
    load_images()
