from typing import Any

from app.schemas.chat_schema import ChatResponse, ProductSuggestionResponse
from app.services.emotion_service import emotion_service
from app.services.intent_service import intent_service
from app.services.recommendation_service import recommendation_service


class ChatService:
    def reply(self, message: str) -> ChatResponse:
        intent = intent_service.classify(message)
        emotion = emotion_service.classify(message)

        if intent == "SECURITY_BLOCK":
            return ChatResponse(
                reply=(
                    "Dạ nội dung này liên quan đến thông tin bảo mật nên em không thể hỗ trợ ạ. "
                    "Em có thể hỗ trợ Anh/Chị về sản phẩm, size, đơn hàng hoặc chính sách của shop nha."
                ),
                intent=intent,
                emotion=emotion,
                should_handoff=False,
                handoff_reason=None,
            )

        if emotion == "ANGRY":
            return ChatResponse(
                reply=(
                    "Dạ em xin lỗi Anh/Chị vì trải nghiệm chưa đúng mong muốn ạ. "
                    "Em sẽ ghi nhận vấn đề này và chuyển cho nhân viên hỗ trợ kiểm tra kỹ hơn. "
                    "Anh/Chị cho em xin thêm mã đơn hoặc mô tả vấn đề cụ thể để shop xử lý nhanh hơn nha."
                ),
                intent=intent,
                emotion=emotion,
                should_handoff=True,
                handoff_reason="Khách có cảm xúc tức giận, cần nhân viên hỗ trợ kiểm tra.",
            )

        if intent == "GREETING":
            return ChatResponse(
                reply=(
                    "Dạ em chào Anh/Chị ạ ✨ "
                    "Em là Canim AI Stylist, có thể hỗ trợ mình tìm sản phẩm, phối đồ, "
                    "tư vấn size, kiểm tra đơn hàng và chính sách shop ạ."
                ),
                intent=intent,
                emotion=emotion,
            )

        if intent == "THANKS":
            return ChatResponse(
                reply=(
                    "Dạ em cảm ơn Anh/Chị nhiều ạ 💛 "
                    "Em luôn sẵn sàng hỗ trợ mình chọn đồ đẹp và mua sắm dễ hơn nha."
                ),
                intent=intent,
                emotion=emotion,
            )

        if intent == "SMALL_TALK":
            return ChatResponse(
                reply=(
                    "Hí hí em cảm ơn Anh/Chị ạ 💛 "
                    "Em vẫn ở đây để hỗ trợ mình chọn sản phẩm, tư vấn size và phối đồ nha."
                ),
                intent=intent,
                emotion=emotion,
            )

        if intent == "PRODUCT_RECOMMENDATION":
            return self._reply_product_recommendation(
                message=message,
                intent=intent,
                emotion=emotion,
            )

        if intent == "OUTFIT_SUGGESTION":
            return ChatResponse(
                reply=(
                    "Dạ được ạ. Anh/Chị muốn phối đồ theo dịp nào ạ? "
                    "Ví dụ: đi học, đi làm, đi chơi cuối tuần, dự tiệc hoặc phong cách tối giản. "
                    "Em sẽ gợi ý outfit phù hợp hơn cho mình."
                ),
                intent=intent,
                emotion=emotion,
            )

        if intent == "SIZE_SUGGESTION":
            return ChatResponse(
                reply=(
                    "Dạ để tư vấn size chuẩn hơn, Anh/Chị cho em xin chiều cao, cân nặng "
                    "và loại sản phẩm muốn mua nhé. "
                    "Ví dụ: cao 170cm, nặng 60kg, mua áo khoác."
                ),
                intent=intent,
                emotion=emotion,
            )

        if intent == "ORDER_TRACKING":
            return ChatResponse(
                reply=(
                    "Dạ Anh/Chị cho em xin mã đơn hàng, ví dụ ORD-1234, "
                    "để em hỗ trợ kiểm tra trạng thái đơn ạ."
                ),
                intent=intent,
                emotion=emotion,
            )

        if intent == "PROMOTION":
            return ChatResponse(
                reply=(
                    "Dạ Anh/Chị muốn xem khuyến mãi cho nhóm sản phẩm nào ạ? "
                    "Ví dụ: áo thun, áo khoác, quần jean, váy/đầm hoặc phụ kiện. "
                    "Em sẽ hỗ trợ lọc ưu đãi phù hợp hơn."
                ),
                intent=intent,
                emotion=emotion,
            )

        if intent == "SHIPPING_POLICY":
            return ChatResponse(
                reply=(
                    "Dạ thời gian giao hàng sẽ tùy khu vực nhận hàng ạ. "
                    "Anh/Chị cho em biết tỉnh/thành nhận hàng, em sẽ hỗ trợ tư vấn thời gian giao dự kiến nha."
                ),
                intent=intent,
                emotion=emotion,
            )

        if intent == "RETURN_POLICY":
            return ChatResponse(
                reply=(
                    "Dạ shop có hỗ trợ đổi size/đổi sản phẩm theo điều kiện chính sách ạ. "
                    "Anh/Chị cho em biết sản phẩm đang gặp vấn đề gì: chật size, sai màu, lỗi sản phẩm "
                    "hay muốn đổi sang mẫu khác nha."
                ),
                intent=intent,
                emotion=emotion,
            )

        if intent == "COMPLAINT":
            return ChatResponse(
                reply=(
                    "Dạ em xin lỗi Anh/Chị vì trải nghiệm chưa tốt ạ. "
                    "Anh/Chị mô tả giúp em vấn đề cụ thể hơn như sản phẩm lỗi, giao sai hàng, tư vấn sai "
                    "hoặc đơn hàng giao chậm để shop kiểm tra và hỗ trợ mình nhanh hơn nha."
                ),
                intent=intent,
                emotion=emotion,
                should_handoff=True,
                handoff_reason="Khách đang khiếu nại, nên có nhân viên theo dõi.",
            )

        return ChatResponse(
            reply=(
                "Dạ em đang nghe nhu cầu của Anh/Chị ạ. "
                "Mình có thể nói rõ hơn là muốn tìm sản phẩm, phối đồ, tư vấn size, "
                "kiểm tra đơn hàng hay hỏi chính sách shop để em hỗ trợ đúng hơn nha."
            ),
            intent=intent,
            emotion=emotion,
        )

    def _reply_product_recommendation(
        self,
        message: str,
        intent: str,
        emotion: str,
    ) -> ChatResponse:
        recommended_products_raw = recommendation_service.recommend_products(
            message=message,
            limit=3,
        )

        recommended_products = [
            self._to_product_suggestion(product)
            for product in recommended_products_raw
        ]

        if emotion == "COMPLAINT":
            if recommended_products:
                product_names = self._format_product_names(recommended_products)

                return ChatResponse(
                    reply=(
                        "Dạ em xin lỗi vì sản phẩm trước đó chưa vừa ý Anh/Chị ạ. "
                        "Em tìm được một vài mẫu có thể phù hợp hơn cho mình: "
                        f"{product_names}. "
                        "Anh/Chị muốn em lọc thêm theo màu, size hoặc khoảng giá không ạ?"
                    ),
                    intent=intent,
                    emotion=emotion,
                    recommended_products=recommended_products,
                )

            return ChatResponse(
                reply=(
                    "Dạ em xin lỗi vì sản phẩm trước đó chưa vừa ý Anh/Chị ạ. "
                    "Em có thể gợi ý các mẫu form rộng hoặc chất liệu thoải mái hơn. "
                    "Anh/Chị cho em biết muốn tìm áo, quần hay áo khoác và khoảng giá mong muốn nha."
                ),
                intent=intent,
                emotion=emotion,
                recommended_products=[],
            )

        if recommended_products:
            product_names = self._format_product_names(recommended_products)

            return ChatResponse(
                reply=(
                    "Dạ em tìm được một vài sản phẩm phù hợp với nhu cầu của Anh/Chị: "
                    f"{product_names}. "
                    "Anh/Chị muốn em lọc thêm theo màu, size hoặc khoảng giá không ạ?"
                ),
                intent=intent,
                emotion=emotion,
                recommended_products=recommended_products,
            )

        return ChatResponse(
            reply=(
                "Dạ được ạ. Anh/Chị cho em biết thêm loại sản phẩm, màu sắc, size "
                "hoặc khoảng giá mong muốn để em gợi ý chính xác hơn nha. "
                "Ví dụ: áo khoác xanh dưới 500k, áo cotton đi học dưới 300k."
            ),
            intent=intent,
            emotion=emotion,
            recommended_products=[],
        )

    def _to_product_suggestion(
        self,
        product: dict[str, Any],
    ) -> ProductSuggestionResponse:
        return ProductSuggestionResponse(
            product_id=product.get("productId"),
            variant_id=product.get("variantId"),
            sku=product.get("sku"),
            name=product.get("name"),
            slug=product.get("slug"),
            brand=product.get("brand"),
            category_name=product.get("categoryName"),
            color=product.get("color"),
            size=product.get("size"),
            price=self._safe_float(product.get("price")),
            available_quantity=product.get("availableQuantity"),
            image_url=product.get("imageUrl"),
            score=product.get("score"),
        )

    def _safe_float(self, value: Any) -> float | None:
        if value is None:
            return None

        try:
            return float(value)
        except (TypeError, ValueError):
            return None

    def _format_product_names(
        self,
        products: list[ProductSuggestionResponse],
    ) -> str:
        product_labels: list[str] = []

        for product in products:
            label = product.name or "Sản phẩm"

            if product.color:
                label += f" màu {product.color}"

            if product.size:
                label += f" size {product.size}"

            product_labels.append(label)

        return ", ".join(product_labels)


chat_service = ChatService()