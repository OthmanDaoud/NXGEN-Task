# NXGEN Task

A full-stack IoT dashboard for registering devices and exploring time-series sensor data.  
Built with React, Node.js, PostgreSQL, and Docker.

## Live Deployment

This project is deployed on Railway: [IoT Pulse — Device Dashboard](https://amusing-connection-production-d146.up.railway.app/)

---

## 1. Setup

### Requirements

- Docker
- Docker Compose

### Run with Docker

From the project root:

```bash
docker compose up --build
```

This starts three services:

| Service     | URL                   |
| ----------- | --------------------- |
| Frontend    | http://localhost:5173 |
| Backend API | http://localhost:3000 |
| PostgreSQL  | localhost:5432        |

**Bash**

```bash
docker compose down -v && docker compose up --build
```


## Seed Data (auto on backend startup)

Startup sequence:

1. `prisma generate`
2. `prisma migrate deploy`
3. `prisma db seed`
4. start API

Seed includes:

- 2 demo devices
- readings from Jan-Apr 2026
- 6-hour intervals
- deterministic IDs + upsert-style updates (safe to rerun)

Note: newly created devices start empty until you add readings.

## Local Dev

Backend (`nxgen-task-backend`):

```bash
npm install
npx prisma generate
npx prisma migrate deploy
npx prisma db seed
npm run dev
```

Required env:

```env
DATABASE_URL=postgresql://test:test123456@localhost:5432/nxgen_task
```

Frontend (`nxgen-task-frontend`):

```bash
npm install
npm run dev
```

Required env:

```env
VITE_API_BASE_URL=http://localhost:3000
```

### Database Schema

Managed by Prisma. Migrations are in `nxgen-task-backend/prisma/migrations/`.

| Table         | Columns                                       |
| ------------- | --------------------------------------------- |
| `devices`     | id, name, created_at                          |
| `device_data` | id, device_id, metric, unit, value, timestamp |

---

## 2. Usage

### Backend API

#### Create a device

```bash
curl -X POST http://localhost:3000/devices -H "Content-Type: application/json" -d "{\"name\":\"sensor-a\"}"
```

List devices:

```bash
curl http://localhost:3000/devices
```

Add reading:

```bash
curl -X POST http://localhost:3000/devices/<deviceId>/data \
  -H "Content-Type: application/json" \
  -d '{"metric":"temperature","unit":"C","value":25.1,"timestamp":"2026-01-10T10:00:00.000Z"}'
```

Query readings:

```bash
curl "http://localhost:3000/devices/<deviceId>/data?from=2026-01-10T09:00:00.000Z&to=2026-01-10T12:00:00.000Z"
```

### Frontend

1. Open `http://localhost:5173`
2. Create a device using the dashboard form
3. Click a device card to open the detail view
4. Use the date range picker to filter readings by time window
5. Switch between chart and table views
6. Add new readings from the device detail page

### Running Tests



```bash
cd nxgen-task-backend
npm test
```

Tests use Jest and Supertest and cover input validation, error handling, and full API flows end-to-end.

---

## 3. Summary

### Methodology

I built this dashboard to make complex IoT data feel simple and easy to use. To keep the app fast when a device has a lot of data, I used smart filtering so the charts only load what’s necessary, keeping the interface smooth and responsive.
I ensured the system is reliable, easy to test, and can be started with just one command in any environment

### Design Decisions

- **Express + Prisma** — minimal REST API with type-safe queries, straightforward validation, and first-class migration support
- **PostgreSQL** — reliable relational storage; the schema maps directly to the spec with no over-engineering
- **React Query** — handles server state, caching, and loading/error states cleanly without cluttering component logic
- **Recharts** — lightweight and React-native charting that fits the time-series use case without heavy dependencies
- **Docker Compose** — full stack runs with a single command; migrations run automatically on startup so there is no manual database step

### Challenges

As recent raw readings grow, rendering all rows at once becomes slow and hard to use. I solved this by adding server-driven filters and pagination in the frontend, so users can quickly narrow results and load only the slice they need.

Another challenge was chart readability with multiple metrics. I implemented two visualization modes: a single-metric view for clarity, and a compare mode that overlays multiple metric lines in one chart when users want side-by-side analysis.
