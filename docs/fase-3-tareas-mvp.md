# Fase 3: Desarrollo MVP — 10 Tareas Técnicas

Cada sección es un **Issue** independiente que puede abrirse en GitHub.  
Las tareas están ordenadas por dependencias: completa las anteriores antes de empezar la siguiente.

---

## Issue #1 — Renderizado SVG de Componentes en el Canvas

**Etiqueta:** `frontend` `mvp`

### Descripción
`CircuitCanvas.jsx` actualmente solo renderiza elementos vacíos (`<g>`).  
Hay que implementar un sub-componente SVG por tipo de componente que dibuje
el símbolo estándar del componente en la posición almacenada en el store.

### Archivos afectados
- `frontend/src/components/Circuit/CircuitCanvas.jsx`
- `frontend/src/components/Circuit/` (nuevo: `ElementSymbol.jsx`)

### Tareas concretas
1. Crear `ElementSymbol.jsx` con un `switch` sobre `el.type` que devuelva el símbolo SVG correspondiente:
   - **Resistor** – rectángulo con líneas de terminales
   - **Capacitor** – dos líneas paralelas con terminales
   - **Inductor** – serie de arcos
   - **Voltage Source** – círculo con `+`/`-`
   - **Current Source** – círculo con flecha
   - **Ground** – símbolo de tierra estándar
2. Integrar `ElementSymbol` dentro del `<g>` de `CircuitCanvas.jsx` usando `el.position.x` / `el.position.y` como `transform="translate(x, y)"`.
3. Mostrar el `id` del elemento como `<text>` debajo del símbolo.

### Criterios de aceptación
- [ ] Cada tipo de componente muestra su símbolo correcto en el canvas.
- [ ] Los símbolos se posicionan según `element.position.{x, y}`.
- [ ] El `id` del elemento es visible junto al símbolo.

---

## Issue #2 — Arrastrar y Soltar Componentes desde la Barra de Herramientas

**Etiqueta:** `frontend` `mvp`

### Descripción
El usuario debe poder arrastrar un componente desde `ElementToolbar` y soltarlo
en cualquier punto del canvas para añadirlo al circuito en esa posición exacta.

### Archivos afectados
- `frontend/src/components/Circuit/ElementToolbar.jsx`
- `frontend/src/components/Circuit/CircuitCanvas.jsx`
- `frontend/src/hooks/useCircuit.js`

### Tareas concretas
1. En `ElementToolbar.jsx`, añadir `onDragStart` que guarde `el.type` en `event.dataTransfer`.
2. En `CircuitCanvas.jsx`, manejar `onDrop` y `onDragOver` en el `<svg>`:
   - Calcular la posición relativa del cursor dentro del SVG.
   - Llamar a `addElement(type, { x, y })` del hook `useCircuit`.
3. En `useCircuit.js`, actualizar `addElement` para que acepte `(type, position)` y genere un `id` único usando `crypto.randomUUID()` (p.ej. `${type}_${crypto.randomUUID().slice(0,8)}`), con las `properties` por defecto del tipo.

### Criterios de aceptación
- [ ] Arrastrar un componente desde la barra y soltarlo en el canvas lo añade en esa posición.
- [ ] Cada elemento creado tiene un `id` único y propiedades por defecto correctas.
- [ ] Hacer clic en la barra (sin arrastrar) también añade el elemento en una posición por defecto.

---

## Issue #3 — Dibujo de Cables entre Terminales de Elementos

**Etiqueta:** `frontend` `mvp`

### Descripción
Los elementos del circuito tienen terminales (pines).  
Hay que permitir al usuario conectar dos terminales con un cable haciendo clic en
uno y luego en otro, dibujando una línea SVG entre ellos.

### Archivos afectados
- `frontend/src/components/Circuit/CircuitCanvas.jsx`
- `frontend/src/store/circuitStore.js`

### Tareas concretas
1. Definir los puntos de terminal de cada tipo de elemento en `ElementSymbol.jsx`
   (p.ej. un resistor tiene terminales en `(-20, 0)` y `(20, 0)` relativos a su posición).
2. Renderizar pequeños círculos (`<circle r="4">`) en cada terminal.
3. En `CircuitCanvas.jsx`, implementar un modo "conectar":
   - Primer clic en un terminal → almacena `pendingConnection = { elementId, terminalIndex }`.
   - Segundo clic en otro terminal → crea una conexión y la guarda en el store.
4. En `circuitStore.js`, extender `connections` para guardar objetos:
   ```js
   { id: "w1", from: { elementId: "R1", terminal: 0 }, to: { elementId: "VS1", terminal: 1 } }
   ```
5. Renderizar cada conexión como un `<line>` entre las coordenadas absolutas de ambos terminales.

### Criterios de aceptación
- [ ] Al hacer clic en un terminal, se resalta como "pendiente".
- [ ] Al hacer clic en un segundo terminal se dibuja un cable entre ellos.
- [ ] El cable se actualiza si se mueve algún elemento.
- [ ] Las conexiones se almacenan en el store con el formato definido.

---

## Issue #4 — Asignación Automática de Nodos al Construir el Circuito

**Etiqueta:** `frontend` `backend` `mvp`

### Descripción
El solver `DCNodalSolver` requiere que cada elemento tenga un array `nodes`
con los identificadores de los nodos a los que está conectado.  
Hay que calcular esos nodos automáticamente cada vez que el usuario añade o
elimina un cable.

### Archivos afectados
- `frontend/src/utils/circuitUtils.js`
- `frontend/src/hooks/useCircuit.js`
- `frontend/src/store/circuitStore.js`

### Tareas concretas
1. En `circuitUtils.js`, implementar `assignNodes(elements, connections)`:
   - Recorre las conexiones para construir un grafo de terminales.
   - Aplica *union-find* (o BFS simple) para agrupar terminales conectados en el mismo nodo.
   - Asigna un identificador de nodo (`"n0"`, `"n1"`, …) a cada grupo.
   - El terminal conectado a un elemento `ground` recibe el id `"GND"`.
   - Devuelve una copia de `elements` donde cada elemento tiene su `nodes` actualizado.
2. En `useCircuit.js`, llamar a `assignNodes` tras cada `addElement`, `removeElement` o cambio de conexiones.
3. Añadir un test unitario en `frontend/src/utils/circuitUtils.test.js` que verifique la asignación de nodos para un divisor de voltaje simple.

### Criterios de aceptación
- [ ] Un divisor de voltaje (VS + 2 resistores + GND) genera los `nodes` correctos antes de enviarlos al solver.
- [ ] Eliminar un cable actualiza los nodos inmediatamente.
- [ ] El test unitario pasa.

---

## Issue #5 — Panel de Propiedades con Validación y Etiquetas de Unidades

**Etiqueta:** `frontend` `mvp`

### Descripción
`PropertiesPanel.jsx` muestra inputs genéricos sin unidades ni validación.
Hay que mejorarlo para que cada tipo de componente muestre sus propiedades con
nombre legible, unidad y validación del valor.

### Archivos afectados
- `frontend/src/components/Controls/PropertiesPanel.jsx`
- `frontend/src/types/component.js`

### Tareas concretas
1. En `component.js`, exportar un objeto `COMPONENT_PROPERTIES` que mapee cada tipo a sus propiedades:
   ```js
   resistor: [{ key: 'resistance', label: 'Resistencia', unit: 'Ω', min: 0.001 }],
   capacitor: [{ key: 'capacitance', label: 'Capacitancia', unit: 'F', min: 1e-12 }],
   ...
   ```
2. En `PropertiesPanel.jsx`, usar `COMPONENT_PROPERTIES` para renderizar:
   - `<label>` con nombre y unidad.
   - `<input type="number">` con atributos `min` y `step`.
   - Mensaje de error si el valor es inválido (≤ 0 para resistencia).
3. Mostrar también el `id` del elemento con un campo de texto editable.

### Criterios de aceptación
- [ ] Cada tipo de componente muestra sus propiedades con nombre y unidad.
- [ ] Un valor de resistencia ≤ 0 muestra un mensaje de error y no se propaga al store.
- [ ] Editar el `id` del elemento actualiza el store correctamente.

---

## Issue #6 — Controles de Simulación con Validación Pre-ejecución

**Etiqueta:** `frontend` `mvp`

### Descripción
`SimulationControls.jsx` no valida el circuito antes de enviarlo al backend.
Hay que añadir validación en el cliente para evitar llamadas API que fallen de forma predecible.

### Archivos afectados
- `frontend/src/components/Controls/SimulationControls.jsx`
- `frontend/src/utils/circuitUtils.js`

### Tareas concretas
1. En `circuitUtils.js`, implementar `validateCircuit(elements, connections)` que devuelva `{ valid: bool, errors: string[] }` comprobando:
   - El circuito contiene al menos un elemento.
   - Hay exactamente un elemento de tipo `ground`.
   - Todos los elementos tienen al menos dos terminales conectados.
   - Ningún resistor tiene resistencia ≤ 0.
   > **Nota:** esta regla de validación es la fuente de verdad para la restricción ya definida en `PropertiesPanel` (Issue #5); ambos componentes deben usar `validateCircuit` en lugar de duplicar la lógica.
2. En `SimulationControls.jsx`:
   - Recibir `elements` y `connections` como props.
   - Llamar a `validateCircuit` antes de habilitar el botón "Simular".
   - Mostrar la lista de errores bajo el botón cuando la validación falla.
   - Mostrar `solver` y `duration_ms` cuando la simulación termina con éxito.

### Criterios de aceptación
- [ ] El botón "Simular" está deshabilitado si el circuito no tiene tierra.
- [ ] Los errores de validación son visibles antes de hacer clic.
- [ ] Tras una simulación exitosa se muestra el tiempo de ejecución del solver.

---

## Issue #7 — Guardar y Cargar Circuitos (Integración CRUD Frontend-Backend)

**Etiqueta:** `frontend` `backend` `mvp`

### Descripción
El servicio `simulationService.js` ya tiene `saveCircuit` y `getCircuits`, pero
`SimulatorPage.jsx` no los usa.  
Hay que implementar la UI para guardar, listar y cargar circuitos guardados.

### Archivos afectados
- `frontend/src/pages/SimulatorPage.jsx`
- `frontend/src/hooks/useCircuit.js`
- `frontend/src/services/simulationService.js`

### Tareas concretas
1. En `SimulatorPage.jsx`, añadir:
   - Un campo de texto para el nombre del circuito.
   - Botón "Guardar" que llame a `saveCircuit({ name, elements, connections })`.
   - Un `<select>` o lista lateral que muestre los circuitos guardados (llamando a `getCircuits` al montar el componente).
   - Botón "Cargar" que ponga los `elements` y `connections` del circuito seleccionado en el store.
2. Manejar estados de carga y error para ambas operaciones.
3. Actualizar `simulationService.js` para añadir `updateCircuit(id, payload)` (la ruta `PUT /circuits/{id}` ya existe en el backend).

### Criterios de aceptación
- [ ] El usuario puede guardar el circuito actual con un nombre.
- [ ] La lista de circuitos guardados se muestra y actualiza tras cada guardado.
- [ ] Seleccionar y cargar un circuito restaura todos sus elementos y conexiones en el canvas.

---

## Issue #8 — Persistencia de Resultados de Simulación en el Backend

**Etiqueta:** `backend` `mvp`

### Descripción
El modelo `SimulationResult` existe en la base de datos pero el endpoint
`POST /simulation/run` no persiste los resultados.  
Hay que añadir un endpoint dedicado que ejecute la simulación *y* guarde el
resultado enlazado a un circuito guardado.

### Archivos afectados
- `backend/app/api/routes/simulation.py`
- `backend/app/db/models/simulation_result.py`
- `backend/app/schemas/simulation.py`
- `backend/app/api/routes/circuits.py`

### Tareas concretas
1. Revisar el modelo `SimulationResult` para confirmar que almacena:
   - `circuit_id` (FK a `Circuit`)
   - `results` (JSON con la lista de `SimulationResultItem`)
   - `solver` y `duration_ms`
   - `created_at`
2. En `simulation.py`, añadir el endpoint:
   ```
   POST /simulation/run/{circuit_id}
   ```
   que:
   - Recupera el circuito de la BD.
   - Ejecuta el solver con sus `elements` y `connections`.
   - Persiste un `SimulationResult` enlazado al circuito.
   - Devuelve `SimulationResultRead`.
3. En `circuits.py`, añadir:
   ```
   GET /circuits/{circuit_id}/simulations
   ```
   que devuelva el historial de simulaciones de un circuito.
4. Añadir tests en `backend/tests/test_simulation_api.py`.

### Criterios de aceptación
- [ ] `POST /simulation/run/{circuit_id}` guarda el resultado en la BD y lo devuelve.
- [ ] `GET /circuits/{id}/simulations` devuelve la lista de resultados históricos.
- [ ] Los tests cubren casos de circuito inexistente (404) y circuito inválido (422).

---

## Issue #9 — Historial de Simulaciones y Resaltado de Voltajes en el Canvas

**Etiqueta:** `frontend` `mvp`

### Descripción
Tras una simulación exitosa, el canvas debe mostrar visualmente el voltaje
calculado en cada nodo sobre el símbolo del componente.  
Además, `ResultsTable` debe presentar los resultados agrupados por tipo
(voltajes de nodo, corrientes de rama).

### Archivos afectados
- `frontend/src/components/shared/ResultsTable.jsx`
- `frontend/src/components/Circuit/CircuitCanvas.jsx`
- `frontend/src/pages/SimulatorPage.jsx`

### Tareas concretas
1. En `ResultsTable.jsx`, separar los resultados en dos secciones:
   - **Voltajes de nodo** (items cuyo `label` empieza por `V(`)
   - **Corrientes de rama** (items cuyo `label` empieza por `I(`)
2. En `CircuitCanvas.jsx`, aceptar una prop `nodeVoltages: { [nodeId]: number }` y,
   cuando esté disponible, mostrar un `<text>` con el voltaje junto a cada nodo.
3. En `SimulatorPage.jsx`, construir `nodeVoltages` a partir de los resultados
   de la simulación y pasarlo a `CircuitCanvas`.
4. Si el Issue #8 está completo, añadir un botón "Ver historial" que cargue las
   simulaciones anteriores del circuito actual mediante
   `GET /circuits/{id}/simulations` y permita navegar entre ellas.

### Criterios de aceptación
- [ ] La tabla de resultados muestra dos secciones diferenciadas (voltajes y corrientes).
- [ ] Cada nodo del canvas muestra su voltaje calculado al terminar la simulación.
- [ ] (Si Issue #8 está completo) El historial de simulaciones es navegable.

---

## Issue #10 — Tests de Integración y Cobertura de la API

**Etiqueta:** `backend` `testing` `mvp`

### Descripción
Completar la cobertura de tests de la API REST para garantizar la estabilidad
del MVP antes de cualquier despliegue.

### Archivos afectados
- `backend/tests/test_circuits_api.py` (nuevo)
- `backend/tests/test_simulation_api.py` (nuevo o ampliar)
- `backend/tests/test_solver.py` (ampliar casos)

### Tareas concretas
1. Crear `test_circuits_api.py` usando `httpx.AsyncClient` + la app FastAPI para probar:
   - `POST /circuits` → 201 con circuito creado.
   - `GET /circuits/{id}` → 200 o 404.
   - `PUT /circuits/{id}` → actualización parcial con `CircuitUpdate`.
   - `DELETE /circuits/{id}` → 204 y confirmación de borrado.
2. Crear/ampliar `test_simulation_api.py` con:
   - Circuito válido (VS + 2 R + GND) → resultados de voltaje correctos.
   - Circuito sin nodo tierra → 422 con mensaje descriptivo.
   - Circuito con resistencia cero → 422.
   - Circuito vacío → 422.
3. En `test_solver.py`, añadir casos para:
   - Fuente de corriente.
   - Fuente de voltaje sin tierra explícita.
   - Circuito con múltiples nodos.
4. Verificar que `pytest --cov=app tests/` reporta una cobertura ≥ 80 % en `app/`.

### Criterios de aceptación
- [ ] `pytest tests/` pasa sin errores.
- [ ] Cobertura de `app/` ≥ 80 %.
- [ ] Los mensajes de error de la API son en español y describen el problema.
