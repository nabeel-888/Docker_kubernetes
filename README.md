# Docker Notes App

A tiny full-stack app for practicing Docker Compose: **HTML/CSS/JS frontend + Node.js/Express backend + MongoDB + Mongo Express**, all running as separate containers on one shared network.

## Project structure

```
docker-notes-app/
├── docker-compose.yml      # orchestrates all 3 services
├── .env                    # credentials used by docker-compose
└── backend/
    ├── Dockerfile           # builds the Node.js image
    ├── package.json
    ├── server.js            # Express app + MongoDB (Mongoose) API
    ├── .dockerignore
    └── public/              # static frontend, served by Express
        ├── index.html
        ├── style.css
        └── script.js
```

## Services (defined in docker-compose.yml)

| Service        | Image             | Purpose                                  | Exposed port         |
|----------------|--------------------|-------------------------------------------|-----------------------|
| `mongo`        | `mongo:7`           | The database itself                       | not published to host (internal only) |
| `mongo-express`| `mongo-express:1.0` | Web UI to browse/edit the database        | `8081`                |
| `backend`      | built from `./backend` | Express API + serves the frontend      | `3000`                |

All three join a custom bridge network (`app-network`), so containers can reach each other by **service name** (e.g. the backend connects to `mongo:27017`, not `localhost:27017`). This is one of the core Docker Compose concepts: Compose's built-in DNS resolves service names to the right container automatically.

`mongo`'s data is stored in a **named volume** (`mongo-data`), so your notes survive `docker compose down` (but not `docker compose down -v`, which deletes volumes too).

## Running it

1. Make sure Docker and Docker Compose are installed (`docker compose version` to check).
2. From the `docker-notes-app` folder, run:

   ```bash
   docker compose up --build
   ```

   `--build` forces a rebuild of the backend image the first time or after code changes.

3. Once it's up:
   - Frontend + API: **http://localhost:3000**
   - Mongo Express (DB admin UI): **http://localhost:8081** (login with the `MONGOEXPRESS_USER` / `MONGOEXPRESS_PASSWORD` from `.env`)

4. Add a note in the browser, then check Mongo Express — you'll see a `notesdb` database with a `notes` collection containing your document. That live round-trip (browser → Express API → Mongoose → MongoDB → visible in Mongo Express) is a good way to confirm every container is actually talking to the others correctly.

5. Stop everything:

   ```bash
   docker compose down          # stops & removes containers, keeps data
   docker compose down -v       # also wipes the mongo-data volume
   ```

## Useful commands while practicing

```bash
docker compose ps                    # list running services
docker compose logs -f backend       # tail logs for one service
docker compose exec mongo mongosh -u admin -p admin123   # open a mongo shell inside the container
docker compose build backend         # rebuild just one image
docker compose up -d                 # run in the background (detached)
```

## Things worth experimenting with next

- Change `MONGO_ROOT_PASSWORD` in `.env` and see how you need to `docker compose down` + `up` (env vars are baked in at container start, not hot-reloaded).
- Add a `healthcheck:` to the `mongo` service and a `depends_on: condition: service_healthy` on `backend`, so the backend only starts after Mongo is actually ready (right now it just retries the connection in code instead).
- Split the frontend into its own Nginx container instead of Express serving static files, and add a 4th service.
- Try `docker compose logs -f` (no service name) to see all three services interleaved.
