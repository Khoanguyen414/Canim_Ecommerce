from typing import Optional

from fastapi import APIRouter, Query
from pydantic import BaseModel, Field

from app.services.recommendation_engine_service import recommendation_engine_service


router = APIRouter(
    prefix="/ai/recommendations",
    tags=["AI Recommendations"],
)


class ContextualRecommendationRequest(BaseModel):
    message: str = Field(
        ...,
        min_length=1,
        max_length=1000,
        description="Câu khách nhập hoặc nội dung tìm kiếm",
    )

    user_id: Optional[int] = Field(
        default=None,
        description="ID user nếu đã đăng nhập",
    )

    limit: int = Field(
        default=8,
        ge=1,
        le=20,
        description="Số sản phẩm tối đa muốn gợi ý",
    )


@router.get("/user/{user_id}")
def recommend_for_user(
    user_id: int,
    limit: int = Query(default=8, ge=1, le=20),
):
    recommendations = recommendation_engine_service.recommend_for_user(
        user_id=user_id,
        limit=limit,
    )

    return {
        "type": "USER_PERSONALIZED",
        "message": "Sản phẩm được cá nhân hóa theo hành vi người dùng",
        "user_id": user_id,
        "count": len(recommendations),
        "items": recommendations,
    }


@router.get("/trending")
def recommend_trending(
    limit: int = Query(default=8, ge=1, le=20),
    days: int = Query(default=30, ge=1, le=365),
):
    recommendations = recommendation_engine_service.recommend_trending(
        limit=limit,
        days=days,
    )

    return {
        "type": "TRENDING",
        "message": "Sản phẩm đang được nhiều khách quan tâm hoặc mua gần đây",
        "days": days,
        "count": len(recommendations),
        "items": recommendations,
    }


@router.get("/similar/{product_id}")
def recommend_similar(
    product_id: int,
    limit: int = Query(default=8, ge=1, le=20),
):
    recommendations = recommendation_engine_service.recommend_similar(
        product_id=product_id,
        limit=limit,
    )

    return {
        "type": "SIMILAR_PRODUCT",
        "message": "Sản phẩm tương tự với sản phẩm đang xem",
        "product_id": product_id,
        "count": len(recommendations),
        "items": recommendations,
    }


@router.post("/contextual")
def recommend_contextual(request: ContextualRecommendationRequest):
    recommendations = recommendation_engine_service.recommend_contextual(
        message=request.message,
        user_id=request.user_id,
        limit=request.limit,
    )

    return {
        "type": "CONTEXTUAL",
        "message": "Sản phẩm phù hợp với nội dung khách đang tìm",
        "user_id": request.user_id,
        "query": request.message,
        "count": len(recommendations),
        "items": recommendations,
    }