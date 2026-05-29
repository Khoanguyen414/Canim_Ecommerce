from fastapi import APIRouter

from app.schemas.chat_schema import ChatRequest, ChatResponse
from app.services.chat_service import chat_service


router = APIRouter(
    prefix="/ai",
    tags=["AI Chat"],
)


@router.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest) -> ChatResponse:
    return chat_service.reply(
        message=request.message,
        session_id=request.session_id,
    )