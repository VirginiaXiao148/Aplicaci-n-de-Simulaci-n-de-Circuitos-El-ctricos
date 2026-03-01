"""
Circuits CRUD API routes.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import Circuit
from app.schemas import CircuitCreate, CircuitRead, CircuitUpdate

router = APIRouter(prefix="/circuits", tags=["circuits"])


@router.get("/", response_model=list[CircuitRead])
def list_circuits(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(Circuit).offset(skip).limit(limit).all()


@router.post("/", response_model=CircuitRead, status_code=status.HTTP_201_CREATED)
def create_circuit(payload: CircuitCreate, db: Session = Depends(get_db)):
    circuit = Circuit(**payload.model_dump())
    db.add(circuit)
    db.commit()
    db.refresh(circuit)
    return circuit


@router.get("/{circuit_id}", response_model=CircuitRead)
def get_circuit(circuit_id: int, db: Session = Depends(get_db)):
    circuit = db.query(Circuit).filter(Circuit.id == circuit_id).first()
    if not circuit:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Circuit not found")
    return circuit


@router.put("/{circuit_id}", response_model=CircuitRead)
def update_circuit(circuit_id: int, payload: CircuitUpdate, db: Session = Depends(get_db)):
    circuit = db.query(Circuit).filter(Circuit.id == circuit_id).first()
    if not circuit:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Circuit not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(circuit, field, value)
    db.commit()
    db.refresh(circuit)
    return circuit


@router.delete("/{circuit_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_circuit(circuit_id: int, db: Session = Depends(get_db)):
    circuit = db.query(Circuit).filter(Circuit.id == circuit_id).first()
    if not circuit:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Circuit not found")
    db.delete(circuit)
    db.commit()
