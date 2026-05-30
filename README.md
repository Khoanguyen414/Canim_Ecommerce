# Canim Ecommerce

Monorepo for a fashion e-commerce graduation project: Spring Boot API, React storefront & admin, and Python AI chatbot/recommendations.

## Repository structure

```txt
CANIM_ECOMMERCE/
├── frontend/              # Storefront (React + Vite)
├── admin-frontend/        # Admin panel (React + Vite)
├── backend/canim_ecommerce/  # Spring Boot 3.x API
├── ai-service/            # FastAPI AI service
└── docs/
```

## Local development (quick)

```bash
# APIs + MySQL + Redis
cp .env.example .env
docker compose up -d --build

# Storefront
cd frontend && npm install && npm run dev

# Admin
cd admin-frontend && npm install && npm run dev
```

- Backend: http://localhost:8080/canim_ecommerce  
- AI: http://localhost:8001  
- Shop: http://localhost:5173  
- Admin: http://localhost:5174  

See component READMEs in each folder for details.

## Deployment

This monorepo supports Docker-based deployment for the backend and AI service, and static deployment for the frontend and admin frontend.

See [docs/DEPLOY_FREE_GUIDE.md](docs/DEPLOY_FREE_GUIDE.md).

## GitHub

https://github.com/Khoanguyen414/Canim_Ecommerce
