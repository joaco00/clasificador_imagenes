from sqlalchemy import Column, Integer, String, Table, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

image_filter = Table(
    "image_filter",
    Base.metadata,
    Column("image_id", Integer, ForeignKey("images.id")),
    Column("filter_id", Integer, ForeignKey("filters.id"))
)

class Image(Base):
    __tablename__ = "images"

    id = Column(Integer, primary_key=True, index=True)
    url = Column(String, unique=True, index=True)
    filters = relationship("Filter", secondary=image_filter, back_populates="images")
    processed_at = Column(DateTime, nullable=True)  # Nuevo campo

class Filter(Base):
    __tablename__ = "filters"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    images = relationship("Image", secondary=image_filter, back_populates="filters")
