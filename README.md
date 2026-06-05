# LeatherLoop

![CI Status](https://github.com/NotJcao17/LeatherLoop/actions/workflows/ci.yml/badge.svg?branch=main)

Plataforma de economía circular que digitaliza y revaloriza los residuos de corte (mermas) generados por la industria del calzado en León, Guanajuato. Artesanos y emprendedores acceden a materia prima a través de un sistema de reserva garantizada.

**ODS 12 — Producción y Consumo Responsables**  
Universidad La Salle Bajío · Innovación en Desarrollo Tecnológico · Feb–Jun 2026

---

## Stack

- **Next.js 16** (App Router, SSR)
- **TypeScript** (modo estricto)
- **Supabase** (PostgreSQL + Edge Functions)
- **ESLint** + **Jest**

## Estructura del repositorio

```
leatherloop/
├── .github/workflows/ci.yml   ← Pipeline CI/CD
├── src/app/                   ← Next.js App Router
├── tests/                     ← Pruebas unitarias
├── services/reservation-core/ ← Microservicio crítico (Fase 2)
├── claude.md                  ← Reglas de gobernanza para IA
└── README.md
```

## Comandos

```bash
npm install      # Instala dependencias
npm run dev      # Servidor de desarrollo (http://localhost:3000)
npm run build    # Build de producción
npm run lint     # Análisis estático ESLint
npm test         # Pruebas unitarias (Jest)
```

## Equipo

| Integrante | Rol |
|---|---|
| Juan Carlos Orozco Nieto | Líder de Proyecto / Scrum Master |
| Mauricio Aguilar Gómez | UX/UI Designer |
| Amir Goyri Espinoza | Desarrollador (DB y lógica de concurrencia) |
