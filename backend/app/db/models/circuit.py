"""
Circuit ORM model – persists circuit designs in the database.
"""
import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, JSON, String
from sqlalchemy.orm import relationship

from app.db.database import Base


class Circuit(Base):
    __tablename__ = "circuits"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(String(1024), nullable=True)
    elements = Column(JSON, nullable=False, default=list)
    connections = Column(JSON, nullable=False, default=list)
    created_at = Column(DateTime, default=lambda: datetime.datetime.utcnow())
    updated_at = Column(DateTime, default=lambda: datetime.datetime.utcnow(), onupdate=lambda: datetime.datetime.utcnow())

    simulations = relationship("SimulationResult", back_populates="circuit", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Circuit id={self.id} name={self.name!r}>"
