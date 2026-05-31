from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.recommendation_router import router as recommendation_router
from app.api.chat_router import router as chat_router
from app.core.config import get_settings

settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    description="AI service for Canim Ecommerce chatbot, recommendation and training data.",
    version="1.0.0",
)
app.include_router(recommendation_router)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat_router)


@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": settings.app_name,
        "environment": settings.app_env,
        "nlu_mode": settings.ai_nlu_mode,
    }