# Auth deploy notes

## Architecture
- Vercel serves only the public login shell.
- `/simulator` and `/_protected/*` are Vercel API proxies.
- Render serves the protected simulator HTML and its compiled assets from `backend/protected_dist`.
- Session writes still go through `/api/backend/*` on Vercel and then to Render.

## Required env vars

### Render
- `DATABASE_URL`
- `AUTH_JWT_SECRET`
- `AUTH_JWT_ISSUER=compass-auth` (optional)
- `AUTH_TOKEN_HOURS=12` (optional)
- `ALLOWED_ORIGINS=https://compassplatform.vercel.app` (or your domain)

### Vercel
- `BACKEND_API_URL=https://<your-render-service>.onrender.com`
- `AUTH_JWT_SECRET=<same value as Render>`
- `AUTH_JWT_ISSUER=compass-auth` (optional)
- `AUTH_TOKEN_HOURS=12` (optional)

## Release build
Before deploying, generate both bundles locally:

```powershell
npm run build:release
```

This does two things:
- prepares `public-dist/` for Vercel
- refreshes `backend/protected_dist/` for Render

`backend/protected_dist/` must be present in the deployed backend source. If you deploy Render directly from the repo, include the regenerated files in the commit whenever the frontend changes.

## User management
Create a user from your PC against the production database:

```powershell
$env:DATABASE_URL="postgresql://..."
$env:AUTH_JWT_SECRET="..."
python backend\manage_users.py create-user --username admin --password "StrongPassword123"
```

Other commands:

```powershell
python backend\manage_users.py list-users
python backend\manage_users.py set-password --username admin --password "NewPassword123"
python backend\manage_users.py deactivate-user --username admin
python backend\manage_users.py activate-user --username admin
```
