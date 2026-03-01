# Aplicación de Simulación de Circuitos Eléctricos

Aplicación interactiva para simular circuitos eléctricos (componentes, valores, conexiones y condiciones). Generará una simulación visual y numérica para facilitar aprendizaje, experimentación y análisis.

## Estructura del Proyecto (Monorepositorios)

```
.
├── frontend/                         # Aplicación React (Vite)
│   ├── public/                       # Archivos estáticos
│   └── src/
│       ├── assets/                   # CSS global, imágenes, fuentes
│       ├── components/
│       │   ├── Circuit/              # Canvas SVG interactivo y barra de elementos
│       │   ├── Controls/             # Controles de simulación y panel de propiedades
│       │   └── shared/               # Componentes reutilizables (Spinner, ResultsTable…)
│       ├── hooks/                    # Custom hooks (useCircuit, useSimulation)
│       ├── pages/                    # Páginas (HomePage, SimulatorPage)
│       ├── services/                 # Llamadas a la API REST del backend
│       ├── store/                    # Estado global con Zustand
│       └── utils/                    # Funciones utilitarias
│
├── backend/                          # API FastAPI (Python)
│   ├── main.py                       # Punto de entrada – crea la app y registra routers
│   ├── requirements.txt
│   ├── Dockerfile
│   └── app/
│       ├── api/
│       │   └── routes/               # Endpoints REST (circuits.py, simulation.py)
│       ├── core/                     # Configuración y settings (config.py)
│       ├── db/
│       │   ├── database.py           # Motor SQLAlchemy y sesión
│       │   └── models/               # Modelos ORM (Circuit, SimulationResult)
│       ├── schemas/                  # Esquemas Pydantic para validación
│       └── simulation/
│           ├── engine/               # Motor de análisis nodal DC (solver.py)
│           └── components/           # Clases de componentes (Resistor, Capacitor…)
│
├── docs/                             # Documentación del proyecto
├── docker-compose.yml                # Orquestación de servicios
└── README.md
```

## Tecnologías

| Capa        | Tecnología                                |
|-------------|-------------------------------------------|
| Frontend    | React 18 · Vite · React Router · Zustand  |
| Backend     | FastAPI · Uvicorn · Pydantic v2           |
| Base de datos | SQLAlchemy · PostgreSQL (SQLite en dev) |
| Motor       | NumPy · SciPy (análisis nodal MNA)        |
| Contenedores | Docker · Docker Compose                  |

## Inicio Rápido

### Con Docker Compose

```bash
docker-compose up --build
```

* Frontend: http://localhost:3000  
* Backend API: http://localhost:8000  
* Documentación Swagger: http://localhost:8000/api/docs

### Desarrollo local

**Backend**
```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

**Frontend**
```bash
cd frontend
npm install
npm run dev
```

### Ejecutar tests del backend

```bash
cd backend
pip install -r requirements.txt
pytest tests/
```

