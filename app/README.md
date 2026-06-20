# 🌴 Vacay — Vacation Planner

A three-tier vacation planning app with a React frontend, Node.js/Express API, and PostgreSQL database — all containerized with Docker.

---

## Architecture

```
                        ┌─────────────── Docker internal network ──────────────┐
                        │                                                      │
  Host browser          │  ┌──────────┐   /api/*   ┌──────────┐   pg pool      │
  (VM IP : 80)  ───────►│  │  Nginx   │──────────► │ Express  │──────────────► PostgreSQL
                        │  │  :8080   │   /*       │ API :4000│                │  :5432
                        │  └──────────┘──────────► ┌──────────┐                │
                        │                          │  React   │                │
                        │                          │  UI :3000│                │
                        └──────────────────────────┴──────────┴────────────────┘
```

**Only port 80 (nginx) is exposed to the Vagrant host.** The browser uses a single origin for both the UI and all API calls — nginx splits the traffic internally. The frontend uses a relative `/api` base URL so it always calls the host it loaded from.

| Service    | Tech                          | Exposed to host | Internal port |
|------------|-------------------------------|-----------------|---------------|
| `nginx`    | Nginx 1.27 (reverse proxy)    | **80**          | 8080          |
| `frontend` | React 18, React Query, Axios  | —               | 3000          |
| `backend`  | Node 20, Express 4, pg        | —               | 4000          |
| `postgres` | PostgreSQL 16                 | 5432 (optional) | 5432          |

---

## Quick Start

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running

### 1. Clone & configure
```bash
git clone <your-repo>
cd vacation-planner
cp .env.example .env   # edit credentials if desired
```

### 2. Start all services
```bash
docker compose up --build
```

### 3. Open the app from your host machine browser

Find your Vagrant VM IP (run inside the VM):
```bash
ip addr show eth1 | grep "inet "
# or: hostname -I
```

Then open in your **host machine browser**:
```
http://<VM-IP>/               → React UI
http://<VM-IP>/api/vacations  → REST API (proxied by nginx)
http://<VM-IP>/health         → Health check
```

> **Why only port 80?** Nginx is the single entry point. The browser uses one
> origin for everything — `/api/*` requests are proxied internally to the Express
> backend. Ports 3000 and 4000 are NOT exposed to the Vagrant host at all.

> **Vagrant port forwarding tip** — to use `localhost` instead of the VM IP,
> add to your `Vagrantfile`:
> ```ruby
> config.vm.network "forwarded_port", guest: 80, host: 8080
> ```
> Then access via `http://localhost:8080`.

> On first boot, PostgreSQL runs the migration in `database/migrations/001_init.sql`
> which creates all tables and inserts a sample "Summer in Tokyo" trip.

---

## Running Without Docker (Local Dev)

### PostgreSQL
Create a local database and run the migration manually:
```sql
psql -U postgres -c "CREATE DATABASE vacationplanner;"
psql -U postgres -d vacationplanner -f database/migrations/001_init.sql
```

### Backend
```bash
cd backend
cp ../.env .env   # or set environment variables manually
npm install
npm run dev       # nodemon on port 4000
```

### Frontend
```bash
cd frontend
npm install
REACT_APP_API_URL=http://localhost:4000/api npm start
```

---

## API Reference

### Vacations
| Method | Endpoint                    | Description          |
|--------|-----------------------------|----------------------|
| GET    | `/api/vacations`            | List all vacations   |
| GET    | `/api/vacations/:id`        | Get single vacation  |
| POST   | `/api/vacations`            | Create vacation      |
| PUT    | `/api/vacations/:id`        | Update vacation      |
| PATCH  | `/api/vacations/:id/status` | Update status only   |
| DELETE | `/api/vacations/:id`        | Delete vacation      |

### Activities
| Method | Endpoint                              | Description              |
|--------|---------------------------------------|--------------------------|
| GET    | `/api/vacations/:id/activities`       | List activities for trip |
| POST   | `/api/vacations/:id/activities`       | Add activity             |
| PUT    | `/api/activities/:id`                 | Update activity          |
| PATCH  | `/api/activities/:id/status`          | Update status only       |
| DELETE | `/api/activities/:id`                 | Delete activity          |

### Packing List
| Method | Endpoint                          | Description         |
|--------|-----------------------------------|---------------------|
| GET    | `/api/vacations/:id/packing`      | List packing items  |
| POST   | `/api/vacations/:id/packing`      | Add packing item    |
| PATCH  | `/api/packing/:id/toggle`         | Toggle packed state |
| PUT    | `/api/packing/:id`                | Update item         |
| DELETE | `/api/packing/:id`                | Delete item         |

### Notes
| Method | Endpoint                       | Description     |
|--------|--------------------------------|-----------------|
| GET    | `/api/vacations/:id/notes`     | List notes      |
| POST   | `/api/vacations/:id/notes`     | Create note     |
| PUT    | `/api/notes/:id`               | Update note     |
| DELETE | `/api/notes/:id`               | Delete note     |

---

## Vacation Statuses
`planning` → `upcoming` → `active` → `completed`  
(can also be set to `cancelled` from any state)

## Activity Statuses
`planned` → `confirmed` → `in_progress` → `completed`  
(or `skipped` / `cancelled`)

## Activity Categories
- `place_to_visit` — Landmarks, attractions, museums
- `restaurant` — Restaurants, cafes, bars
- `activity` — Things to do, tours, experiences
- `accommodation` — Hotels, Airbnbs, hostels
- `transport` — Flights, trains, car rentals
- `other` — Anything else

---

## Project Structure

```
vacation-planner/
├── docker-compose.yml
├── .env
├── database/
│   └── migrations/
│       └── 001_init.sql        # Schema + seed data
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   └── src/
│       ├── index.js             # Express app entry point
│       ├── db.js                # PostgreSQL connection pool
│       ├── controllers/
│       │   ├── vacations.js
│       │   ├── activities.js
│       │   ├── packing.js
│       │   └── notes.js
│       ├── routes/
│       │   ├── vacations.js
│       │   ├── activities.js
│       │   ├── packing.js
│       │   └── notes.js
│       └── middleware/
│           └── errorHandler.js
└── frontend/
    ├── Dockerfile
    ├── package.json
    └── src/
        ├── App.js               # Router + Sidebar
        ├── index.js             # React entry + QueryClient
        ├── utils/api.js         # Axios API client
        ├── styles/global.css    # Design system
        ├── components/
        │   ├── ActivityCard.js
        │   ├── ActivityFormModal.js
        │   ├── Modal.js
        │   ├── NotesPanel.js
        │   ├── PackingList.js
        │   └── StatusBadge.js
        └── pages/
            ├── Dashboard.js
            ├── VacationList.js
            ├── VacationDetail.js
            └── NewVacation.js
```

---

## Extending the App

**Add authentication**: Add a `users` table, JWT middleware in `/backend/src/middleware/auth.js`, and tie vacations to user IDs.

**Add a map view**: Integrate Leaflet or Mapbox in the frontend using the `location` / `address` fields already stored on activities.

**Add budget tracking**: Sum `cost_estimate` across activities per vacation and display a budget dashboard.

**Add image uploads**: Add Multer to the backend to handle file uploads, store images in S3 or local disk.
