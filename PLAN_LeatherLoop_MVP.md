# Plan de Proyecto — LeatherLoop (MVP / Demo Funcional)

> **Para el agente IA que ejecutará este plan:** Este documento es autosuficiente.
> Contiene todo lo necesario para construir el MVP sin consultar otras fuentes.
> Si algo no está aquí, NO lo inventes: respeta los contratos (sección 5), los
> nombres fijos y el reparto de trabajo. Lee la sección 11 (anti-conflictos)
> antes de hacer cualquier merge.

**Repositorio:** https://github.com/NotJcao17/LeatherLoop

---

## 0. Contexto general del proyecto

**LeatherLoop** es una plataforma web para digitalizar y revalorizar la merma de
cuero de la industria del calzado en León, Guanajuato (donde se concentra el 75%
de la producción nacional de calzado). El proyecto se fundamenta en el **ODS 12
(Producción y Consumo Responsables)**: convierte residuos de cuero en materia
prima accesible para artesanos, reduciendo el desperdicio y fortaleciendo la
economía circular de la región.

El usuario real son **artesanos y pequeñas empresas revalorizadoras del sector
cuero-calzado de León** (arquetipos: Don Ramiro, Don Simón, Don Ricardo). Operan
con dispositivos de gama baja, datos móviles limitados y conexión intermitente.
El dolor central que resuelve el producto es la **certeza**: confirmar de forma
segura y casi en tiempo real que un lote de merma sigue siendo suyo antes de
trasladarse (a veces una hora de carretera) a recogerlo.

> **Nota:** Este es un **proyecto escolar / demo de MVP**. Las decisiones técnicas
> priorizan demostrar el núcleo de valor y lo que suma en la evaluación, no un
> despliegue de producción. Por eso **no hay autenticación real**: el demo simula
> la identidad del usuario con un identificador fijo, y todo corre **en local
> (localhost)**. El despliegue en la nube queda documentado pero no ejecutado.

### El MVP demuestra UNA sola cosa: el Módulo de Reserva y Confirmación de Lotes

De todas las funcionalidades posibles de LeatherLoop, el demo implementa **solo el
flujo de reserva y confirmación garantizada de un lote**, porque es exactamente el
dolor central del Problem Statement. El usuario ve un catálogo de lotes, selecciona
uno, presiona **Apartar**, y el sistema lo bloquea de forma exclusiva y devuelve
una confirmación clara en español con el tiempo garantizado para recogerlo. Si otro
usuario intenta apartar el mismo lote, el sistema responde que ya no está disponible.

**Historia de usuario principal:**
> Como artesano del sector cuero-calzado de León, quiero apartar un lote de merma y
> recibir una confirmación clara de que es mío, para poder trasladarme a recogerlo
> con la certeza de que no lo perderé en el camino.

### Alcance — qué incluye y qué no

**Incluye:**
- Catálogo de lotes de merma disponibles (tipo de material, cantidad, ubicación, estado).
- Detalle de un lote seleccionado.
- Acción **"Apartar"** con bloqueo exclusivo y atómico del lote.
- Confirmación en pantalla: *"Tu lote está apartado. Tienes 45 minutos garantizados."*
- Manejo del conflicto: si el lote ya fue reservado, mensaje *"El lote fue reservado por otro usuario. Busca lotes alternativos."*
- Accesibilidad mínima del arquetipo: botones de acción ≥ 48×48px y texto de estado con alto contraste, legible en pantalla pequeña.
- Datos de prueba (seed) cargados localmente.
- Pipeline de CI en GitHub Actions (lint + test + build) que protege la rama `main`.

**No incluye (fuera de alcance del demo — NO construir):**
- Autenticación real de usuarios (se simula con un `userId` fijo).
- Sistema de reputación ni apelación de penalizaciones.
- Notificaciones push reales (la confirmación se muestra en pantalla, misma sesión).
- Inventario poblado por fabricantes reales (se usa seed local).
- Liberación automática del lote por servidor al cumplirse los 45 min (en el demo
  se simula con temporizador local; la versión server queda como siguiente paso).
- Despliegue real en la nube (planificado y documentado, no ejecutado).
- Pruebas de carga con múltiples clientes concurrentes (la concurrencia se valida
  a nivel de lógica de base de datos, no con prueba de carga).

---

## 1. Stack tecnológico

| Capa | Tecnología | Justificación (vinculada a las restricciones del usuario) |
|------|-----------|-----------------------------------------------------------|
| Framework web | **Next.js** (App Router) | SSR envía HTML ligero → menos carga en el CPU del dispositivo de gama baja y menor tiempo de visualización en conexión intermitente. |
| Lenguaje | **TypeScript estricto** (`strict: true`) | La sensibilidad de los datos de inventario y reserva hace innegociable el tipado estricto para prevenir fallos de lógica. |
| Backend / DB | **Supabase** (PostgreSQL + Edge Functions) | Backend unificado serverless; las Edge Functions distribuidas geográficamente reducen latencia en zonas rurales. |
| Concurrencia | **PostgreSQL `SELECT ... FOR UPDATE SKIP LOCKED`** | Gestiona reservas concurrentes de forma atómica en la BD: si un usuario aparta un lote, se bloquea instantáneamente para los demás sin colas que congelen la app. |
| Linting / formato | **ESLint + Prettier** | Limpieza y consistencia del código; ESLint corre en el pipeline. |
| Pruebas | **Jest** | Pruebas unitarias de la lógica de reserva (el riesgo crítico está en las condiciones de carrera, no en flujos de integración). |
| CI/CD | **GitHub Actions** (`.github/workflows/ci.yml`) | Lint + test + build en cada push a `main`/`develop` y en cada PR hacia `main`. Matrix Node.js **20 y 22**. |
| Cloud (planificado) | **Vercel** (plan Hobby) | Creadora de Next.js (despliegue nativo), integración directa con GitHub Actions, CDN global, gratis. **No se ejecuta en esta entrega.** |
| Control de versiones | **GitHub** — un solo repo, ramas `feature/*`, `develop`, `main` | Ver estrategia de ramas (sección 7) y entornos (sección 3). |

**Repositorio único:** `LeatherLoop` → https://github.com/NotJcao17/LeatherLoop
(a diferencia de proyectos con repos separados, aquí frontend, backend/DB y CI
viven en el mismo monorepo Next.js).

> **Nota importante sobre el runtime:** la matrix del pipeline es **Node.js 20 y 22**
> (NO 18 y 20). Una versión vieja de Node rompe el build de Next.js. Este fue un
> fallo real ya resuelto en el historial del repo (`fix: cambia matrix a Node.js 20 y 22`).

---

## 2. Pantallas / Vistas (3)

El demo es deliberadamente pequeño: tres vistas que cubren el flujo completo de reserva.

| # | Vista | Ruta | Qué hace |
|---|-------|------|----------|
| 1 | Catálogo de lotes | `/` (o `/lotes`) | Lista de lotes de merma disponibles: material, cantidad (kg), ubicación, estado. Cada tarjeta lleva a su detalle. |
| 2 | Detalle del lote | `/lotes/[id]` | Detalle completo del lote + botón **Apartar** (≥48×48px, alto contraste). |
| 3 | Confirmación / resultado | en `/lotes/[id]` (estado en la misma vista) | Tras apartar: mensaje de éxito con los 45 min, o mensaje de conflicto si ya estaba reservado. |

> El "estado" de cada lote (`disponible` / `reservado`) se refleja visualmente en
> el catálogo y en el detalle. La confirmación y el conflicto se muestran **dentro
> de la misma sesión**, sin navegar a otra página ni notificación externa.

---

## 3. Entornos, ramas y pipeline CI

> Esta sección es **contrato de operación del repositorio**. El agente debe configurarla
> tal cual antes de que el equipo empiece a mergear pantallas.

### 3.1 Definición de entornos (DEV / QA / PROD)

| Entorno | Rama de Git | Trigger del pipeline | Propósito |
|---------|-------------|----------------------|-----------|
| **DEV** | `develop` | push a `develop` | Integración continua del trabajo diario del equipo. |
| **QA** | Pull Request hacia `main` | `pull_request` hacia `main` | Validación previa antes de integrar a producción. |
| **PROD** | `main` | push a `main` (merge del PR) | Código estable listo para desplegar. |

### 3.2 Reglas de operación por entorno

| Entorno | ¿Quién puede hacer deploy? | Pruebas obligatorias | Política de fallo |
|---------|----------------------------|----------------------|-------------------|
| **DEV** | Cualquier integrante mediante push a `develop`. | Lint (ESLint), test unitario (Jest) y build. | Notifica el fallo pero **no** bloquea; el integrante corrige antes de abrir PR. |
| **QA** | El autor del PR; requiere revisión de al menos otro integrante. | Lint, test y build en Node.js **20 y 22**. | **Bloquea el merge.** Un PR con el pipeline en rojo no puede integrarse a `main`. |
| **PROD** | Solo mediante merge de un PR aprobado a `main`; nadie hace push directo. | Pipeline CI completo en verde. | **Bloquea el deploy.** La rama `main` está protegida y exige el pipeline en verde. |

### 3.3 Archivo `ENVIRONMENTS.md` (crear en la raíz del repo)

```markdown
# ENVIRONMENTS — LeatherLoop

Este documento define las reglas de operación de los
entornos del proyecto y su relación con el pipeline CI.

## DEV (rama: develop)
- Deploy: cualquier integrante mediante push a develop.
- Pruebas obligatorias: lint, test unitario y build.
- Política de fallo: notifica, no bloquea el trabajo.

## QA (rama: Pull Request hacia main)
- Deploy: autor del PR + revisión de un compañero.
- Pruebas obligatorias: lint, test y build en Node 20 y 22.
- Política de fallo: bloquea el merge si el pipeline falla.

## PROD (rama: main)
- Deploy: solo vía merge de PR aprobado. Sin push directo.
- Pruebas obligatorias: pipeline CI completo en verde.
- Política de fallo: rama protegida, bloquea el deploy.

## Relación con ci.yml
El trigger on.push (main, develop) cubre DEV y PROD.
El trigger on.pull_request (main) cubre QA.
```

### 3.4 Pipeline `.github/workflows/ci.yml` (contrato — crear tal cual)

```yaml
name: CI — LeatherLoop (Node.js)

# — TRIGGER ————————————————————————————————
# Se dispara en push a main y develop, y en PRs hacia main.
on:
  push:
    branches: ["main", "develop"]
  pull_request:
    branches: ["main"]

# — JOBS ——————————————————————————————————
jobs:
  build-and-test:
    runs-on: ubuntu-latest

    # Matrix strategy: ejecuta el mismo job con Node.js 20 y 22.
    strategy:
      matrix:
        node-version: [20, 22]

    steps:
      # PASO 1: Descarga el código del repositorio dentro de la VM
      - name: Checkout del código
        uses: actions/checkout@v4

      # PASO 2: Instala la versión de Node.js indicada en la matrix
      - name: Setup Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: "npm"

      # PASO 3: Instala dependencias de forma determinista
      - name: Instalar dependencias
        run: npm ci

      # PASO 4: Análisis estático con ESLint
      - name: Linting
        run: npm run lint

      # PASO 5: Pruebas unitarias con Jest
      - name: Pruebas unitarias
        run: npm test

      # PASO 6: Build de producción de Next.js
      - name: Build de producción
        run: npm run build
```

> **Sobre el job de deploy:** queda fuera de esta entrega (despliegue no ejecutado).
> Si se decidiera activar, se añade un job `deploy` con `needs: build-and-test` que
> publique en Vercel usando `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`
> como **GitHub Secrets**, nunca hardcodeados.

---

## 4. Modelo de base de datos (Supabase / PostgreSQL)

Dos tablas centrales para el demo. Las credenciales de Supabase van en variables de
entorno (`.env.local`), **nunca** en el código ni en `ci.yml`.

### `lotes`
| Columna | Tipo | Notas |
|---------|------|-------|
| id | uuid / serial | PK |
| material | text | ej. "Retal de cuero vacuno", "Recorte de forro" |
| cantidad_kg | numeric(10,2) | cantidad disponible en kilogramos |
| ubicacion | text | zona / planta de origen |
| estado | text | `'disponible'` o `'reservado'` (default `'disponible'`) |
| creado_en | timestamptz | default now() |

### `reservas`
| Columna | Tipo | Notas |
|---------|------|-------|
| id | uuid / serial | PK |
| lote_id | FK → lotes.id | el lote apartado |
| usuario_id | text | **identificador fijo simulado** (no hay auth real) |
| reservado_en | timestamptz | default now() |
| expira_en | timestamptz | reservado_en + 45 minutos (garantía de tiempo) |
| estado | text | `'activa'` (default) |

**Datos semilla (seed, carga una sola vez):** varios `lotes` en estado `disponible`
con materiales, cantidades y ubicaciones variadas, para poder demostrar CA-1, CA-2 y CA-3.
Una sola persona (Amir, dueño de la BD) define y carga el esquema y el seed, así que
no hay riesgo de choques en la base de datos.

### Lógica de reserva atómica (el corazón del MVP)

La operación "Apartar" debe ser **atómica** para evitar que dos usuarios reclamen el
mismo lote. Se usa el bloqueo nativo de PostgreSQL dentro de una transacción /
función de Supabase:

```sql
-- Pseudo-lógica de la función de reserva (RPC en Supabase / Edge Function)
BEGIN;
  -- Bloquea la fila del lote SOLO si está disponible; si otro la tiene, la salta.
  SELECT id FROM lotes
   WHERE id = :lote_id AND estado = 'disponible'
   FOR UPDATE SKIP LOCKED;

  -- Si no devolvió fila → el lote ya está tomado → responder conflicto (CA-2).
  -- Si devolvió fila:
  UPDATE lotes SET estado = 'reservado' WHERE id = :lote_id;
  INSERT INTO reservas (lote_id, usuario_id, expira_en)
  VALUES (:lote_id, :usuario_id, now() + interval '45 minutes');
COMMIT;
```

> Esta es la pieza con mayor riesgo del producto. Sobre **esta lógica** deben
> escribirse las pruebas unitarias de Jest (sección 9, tarea de backend).

---

## 5. Contratos de integración (definidos por adelantado)

Esta es la parte más importante para que las piezas de cada quien encajen sin choques.
**Todo en JSON usa camelCase. Estos nombres son fijos.** El frontend (Mauricio)
consume exactamente estos contratos; el backend (Amir) los produce exactamente así.

> Autenticación **simulada**: no hay token ni login. El frontend manda un
> `usuarioId` fijo (ej. `"artesano-demo-001"`) en las llamadas que lo requieren.

### Listar lotes — `GET /api/lotes`
```json
// Response 200
[
  {
    "id": "lote-001",
    "material": "Retal de cuero vacuno",
    "cantidadKg": 12.5,
    "ubicacion": "Zona Piel Verde, León",
    "estado": "disponible"
  }
]
```

### Detalle de lote — `GET /api/lotes/:id`
```json
// Response 200
{
  "id": "lote-001",
  "material": "Retal de cuero vacuno",
  "cantidadKg": 12.5,
  "ubicacion": "Zona Piel Verde, León",
  "estado": "disponible"
}
```

### Apartar lote — `POST /api/lotes/:id/reservar`
```json
// Request
{ "usuarioId": "artesano-demo-001" }

// Response 200 — éxito (CA-1)
{
  "ok": true,
  "loteId": "lote-001",
  "estado": "reservado",
  "minutosGarantizados": 45,
  "expiraEn": "2026-06-19T18:45:00Z",
  "mensaje": "Tu lote está apartado. Tienes 45 minutos garantizados."
}

// Response 409 — conflicto: ya reservado por otro (CA-2)
{
  "ok": false,
  "error": {
    "codigo": "LOTE_NO_DISPONIBLE",
    "mensaje": "El lote fue reservado por otro usuario. Busca lotes alternativos."
  }
}
```

### Formato único de error en toda la API
```json
{ "error": { "codigo": "LOTE_NO_DISPONIBLE", "mensaje": "..." } }
```
Códigos HTTP: 200 OK, 400 datos inválidos, 404 no encontrado, 409 conflicto
(lote ya reservado), 500 error del servidor.

> **Los mensajes en español de CA-1 y CA-2 son texto exacto de los criterios de
> aceptación. No los parafrasees.** El frontend los muestra tal cual los recibe.

---

## 6. Arquitectura del proyecto (Next.js — App Router)

Monorepo Next.js. Frontend, rutas de API y acceso a Supabase conviven, pero en
carpetas separadas por dueño para evitar choques.

```
LeatherLoop/
├── .github/
│   └── workflows/
│       └── ci.yml                 → pipeline CI (DUEÑO: Juan Carlos)
├── ENVIRONMENTS.md                → reglas de entornos (DUEÑO: Juan Carlos)
├── README.md                      → ODS 12, stack, instrucciones (DUEÑO: Juan Carlos)
├── src/
│   ├── app/
│   │   ├── page.tsx               → Catálogo de lotes (DUEÑO: Mauricio)
│   │   ├── lotes/
│   │   │   └── [id]/
│   │   │       └── page.tsx       → Detalle + Apartar + confirmación (DUEÑO: Mauricio)
│   │   └── api/
│   │       └── lotes/
│   │           ├── route.ts       → GET lista de lotes (DUEÑO: Amir)
│   │           └── [id]/
│   │               ├── route.ts        → GET detalle (DUEÑO: Amir)
│   │               └── reservar/
│   │                   └── route.ts    → POST apartar (DUEÑO: Amir)
│   ├── components/                → UI reutilizable: LoteCard, BotonApartar,
│   │                                MensajeConfirmacion (DUEÑO: Mauricio)
│   ├── lib/
│   │   ├── supabase.ts            → cliente Supabase (DUEÑO: Amir)
│   │   └── reservas.ts            → lógica de reserva atómica (DUEÑO: Amir)
│   ├── types/
│   │   └── index.ts               → tipos Lote, Reserva, respuestas API (DUEÑO: Amir, se define 1ª)
│   └── styles/
│       └── theme.ts / globals.css → tokens de diseño, contraste, tamaños (DUEÑO: Mauricio)
├── supabase/
│   ├── schema.sql                 → DDL de lotes y reservas (DUEÑO: Amir)
│   └── seed.sql                   → datos de prueba (DUEÑO: Amir)
├── __tests__/
│   └── reservas.test.ts           → pruebas unitarias Jest (DUEÑO: Amir)
├── .env.local.example             → plantilla de variables (DUEÑO: Juan Carlos)
├── eslint.config.mjs              → reglas ESLint (DUEÑO: Juan Carlos)
└── package.json                   → scripts lint/test/build (DUEÑO: Juan Carlos)
```

Librerías principales: Next.js (App Router), `@supabase/supabase-js`, TypeScript
estricto, Jest, ESLint + Prettier.

### Scripts obligatorios en `package.json` (los usa el pipeline)
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "lint": "next lint",
    "test": "jest"
  }
}
```

> Estos nombres de carpetas, archivos, tipos y rutas son **contrato**. Quien
> construye una pieza usa exactamente estos nombres para no chocar con los demás.

---

## 7. Estrategia de ramas (branching)

Una sola estructura, en el repo único. Tres ramas vivas: `main`, `develop` y las
`feature/*`. Cada `feature/*` se abre **desde `develop`** y se mergea de vuelta a
`develop` vía Pull Request; `develop` se promueve a `main` vía PR cuando está estable.

```
main      → rama estable y PROTEGIDA (solo merge de PR aprobado; sin push directo)
develop   → integración del trabajo diario (DEV)
feature/* → una rama por tarea; PR → develop
```

**Ramas feature del proyecto:**
`feature/setup-next` · `feature/ci-pipeline` · `feature/environments-readme` ·
`feature/db-schema` · `feature/seed` · `feature/lib-supabase` ·
`feature/api-lotes` · `feature/api-reservar` · `feature/logica-reserva` ·
`feature/tests-reservas` · `feature/design-system` · `feature/vista-catalogo` ·
`feature/vista-detalle` · `feature/componentes-ui`

Reglas: cada rama tiene **un único dueño** y nadie hace push directo a `main` ni a
`develop` (todo entra por PR).

---

## 8. División del trabajo (3 integrantes — áreas separadas)

Roles tomados directamente de la documentación del proyecto. Las áreas están
**deliberadamente separadas** para minimizar conflictos de merge: cada quien es
dueño de carpetas distintas.

| Integrante | Rol | Área / carpetas propias |
|------------|-----|-------------------------|
| **Juan Carlos Orozco Nieto** | Líder / Scrum Master / **DevOps** | `.github/`, `ENVIRONMENTS.md`, `README.md`, config raíz (ESLint, `package.json`, `.env.example`), protección de ramas. |
| **Amir Goyri Espinoza** | **Backend** | `src/app/api/`, `src/lib/`, `src/types/`, `supabase/`, `__tests__/`. Dueño de la BD y la lógica de reserva atómica. |
| **Mauricio Aguilar Gómez** | **Frontend / UX-UI** | `src/app/page.tsx`, `src/app/lotes/[id]/`, `src/components/`, `src/styles/`. Dueño de accesibilidad (≥48×48px, contraste). |

**Razonamiento del reparto:**
- Juan Carlos lleva la infraestructura (lo más bloqueante: repo, CI, entornos,
  protección de `main`). Deja la base lista antes de que el equipo construya encima.
- Amir lleva todo el backend porque el módulo de reserva es el núcleo de valor y la
  pieza más delicada (concurrencia atómica + pruebas unitarias).
- Mauricio lleva todo el frontend y es responsable de los criterios de accesibilidad
  del arquetipo (CA-3).

**Commits de los 3 garantizados:** cada integrante tiene ramas y carpetas propias,
así que los tres aparecen en el historial sin pisarse. La capa de **tipos**
(`src/types/index.ts`) la define Amir **primero** (es contrato compartido) para que
Mauricio construya el frontend contra tipos ya fijos.

---

## 9. Plan detallado por fases

Organizado por **dependencias**, no por calendario. Tres fases.

### Fase 0 — Cimientos (infraestructura + BD + tipos)

Aquí queda lista toda la base: repo, CI, entornos, esquema de BD, seed y la capa de
tipos/contratos. **Nada de UI todavía.**

| # | Tarea | Descripción | Asignado | Rama | Depende de |
|---|-------|-------------|----------|------|-----------|
| 1 | Setup Next.js | Boilerplate Next.js (App Router) + TypeScript estricto (`strict: true`) + estructura de carpetas de la sección 6. Scripts `dev/build/lint/test`. | Juan Carlos | `feature/setup-next` | — |
| 2 | ESLint + Prettier | Configurar `eslint.config.mjs` y Prettier; asegurar que `npm run lint` corra limpio. | Juan Carlos | `feature/setup-next` | #1 |
| 3 | Pipeline CI | Crear `.github/workflows/ci.yml` exactamente como la sección 3.4 (matrix Node 20 y 22; lint+test+build). | Juan Carlos | `feature/ci-pipeline` | #1 |
| 4 | Entornos + protección de ramas | Crear `ENVIRONMENTS.md` (sección 3.3), proteger `main`, exigir PR + pipeline verde. | Juan Carlos | `feature/environments-readme` | #3 |
| 5 | `.env.local.example` | Plantilla de variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`. Sin valores reales. | Juan Carlos | `feature/setup-next` | #1 |
| 6 | Tipos / contratos | `src/types/index.ts` con `Lote`, `Reserva` y los tipos de respuesta de API según sección 5. **Se define primero porque es contrato compartido.** | Amir | `feature/db-schema` | #1 |
| 7 | Esquema de BD | `supabase/schema.sql`: tablas `lotes` y `reservas` (sección 4) en el proyecto Supabase. | Amir | `feature/db-schema` | #1 |
| 8 | Seed de datos | `supabase/seed.sql`: varios lotes `disponible` variados para demostrar CA-1/2/3. | Amir | `feature/seed` | #7 |
| 9 | Cliente Supabase | `src/lib/supabase.ts`: conexión usando variables de entorno. | Amir | `feature/lib-supabase` | #5, #7 |

Las tareas de infraestructura (#1–#5) y las de BD/tipos (#6–#9) pueden avanzar en
paralelo desde el día uno. **Conviene mergear primero #1 (setup) y #6 (tipos)**,
porque tanto el backend como el frontend se construyen sobre ellos.

### Fase 1 — Backend y Frontend del módulo de reserva

Con los cimientos en `develop`, backend y frontend avanzan **en paralelo** contra
el contrato de la sección 5. El frontend puede arrancar con datos simulados (mock)
del contrato y conectar a la API real en cuanto los endpoints estén en `develop`.

| # | Tarea | Descripción | Asignado | Rama |
|---|-------|-------------|----------|------|
| 10 | Lógica de reserva atómica | `src/lib/reservas.ts`: implementa `FOR UPDATE SKIP LOCKED` (sección 4). Devuelve éxito o conflicto. | Amir | `feature/logica-reserva` |
| 11 | API listar/detalle de lotes | `GET /api/lotes` y `GET /api/lotes/:id` según contratos. | Amir | `feature/api-lotes` |
| 12 | API apartar lote | `POST /api/lotes/:id/reservar` (200 éxito con 45 min / 409 conflicto). Mensajes en español exactos. | Amir | `feature/api-reservar` |
| 13 | Pruebas unitarias | `__tests__/reservas.test.ts` (Jest): caso lote disponible → reservado (CA-1) y caso lote ya reservado → conflicto (CA-2). | Amir | `feature/tests-reservas` |
| 14 | Sistema de diseño | `src/styles/`: tokens de color de alto contraste, tipografía legible, tamaños táctiles. Componentes base. | Mauricio | `feature/design-system` |
| 15 | Componentes UI | `LoteCard`, `BotonApartar` (≥48×48px), `MensajeConfirmacion`, `MensajeConflicto`. | Mauricio | `feature/componentes-ui` |
| 16 | Vista Catálogo | `src/app/page.tsx`: lista de lotes consumiendo `GET /api/lotes`; estado visible por lote. | Mauricio | `feature/vista-catalogo` |
| 17 | Vista Detalle + Apartar | `src/app/lotes/[id]/page.tsx`: detalle + botón Apartar → `POST .../reservar`; muestra confirmación (45 min) o conflicto. | Mauricio | `feature/vista-detalle` |

### Fase 2 — Integración, verificación y cierre

| # | Tarea | Descripción | Asignado |
|---|-------|-------------|----------|
| 18 | Prueba extremo a extremo | Verificar el flujo completo en `localhost` contra la API y Supabase reales. | Mauricio + Amir |
| 19 | Verificar criterios de aceptación | Validar CA-1 (apartar → 45 min), CA-2 (segundo usuario rechazado), CA-3 (≥48×48px + alto contraste en móvil). Tabla de evidencia con capturas. | Todos |
| 20 | Manejo de errores y estados | Estados de carga / éxito / error consistentes en las vistas (incl. lote no encontrado, error de red). | Mauricio |
| 21 | Pipeline en verde | Confirmar que `npm run lint`, `npm test` y `npm run build` pasan en Node 20 y 22; badge passing en README. | Juan Carlos |
| 22 | README | ODS 12, descripción del stack, diagrama del stack, instrucciones de ejecución local (`npm ci`, `.env.local`, `npm run dev`), seed. | Juan Carlos |
| 23 | Video demo | Grabar el flujo completo (máx. 3 min): catálogo → detalle → Apartar → confirmación de 45 min → intento de segundo usuario rechazado. | Mauricio |
| 24 | Tag de versión | Tag `v1.0` en `main` tras la congelación de features. | Juan Carlos |

---

## 10. Resumen por integrante

```
👤 JUAN CARLOS OROZCO NIETO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Rol:                Líder / Scrum Master / DevOps
Área:               .github/, ENVIRONMENTS.md, README, config raíz
Ramas propias:      feature/setup-next, feature/ci-pipeline,
                    feature/environments-readme
Tareas:             #1, #2, #3, #4, #5, #21, #22, #24
Entregable clave:   Repo + pipeline CI (Node 20/22) + entornos +
                    rama main protegida, listos antes de construir encima
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

👤 AMIR GOYRI ESPINOZA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Rol:                Backend
Área:               src/app/api/, src/lib/, src/types/, supabase/, __tests__/
Ramas propias:      feature/db-schema, feature/seed, feature/lib-supabase,
                    feature/logica-reserva, feature/api-lotes,
                    feature/api-reservar, feature/tests-reservas
Tareas:             #6, #7, #8, #9, #10, #11, #12, #13
Entregable clave:   Módulo de reserva atómico (FOR UPDATE SKIP LOCKED) con
                    pruebas unitarias que cubren CA-1 y CA-2
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

👤 MAURICIO AGUILAR GÓMEZ
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Rol:                Frontend / UX-UI
Área:               src/app/page.tsx, src/app/lotes/[id]/, src/components/,
                    src/styles/
Ramas propias:      feature/design-system, feature/componentes-ui,
                    feature/vista-catalogo, feature/vista-detalle
Tareas:             #14, #15, #16, #17, #20, #23
Entregable clave:   Flujo visual catálogo → detalle → Apartar → confirmación,
                    cumpliendo accesibilidad del arquetipo (CA-3)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

Los 3 integrantes tienen commits en el repositorio. Áreas separadas = mínimos
conflictos de merge.

---

## 11. Guía anti-conflictos de merge

### Reglas del equipo
- Nadie hace push directo a `main` ni a `develop`; todo entra por Pull Request.
- Cada rama `feature/*` tiene un único dueño y sale de `develop`.
- Todo PR hacia `main` lo revisa al menos otro integrante (regla de QA).
- Antes de cada merge: `git pull origin develop` y resolver conflictos en local.
- Cualquier cambio a un contrato (tablas, endpoints, nombres JSON, tipos, rutas) se
  avisa al equipo **antes** de hacerlo.
- Un PR con el pipeline en rojo **no avanza** (la calidad es un requisito verificable,
  no negociable).

### Archivos de alto riesgo (varios podrían tocarlos)
| Archivo | Dueño / regla |
|---------|---------------|
| `src/types/index.ts` | Dueño: **Amir**. Es contrato compartido; se define completo en Fase 0 para no tocarlo después. Cambios se avisan al equipo. |
| `.github/workflows/ci.yml` | Dueño: **Juan Carlos**. Nadie más lo edita. |
| `ENVIRONMENTS.md` | Dueño: **Juan Carlos**. |
| `package.json` / config raíz / ESLint | Dueño: **Juan Carlos**. Otros piden agregar dependencias; no lo editan en paralelo. |
| `supabase/schema.sql` (esquema BD) | Dueño: **Amir**. Cualquier columna nueva la agrega él. |
| `src/styles/` (tema global) | Dueño: **Mauricio**. Cambios visuales globales pasan por él. |
| `src/lib/supabase.ts` | Dueño: **Amir**. |

### Orden de merges recomendado
```
1) setup-next  →  ci-pipeline + environments  (infra de Juan Carlos)
   db-schema (tipos + esquema) → seed → lib-supabase   (base de Amir)
                              ↓
        (recién aquí entra backend de lógica + frontend, en paralelo)
2) logica-reserva → api-lotes → api-reservar → tests-reservas   (Amir)
   design-system → componentes-ui → vista-catalogo → vista-detalle (Mauricio)
                              ↓
3) integración → manejo de errores → verificación CA → README → video
                              ↓
4) tag de versión v1.0 en main
```

### Checkpoints de integración (por avance, no por fecha)
- **Checkpoint 1:** Fase 0 en `develop` (repo + CI + entornos + esquema + seed + tipos).
  Recién aquí arrancan backend de lógica y frontend.
- **Checkpoint 2:** API real respondiendo y vistas conectadas; flujo completo de
  punta a punta en `localhost`.
- **Checkpoint 3:** Congelación de features, solo bug fixes; verificar CA-1/2/3;
  luego tag `v1.0` y promover `develop` → `main`.

---

## 12. Checklist de entrega

**Repositorio (Next.js)**
- [ ] El proyecto compila sin errores (`npm run build`).
- [ ] Las 3 vistas implementadas y navegables (catálogo, detalle, confirmación).
- [ ] Acción "Apartar" funciona con bloqueo atómico (`FOR UPDATE SKIP LOCKED`).
- [ ] CA-1: apartar lote disponible → mensaje "Tu lote está apartado. Tienes 45 minutos garantizados."
- [ ] CA-2: segundo usuario sobre lote reservado → "El lote fue reservado por otro usuario. Busca lotes alternativos."
- [ ] CA-3: botones de acción ≥48×48px y texto de estado de alto contraste, legible en móvil.
- [ ] Estados de carga, éxito y error en toda la app.
- [ ] Pruebas unitarias (Jest) de la lógica de reserva pasan.
- [ ] Sin credenciales hardcodeadas (variables de entorno / `.env.local`).
- [ ] Pipeline CI en verde (lint + test + build, Node 20 y 22); badge passing en README.
- [ ] `ENVIRONMENTS.md` en la raíz.
- [ ] Rama `main` protegida (sin push directo).
- [ ] Commits de los **3 integrantes** en el historial.
- [ ] README con ODS 12, stack e instrucciones de ejecución local.

**Entregables finales**
- [ ] Enlace al repositorio: https://github.com/NotJcao17/LeatherLoop
- [ ] Video (máx. 3 min) demostrando el flujo completo y el rechazo del segundo usuario.
- [ ] Documentación técnica P3 (ya entregada).

---

## 📋 SUPUESTOS

Cosas que se asumieron al armar el plan. Corregir si alguna no aplica:

1. **Sin autenticación real:** el demo simula al usuario con un `usuarioId` fijo
   (ej. `"artesano-demo-001"`); el MVP se concentra solo en el módulo de reserva.
   (Confirmado por el equipo.)
2. **Repo único (monorepo):** frontend, API y BD viven en
   `https://github.com/NotJcao17/LeatherLoop`, no en repos separados.
3. **Áreas separadas por dueño:** cada integrante posee carpetas distintas para
   minimizar conflictos de merge. (Confirmado por el equipo.)
4. **Ejecución local:** el demo corre en `localhost`; el despliegue en Vercel queda
   documentado pero no ejecutado en esta entrega.
5. **45 minutos simulado en cliente:** la liberación automática del lote al expirar
   el tiempo se simula con temporizador local; la versión por servidor (tarea
   programada en Supabase) queda como siguiente paso, fuera de alcance.
6. **Concurrencia validada a nivel de BD:** se garantiza con `FOR UPDATE SKIP LOCKED`
   y pruebas unitarias; no se hace prueba de carga con múltiples clientes concurrentes.
7. **Matrix Node.js 20 y 22:** el pipeline usa estas versiones (no 18/20), por la
   incompatibilidad ya resuelta del build de Next.js.
8. **Esquema de BD mínimo:** se modelan `lotes` y `reservas` con las columnas de la
   sección 4. Si la doc original define columnas adicionales, Amir las agrega como
   dueño del esquema y lo avisa al equipo.
9. **`usuarioId` como texto:** al no haber tabla de usuarios real, `reservas.usuario_id`
   es un identificador de texto simulado, no una FK.
