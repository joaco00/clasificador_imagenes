from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class FilterBase(BaseModel):
    name: str

class FilterCreate(FilterBase):
    pass

class Filter(FilterBase):
    id: int
    class Config:
        from_attributes = True

class ImageBase(BaseModel):
    url: str

class ImageCreate(ImageBase):
    pass

class Image(ImageBase):
    id: int
    filters: List[Filter] = []
    processed_at: Optional[datetime] = None  # Nuevo campo
    class Config:
        from_attributes = True
