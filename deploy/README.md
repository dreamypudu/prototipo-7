# Despliegue de COMPASS

Esta carpeta contiene los archivos necesarios para correr COMPASS dentro del servidor del edificio (o cualquier host con Docker), una vez que recibas las credenciales y la URL `compass.giia.udec.cl`.

## Archivos relevantes

| Archivo | Que hace |
|---------|----------|
| [`../backend/Dockerfile`](../backend/Dockerfile) | Imagen del backend FastAPI (Python 3.12 + uvicorn). |
| [`../Dockerfile.frontend`](../Dockerfile.frontend) | Imagen del frontend (Vite build + nginx). |
| [`../docker-compose.yml`](../docker-compose.yml) | Orquesta backend + frontend (y opcionalmente Postgres). |
| [`nginx.conf`](nginx.conf) | Sirve el SPA y hace reverse proxy de `/api/*` al backend. |
| [`.env.production.example`](.env.production.example) | Plantilla de variables: copiar a `.env.production` y completar. |
| [`../.dockerignore`](../.dockerignore) | Evita copiar basura al contexto de Docker (node_modules, etc.). |

## Despliegue en 5 pasos

Conectado por SSH al servidor:

```bash
# 1. Clonar el repo (o subirlo con scp/rsync)
git clone <url-del-repo> compass
cd compass

# 2. Crear el archivo de variables productivas
cp deploy/.env.production.example .env.production
nano .env.production   # completar DATABASE_URL y demas

# 3. Construir y levantar
docker compose --env-file .env.production up -d --build

# 4. Verificar
docker compose ps               # ambos en "Up"
docker compose logs -f backend  # ver que arranque sin errores
curl -i http://localhost/api/health   # debe devolver {"ok":true}

# 5. Apagar / reiniciar cuando haga falta
docker compose down
docker compose --env-file .env.production up -d
```

## Variables clave que necesitas configurar

En `.env.production`:

- **`DATABASE_URL`** — la conexion completa a Postgres.
  - Si sigues con Supabase: la URL que copias del panel de Supabase.
  - Si usas Postgres del servidor: `postgresql://compass:CLAVE@host:5432/compass`.
- **`ALLOWED_ORIGINS`** — para CORS. Tipicamente `https://compass.giia.udec.cl`.
- **`VITE_API_URL`** — para el frontend. Si front y back comparten dominio (recomendado), `/api`. Si no, la URL completa del backend.

## Decisiones que afectan el despliegue

### TLS / HTTPS

El contenedor frontend solo escucha HTTP en el puerto 80. Lo tipico es que **el servidor del edificio ya tenga un reverse proxy global** (nginx/Caddy/traefik) que termina TLS para todos los servicios y le pasa el trafico interno a los puertos correctos. **No instales Let's Encrypt dentro del contenedor**: pidele al equipo de infraestructura que apunte `compass.giia.udec.cl` al puerto 80 del host (o al 80 del contenedor frontend) y que el proxy global maneje el certificado.

### Base de datos

Por defecto, `docker-compose.yml` **no levanta Postgres**: asume que esta afuera (Supabase o instalado en el servidor). Si quieres correrlo en un tercer contenedor, descomenta el servicio `db` en el compose y rellena `POSTGRES_*` en `.env.production`.

### Actualizaciones

Despues de cada `git pull`:
```bash
docker compose --env-file .env.production up -d --build
```
El `--build` regenera las imagenes. El backend hace migracion idempotente al boot (corre `create_schema`), asi que no necesitas correr nada extra.

## Health checks

- **Backend**: `GET /health` -> `{"ok": true}`. Tambien definido dentro del Dockerfile (`curl /health`).
- **Frontend**: `GET /` -> sirve el `index.html`. Dentro del Dockerfile usa `wget`.

## Logs

```bash
docker compose logs backend     # backend (uvicorn + queries)
docker compose logs frontend    # nginx access/error
docker compose logs -f --tail=100   # ultimas 100 lineas, en vivo
```

## Que verificar despues del primer arranque

1. `curl https://compass.giia.udec.cl/api/health` -> `{"ok":true}`.
2. Abrir `https://compass.giia.udec.cl/` en el navegador, completar una sesion corta.
3. Verificar en la base:
   ```sql
   SELECT COUNT(*) FROM sessions;
   SELECT COUNT(*) FROM mlq_labels;
   SELECT * FROM explicit_decisions ORDER BY decision_id DESC LIMIT 5;
   ```
