# ⚡ Aplicación de Simulación de Circuitos Eléctricos

![Python](https://img.shields.io/badge/Python-3.11%2B-blue?logo=python)
![FastAPI](https://img.shields.io/badge/FastAPI-0.110-009688?logo=fastapi)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker)
![License](https://img.shields.io/badge/License-MIT-green)

Aplicación web interactiva para diseñar y simular circuitos eléctricos. El usuario puede arrastrar y conectar componentes (resistencias, condensadores, inductores, fuentes de tensión y corriente) sobre un lienzo SVG, lanzar un análisis DC nodal en el backend y visualizar los resultados (tensiones de nodo y corrientes de rama) en tiempo real.

> **Audiencia:** estudiantes de ingeniería eléctrica/electrónica, docentes y cualquier persona que quiera experimentar con circuitos sin necesitar hardware físico.

---

## 📋 Tabla de contenidos

1. [Objetivos del proyecto](#-objetivos-del-proyecto)
2. [Capturas de pantalla](#-capturas-de-pantalla)
3. [Arquitectura y estructura](#-arquitectura-y-estructura)
4. [Tecnologías](#-tecnologías)
5. [Requisitos previos](#-requisitos-previos)
6. [Instalación y puesta en marcha](#-instalación-y-puesta-en-marcha)
   - [Con Docker Compose (recomendado)](#con-docker-compose-recomendado)
   - [Desarrollo local (sin Docker)](#desarrollo-local-sin-docker)
7. [Variables de entorno](#-variables-de-entorno)
8. [API REST – resumen de endpoints](#-api-rest--resumen-de-endpoints)
9. [Ejecutar los tests](#-ejecutar-los-tests)
10. [Roadmap](#-roadmap)
11. [Contribuir](#-contribuir)
12. [Licencia](#-licencia)

---

## 🎯 Objetivos del proyecto

| # | Objetivo |
|---|----------|
| 1 | **Facilitar el aprendizaje** de análisis de circuitos eléctricos de forma interactiva y visual. |
| 2 | **Reducir la barrera de entrada** a la simulación: sin instalación de software pesado (SPICE, Multisim, etc.). |
| 3 | **Demostrar una arquitectura fullstack moderna** (React + FastAPI + Docker) lista para ser extendida. |
| 4 | **Proveer un motor de análisis** basado en el método nodal modificado (MNA) con NumPy, preciso y extensible. |
| 5 | **Persistir diseños** en base de datos para que el usuario pueda guardar, cargar y comparar circuitos. |

---

## 🖼️ Capturas de pantalla

> Las capturas se añadirán conforme avance el desarrollo. Puedes contribuir con screenshots abriendo un PR.

| Vista | Descripción |
|-------|-------------|
| _(próximamente)_ | Lienzo interactivo de circuitos |
| _(próximamente)_ | Panel de resultados de simulación |

---

## 🗂️ Arquitectura y estructura

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
├── docs/                             # Documentación adicional del proyecto
├── docker-compose.yml                # Orquestación de servicios
└── README.md
```

---

## 🛠️ Tecnologías

| Capa | Tecnología | Versión |
|------|-----------|---------|
| Frontend | React · React Router · Zustand | 18 / 6 / 4 |
| Bundler | Vite | 5 |
| Backend | FastAPI · Uvicorn · Pydantic | 0.110 / 0.29 / v2 |
| Base de datos | PostgreSQL (prod) · SQLite (dev) | 16 / built-in |
| ORM | SQLAlchemy · Alembic | 2 / 1.13 |
| Motor numérico | NumPy · SciPy | 1.26 / 1.12 |
| Contenedores | Docker · Docker Compose | 24+ / v2 |
| Tests | pytest · pytest-asyncio | 8 / 0.23 |

---

## ✅ Requisitos previos

### Para ejecutar con Docker (recomendado)

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) ≥ 24  
- [Docker Compose](https://docs.docker.com/compose/) v2 (incluido en Docker Desktop)

### Para desarrollo local

- [Python](https://www.python.org/downloads/) ≥ 3.11  
- [Node.js](https://nodejs.org/) ≥ 18 (incluye `npm`)  
- [Git](https://git-scm.com/)  
- *(Opcional)* [PostgreSQL](https://www.postgresql.org/) ≥ 14 — el backend usará SQLite si no se configura

---

## 🚀 Instalación y puesta en marcha

### Con Docker Compose (recomendado)

```bash
# 1. Clonar el repositorio
git clone https://github.com/VirginiaXiao148/Aplicaci-n-de-Simulaci-n-de-Circuitos-El-ctricos.git
cd Aplicaci-n-de-Simulaci-n-de-Circuitos-El-ctricos

# 2. Construir y levantar los contenedores
docker-compose up --build
```

Una vez que los tres servicios estén en marcha:

| Servicio | URL |
|---------|-----|
| Aplicación React | <http://localhost:3000> |
| API FastAPI | <http://localhost:8000> |
| Docs Swagger UI | <http://localhost:8000/api/docs> |
| Docs ReDoc | <http://localhost:8000/api/redoc> |

Para detener los contenedores:

```bash
docker-compose down
# Eliminar también los volúmenes (base de datos):
docker-compose down -v
```

---

### Desarrollo local (sin Docker)

#### Backend

```bash
# 1. Crear y activar entorno virtual
cd backend
python -m venv .venv

# Linux / macOS
source .venv/bin/activate
# Windows (PowerShell)
# .venv\Scripts\Activate.ps1

# 2. Instalar dependencias
pip install -r requirements.txt

# 3. Copiar el archivo de variables de entorno y ajustar valores
cp .env.example .env   # ver sección "Variables de entorno"

# 4. Iniciar el servidor de desarrollo
uvicorn main:app --reload --port 8000
```

La API quedará disponible en <http://localhost:8000>.

#### Frontend

```bash
# En otra terminal
cd frontend

# 1. Instalar dependencias de Node
npm install

# 2. Iniciar el servidor de desarrollo
npm run dev
```

La aplicación React quedará disponible en <http://localhost:3000>.

---

## 🔐 Variables de entorno

Crea un archivo `backend/.env` (o configura las variables directamente en `docker-compose.yml`) con los siguientes valores:

| Variable | Descripción | Valor por defecto |
|----------|-------------|-------------------|
| `DATABASE_URL` | Cadena de conexión SQLAlchemy | `sqlite:///./dev.db` |
| `CORS_ORIGINS` | Lista JSON de orígenes permitidos | `["http://localhost:3000"]` |
| `SECRET_KEY` | Clave secreta para tokens (uso futuro) | *(sin valor por defecto)* |

Ejemplo de `backend/.env`:

```env
DATABASE_URL=sqlite:///./dev.db
CORS_ORIGINS=["http://localhost:3000"]
SECRET_KEY=cambia-esta-clave-en-producción
```

---

## 📡 API REST – resumen de endpoints

La documentación interactiva completa está disponible en Swagger UI (`/api/docs`) una vez que el backend esté en ejecución.

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/circuits` | Listar todos los circuitos guardados |
| `POST` | `/api/circuits` | Crear un nuevo circuito |
| `GET` | `/api/circuits/{id}` | Obtener un circuito por ID |
| `PUT` | `/api/circuits/{id}` | Actualizar un circuito |
| `DELETE` | `/api/circuits/{id}` | Eliminar un circuito |
| `POST` | `/api/simulation/run` | Ejecutar el análisis DC nodal |

---

## 🧪 Ejecutar los tests

```bash
cd backend

# Activar entorno virtual si aún no está activo
source .venv/bin/activate   # Linux / macOS

# Ejecutar la suite completa
pytest tests/ -v

# Con reporte de cobertura (requiere pytest-cov)
pytest tests/ -v --cov=app --cov-report=term-missing
```

---

## 🗺️ Roadmap

### v0.1 – MVP ✅ (estado actual)
- [x] Lienzo SVG interactivo para colocar y conectar componentes
- [x] Componentes soportados: Resistor, Capacitor, Inductor, Fuente de tensión, Fuente de corriente, Tierra
- [x] Motor de análisis nodal DC (MNA) con NumPy
- [x] API REST con FastAPI (CRUD de circuitos + endpoint de simulación)
- [x] Persistencia básica con SQLAlchemy (SQLite en dev / PostgreSQL en prod)
- [x] Dockerización completa con Docker Compose

### v0.2 – Mejoras de UX 🔄 (en progreso)
- [ ] Interfaz de arrastrar y soltar mejorada (snap-to-grid, auto-routing de cables)
- [ ] Panel de propiedades para editar valores de componentes en línea
- [ ] Exportar el circuito como imagen (SVG / PNG)
- [ ] Mensajes de error descriptivos en la UI cuando la simulación falla

### v0.3 – Análisis avanzado 📐 (planificado)
- [ ] Análisis AC (respuesta en frecuencia, diagramas de Bode)
- [ ] Análisis transitorio (simulación en el tiempo con capacitores e inductores)
- [ ] Soporte para amplificadores operacionales y transistores (BJT, MOSFET)
- [ ] Visualización de ondas con gráficas interactivas (Chart.js / Recharts)

### v0.4 – Colaboración y comunidad 🤝 (futuro)
- [ ] Autenticación de usuarios (JWT)
- [ ] Galería pública de circuitos compartidos
- [ ] Modo de exportación a SPICE netlist
- [ ] Soporte multilenguaje (i18n) – inglés y español

---

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Sigue estos pasos:

1. Haz un **fork** del repositorio.
2. Crea una rama descriptiva: `git checkout -b feature/mi-nueva-funcionalidad`.
3. Realiza tus cambios y añade tests cuando corresponda.
4. Asegúrate de que todos los tests pasan: `pytest tests/ -v`.
5. Abre un **Pull Request** describiendo los cambios realizados.

Por favor, respeta el estilo de código existente y sigue el [Código de Conducta](https://www.contributor-covenant.org/es/version/2/1/code_of_conduct/).

---

## 📄 Licencia

Este proyecto está distribuido bajo la licencia **MIT**. Consulta el archivo [LICENSE](LICENSE) para más detalles.

---

<p align="center">Hecho con ❤️ para aprender electrónica de forma interactiva</p>

