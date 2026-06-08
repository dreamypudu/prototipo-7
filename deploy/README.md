# Despliegue De COMPASS

Esta carpeta contiene los archivos necesarios para correr COMPASS en el servidor del edificio usando Docker.

## Archivos Relevantes

| Archivo | Que hace |
|---|---|
| [`../docker-compose.yml`](../docker-compose.yml) | Orquesta Postgres, backend y frontend. |
| [`../backend/Dockerfile`](../backend/Dockerfile) | Imagen del backend FastAPI. |
| [`../Dockerfile.frontend`](../Dockerfile.frontend) | Imagen del frontend React/Vite servido con nginx. |
| [`nginx.conf`](nginx.conf) | Sirve el SPA y hace reverse proxy de `/api/*` al backend. |
| [`.env.production.example`](.env.production.example) | Plantilla de variables. Copiar a `.env.production`. |
| [`../.dockerignore`](../.dockerignore) | Evita copiar credenciales, `node_modules`, `dist` y caches al build. |

## Despliegue En 5 Pasos

Conectado por SSH al servidor:

```bash
# 1. Clonar el repo o subirlo con scp/rsync
git clone <url-del-repo> compass
cd compass

# 2. Crear variables productivas
cp deploy/.env.production.example .env.production
nano .env.production

# 3. Construir y levantar
docker compose --env-file .env.production up -d --build

# 4. Verificar contenedores y backend
docker compose ps
docker compose logs -f backend
curl -i http://localhost/api/health

# 5. Reiniciar cuando haga falta
docker compose down
docker compose --env-file .env.production up -d
```

## Variables Clave

En `.env.production`:

- `POSTGRES_USER`: usuario de la base dentro del contenedor. Puede quedar como `compass`.
- `POSTGRES_PASSWORD`: clave larga para Postgres. Obligatoria.
- `POSTGRES_DB`: nombre de la base. Puede quedar como `compass`.
- `ALLOWED_ORIGINS`: dominio permitido por CORS. Ejemplo: `https://compass.giia.udec.cl`.
- `VITE_API_URL`: URL que el frontend usa para hablar con backend. Para mismo dominio, dejar `/api`.
- `AUTH_JWT_SECRET_KEY`: clave aleatoria larga para firmar tokens. Obligatoria en produccion.
- `AUTH_SEED_EMAIL` / `AUTH_SEED_PASSWORD`: cuenta inicial de plataforma, normalmente con `AUTH_SEED_ROLE=user`.
- `AUTH_ACCESS_TOKEN_MINUTES` / `AUTH_REFRESH_TOKEN_HOURS`: duracion de access token y ventana maxima de renovacion activa.

El backend construye internamente la conexion:

```text
postgresql://POSTGRES_USER:POSTGRES_PASSWORD@db:5432/POSTGRES_DB
```

## Base De Datos

Postgres corre como servicio `db` dentro del mismo `docker-compose`. No se publica a internet; solo backend puede acceder por la red interna Docker.

Los datos persisten en el volumen:

```text
compass-db-data
```

`docker compose down` no borra la base. Solo se elimina si corres explícitamente algo como:

```bash
docker compose down -v
```

No usar `down -v` en produccion salvo que quieras borrar toda la base.

Para entrar a la base desde el servidor:

```bash
docker compose --env-file .env.production exec db psql -U compass -d compass
```

Si cambiaste `POSTGRES_USER` o `POSTGRES_DB`, usa esos valores.

Para respaldar:

```bash
docker compose --env-file .env.production exec -T db pg_dump -U compass -d compass > compass_backup.sql
```

Para restaurar un respaldo:

```bash
cat compass_backup.sql | docker compose --env-file .env.production exec -T db psql -U compass -d compass
```

## HTTPS Y Proxy Institucional

El contenedor frontend escucha HTTP en puerto 80. Hay dos escenarios:

### Sin proxy institucional

El contenedor puede tomar el puerto 80 del servidor:

```yml
ports:
  - "80:80"
```

### Con nginx/Caddy/Traefik institucional

Si el servidor ya tiene un proxy global que maneja HTTPS, no conviene ocupar directamente el puerto 80. Usa un puerto local:

```yml
ports:
  - "127.0.0.1:8080:80"
```

Luego infraestructura debe apuntar `https://compass.giia.udec.cl` a:

```text
http://127.0.0.1:8080
```

En ese caso, el certificado HTTPS lo maneja el proxy institucional, no el contenedor.

## Health Checks

- Backend: `GET /api/health` debe devolver `{"ok":true}` desde el dominio publico.
- Frontend: `GET /` debe servir la app React.

Comandos utiles:

```bash
docker compose ps
docker compose logs backend
docker compose logs frontend
docker compose logs -f --tail=100
```

## Verificacion Despues Del Primer Arranque

1. Verificar API:

```bash
curl https://compass.giia.udec.cl/api/health
```

2. Abrir `https://compass.giia.udec.cl/` en navegador.

3. Completar una sesion corta y revisar la base:

```sql
SELECT COUNT(*) FROM sessions;
SELECT COUNT(*) FROM explicit_decisions;
SELECT COUNT(*) FROM mlq_labels;

SELECT ed.*
FROM explicit_decisions ed
JOIN sessions s USING (session_id)
ORDER BY s.created_at DESC, ed.decision_order DESC
LIMIT 5;
```

## Actualizaciones

Despues de cada `git pull`:

```bash
docker compose --env-file .env.production up -d --build
```

El backend corre migraciones idempotentes al arrancar mediante `create_schema`, asi que normalmente no necesitas ejecutar pasos extra.
