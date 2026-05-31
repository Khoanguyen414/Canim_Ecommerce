# Canim Ecommerce — Free-tier deployment guide

Graduation-thesis friendly setup: Docker for API services, static hosting for React apps, managed MySQL, optional Redis.

## Architecture

```txt
[Cloudflare Pages / Vercel]
  ├── Storefront (frontend)
  └── Admin (admin-frontend)
           │  HTTPS
           ▼
[Render / Koyeb / Railway]
  ├── Spring Boot API (backend/canim_ecommerce)  →  MySQL
  └── FastAPI AI (ai-service)  →  calls Spring Boot /ai/products/context
```

| Component | Tech | Hosting suggestion |
|-----------|------|-------------------|
| Storefront | React 19 + Vite | Cloudflare Pages or Vercel |
| Admin | React 19 + Vite | Cloudflare Pages or Vercel |
| API | Spring Boot 3.4, Java 21 | Render / Koyeb (Docker) |
| AI | Python 3.12 + FastAPI | Render / Koyeb (Docker) |
| Database | MySQL 8 + Flyway | PlanetScale / Aiven free / Railway MySQL |
| Cache | Redis 7 (optional) | Upstash free / Railway Redis |

---

## 1. Local full-stack with Docker Compose

### Prerequisites

- Docker Desktop
- Node.js 20+ (for frontends)
- Copy env files:

```bash
cp .env.example .env
cp backend/canim_ecommerce/.env.example backend/canim_ecommerce/.env
cp ai-service/.env.example ai-service/.env
```

### Start infrastructure + APIs

```bash
docker compose up -d --build
```

### Local URLs

| Service | URL |
|---------|-----|
| Backend API | http://localhost:8080/canim_ecommerce |
| Health check | http://localhost:8080/canim_ecommerce/actuator/health |
| AI service | http://localhost:8001/health |
| MySQL (host) | localhost:3307 |
| Redis | localhost:6379 |
| Storefront | `cd frontend && npm run dev` → http://localhost:5173 |
| Admin | `cd admin-frontend && npm run dev` → http://localhost:5174 |

### Frontend local env

```bash
# frontend/.env.local
VITE_API_BASE_URL=http://localhost:8080/canim_ecommerce
VITE_AI_API_BASE_URL=http://localhost:8001
```

```bash
# admin-frontend/.env.local
VITE_API_BASE_URL=http://localhost:8080/canim_ecommerce
VITE_STOREFRONT_URL=http://localhost:5173
```

### Disable Redis (free tier without Redis)

Set on backend:

```env
REDIS_ENABLED=false
```

Cart API still works (MySQL is source of truth; cache is best-effort).

---

## 2. Free MySQL database

Options:

1. **PlanetScale** (MySQL-compatible; check Flyway compatibility)
2. **Aiven** free MySQL
3. **Railway** MySQL plugin
4. **Local Docker** for demo only

Create database: `canim_ecommerce`

Note connection host, port, user, password, SSL mode.

---

## 3. Deploy backend (Docker)

### Image

GitHub Actions publishes:

```txt
ghcr.io/<your-github-user>/canim-backend:latest
```

Or build locally:

```bash
docker build -t canim-backend ./backend/canim_ecommerce
```

### Render / Koyeb settings

| Setting | Value |
|---------|-------|
| Type | Web service / Docker |
| Port | `8080` |
| Health check path | `/canim_ecommerce/actuator/health` |

### Required environment variables

```env
SPRING_PROFILES_ACTIVE=prod
SERVER_PORT=8080
SERVER_SERVLET_CONTEXT_PATH=/canim_ecommerce

MYSQL_HOST=
MYSQL_PORT=3306
MYSQL_DATABASE=canim_ecommerce
MYSQL_USER=
MYSQL_PASSWORD=

JWT_SECRET=<long-random-string>

CORS_ALLOWED_ORIGINS=https://your-shop.pages.dev,https://your-admin.pages.dev

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

REDIS_ENABLED=true
REDIS_HOST=
REDIS_PORT=6379
```

Optional: `REDIS_ENABLED=false` if you skip Redis.

### Deploy hook (GitHub secret)

`RENDER_BACKEND_DEPLOY_HOOK_URL` → POST URL from Render dashboard.

---

## 4. Deploy AI service (Docker)

### Image

```txt
ghcr.io/<your-github-user>/canim-ai-service:latest
```

### Settings

| Setting | Value |
|---------|-------|
| Port | `8001` |
| Health check | `/health` |

### Environment variables

```env
APP_ENV=production
AI_PORT=8001
AI_DEBUG=false
BACKEND_API_BASE_URL=https://<backend-host>/canim_ecommerce
AI_CORS_ALLOWED_ORIGINS=https://your-shop.pages.dev,https://your-admin.pages.dev
AI_NLU_MODE=rule_based
```

---

## 5. Deploy storefront (Cloudflare Pages / Vercel)

| Setting | Value |
|---------|-------|
| Framework | Vite |
| Build command | `npm ci && npm run build` |
| Output directory | `dist` |
| Root directory | `frontend` |

### Environment variables (build time)

```env
VITE_API_BASE_URL=https://<backend>/canim_ecommerce
VITE_AI_API_BASE_URL=https://<ai-service>
VITE_AI_CHAT_MOCK=false
VITE_GOOGLE_CLIENT_ID=<public-client-id>
```

SPA routing: `frontend/public/_redirects` contains `/* /index.html 200`.

---

## 6. Deploy admin frontend

Same as storefront, root directory: `admin-frontend`.

```env
VITE_API_BASE_URL=https://<backend>/canim_ecommerce
VITE_STOREFRONT_URL=https://<shop-domain>
```

---

## 7. CORS after domains exist

Update backend:

```env
CORS_ALLOWED_ORIGINS=https://shop.example.com,https://admin.example.com
```

Update AI service:

```env
AI_CORS_ALLOWED_ORIGINS=https://shop.example.com,https://admin.example.com
```

Redeploy backend + AI after changing CORS.

---

## 8. GitHub Actions secrets

| Secret | Purpose |
|--------|---------|
| `GITHUB_TOKEN` | Auto (GHCR push) |
| `RENDER_BACKEND_DEPLOY_HOOK_URL` | Optional Render redeploy |
| `RENDER_AI_DEPLOY_HOOK_URL` | Optional Render redeploy |

Frontend CI uses localhost URLs for compile-only checks. Set real `VITE_*` in Cloudflare/Vercel UI for production builds.

---

## 9. Jenkins (local demo only)

`Jenkinsfile` at repo root automates checkout, Maven build, Docker images, npm builds, and `docker compose up`.

Jenkins is **not** the public host — use it to demonstrate CI/CD in your thesis defense.

---

## 10. Smoke test checklist

1. Open storefront.
2. Open admin frontend.
3. Register/login user.
4. Load products.
5. Add product to cart.
6. Checkout COD or QR.
7. Login admin.
8. Update order status.
9. Open chatbot.
10. Ask for product recommendation.
11. Verify AI service returns product carousel.

---

## Common errors

| Problem | Fix |
|---------|-----|
| CORS error in browser | Set `CORS_ALLOWED_ORIGINS` + `AI_CORS_ALLOWED_ORIGINS` with exact frontend URLs |
| 502 on backend start | Check MySQL credentials; read container logs; Flyway migration errors |
| AI returns no products | `BACKEND_API_BASE_URL` must include `/canim_ecommerce` |
| Vite still calls localhost | Rebuild frontend after changing `VITE_*` |
| Health check fails | Use path `/canim_ecommerce/actuator/health` on port 8080 |
| Redis connection refused | Set `REDIS_ENABLED=false` or provision Redis |

---

## Security notes

- Never commit `.env` with real secrets.
- JWT, DB password, Cloudinary secret stay on backend only.
- Frontends only use `VITE_` public variables.
- Rotate `JWT_SECRET` for production demos.
