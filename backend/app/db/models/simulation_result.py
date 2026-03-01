"""
SimulationResult ORM model – stores the output of each simulation run.
"""
import datetime

from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, JSON, String
from sqlalchemy.orm import relationship

from app.db.database import Base


class SimulationResult(Base):
    __tablename__ = "simulation_results"

    id = Column(Integer, primary_key=True, index=True)
    circuit_id = Column(Integer, ForeignKey("circuits.id"), nullable=False)
    solver = Column(String(64), nullable=False, default="dc_nodal")
    results = Column(JSON, nullable=False, default=list)
    duration_ms = Column(Float, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.datetime.utcnow())

    circuit = relationship("Circuit", back_populates="simulations")

    def __repr__(self):
        return f"<SimulationResult id={self.id} circuit_id={self.circuit_id}>"
