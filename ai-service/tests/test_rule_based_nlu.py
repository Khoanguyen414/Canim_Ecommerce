import unittest
from unittest.mock import patch

from app.nlu.rule_based_nlu import rule_based_nlu
from app.services.chat_service import chat_service
from app.services.conversation_state_service import conversation_state_service
from app.services.recommendation_engine_service import RecommendationEngineService


class CanimChatFlowTests(unittest.TestCase):
    def test_case_1_greeting(self) -> None:
        session_id = "test-case-1"
        conversation_state_service.clear_state(session_id)

        response = chat_service.reply("chào bạn", session_id=session_id)

        self.assertEqual(response.intent, "GREETING")
        self.assertEqual(response.widgetType, "TEXT_ONLY")
        self.assertEqual(response.recommended_products, [])

    def test_case_2_size_suggestion(self) -> None:
        session_id = "test-case-2"
        conversation_state_service.clear_state(session_id)

        response = chat_service.reply("m65,55kg mặc size nào", session_id=session_id)

        self.assertEqual(response.intent, "SIZE_SUGGESTION")
        self.assertEqual(response.widgetType, "SIZE_ADVICE")
        self.assertEqual(response.entities.get("heightCm"), 165)
        self.assertEqual(response.entities.get("weightKg"), 55)
        self.assertEqual(response.entities.get("recommendedSize"), "M")
        self.assertEqual(response.recommended_products, [])

    def test_size_68kg_m7_single_message(self) -> None:
        session_id = "test-size-68kg-m7"
        conversation_state_service.clear_state(session_id)

        response = chat_service.reply("68kg m7 mặc size nào", session_id=session_id)

        self.assertEqual(response.intent, "SIZE_SUGGESTION")
        self.assertEqual(response.widgetType, "SIZE_ADVICE")
        self.assertEqual(response.entities.get("heightCm"), 170)
        self.assertEqual(response.entities.get("weightKg"), 68)
        self.assertEqual(response.entities.get("recommendedSize"), "L")
        self.assertIn("size l", response.reply.lower())

    def test_size_followup_height_after_weight(self) -> None:
        session_id = "test-size-followup"
        conversation_state_service.clear_state(session_id)

        chat_service.reply("68kg mặc size nào", session_id=session_id)
        response = chat_service.reply("170", session_id=session_id)

        self.assertEqual(response.intent, "SIZE_SUGGESTION")
        self.assertEqual(response.widgetType, "SIZE_ADVICE")
        self.assertEqual(response.entities.get("heightCm"), 170)
        self.assertEqual(response.entities.get("weightKg"), 68)
        self.assertEqual(response.entities.get("recommendedSize"), "L")
        self.assertIn("size l", response.reply.lower())

    def test_size_bare_height_weight_pair(self) -> None:
        session_id = "test-size-bare-pair"
        conversation_state_service.clear_state(session_id)

        response = chat_service.reply("170 68kg", session_id=session_id)

        self.assertEqual(response.intent, "SIZE_SUGGESTION")
        self.assertEqual(response.entities.get("heightCm"), 170)
        self.assertEqual(response.entities.get("weightKg"), 68)
        self.assertEqual(response.entities.get("recommendedSize"), "L")

    def test_case_3_product_after_size_context(self) -> None:
        session_id = "test-case-3"
        conversation_state_service.clear_state(session_id)

        chat_service.reply("m65,55kg mặc size nào", session_id=session_id)
        response = chat_service.reply("tôi cần tìm áo polo", session_id=session_id)

        self.assertEqual(response.intent, "PRODUCT_RECOMMENDATION")
        self.assertEqual(response.widgetType, "PRODUCT_CAROUSEL")
        self.assertNotEqual(response.widgetType, "SIZE_ADVICE")

    def test_case_4_fit_preference_after_size(self) -> None:
        session_id = "test-case-4"
        conversation_state_service.clear_state(session_id)

        chat_service.reply("m65,55kg mặc size nào", session_id=session_id)
        response = chat_service.reply("Mặc rộng thoải mái", session_id=session_id)

        self.assertEqual(response.intent, "SIZE_SUGGESTION")
        self.assertEqual(response.widgetType, "SIZE_ADVICE")
        self.assertEqual(response.entities.get("fitPreference"), "OVERSIZE")
        self.assertEqual(response.recommended_products, [])

    def test_case_5_complaint(self) -> None:
        session_id = "test-case-5"
        conversation_state_service.clear_state(session_id)

        response = chat_service.reply("trả lời tào lao quá", session_id=session_id)

        self.assertEqual(response.intent, "COMPLAINT")
        self.assertEqual(response.widgetType, "HUMAN_HANDOFF")
        self.assertEqual(response.recommended_products, [])

    def test_case_6_giay_da_nam_no_polo_fallback(self) -> None:
        session_id = "test-case-6"
        conversation_state_service.clear_state(session_id)

        mock_catalog = [
            {
                "product_id": 5,
                "variant_id": 20,
                "name": "polo vnt",
                "slug": "polo-vnt",
                "category_name": "ao",
                "color": "xanh",
                "size": "M",
                "price": 100000,
                "available_quantity": 10,
                "status": "ACTIVE",
                "searchableText": "polo vnt xanh nam",
            }
        ]

        with patch.object(
            chat_service.recommendation_engine_service,
            "_get_recommendable_products",
            return_value=mock_catalog,
        ):
            response = chat_service.reply("gợi ý giày da nam", session_id=session_id)

        self.assertEqual(response.intent, "PRODUCT_RECOMMENDATION")
        self.assertEqual(response.widgetType, "PRODUCT_CAROUSEL")
        self.assertEqual(response.recommended_products, [])
        self.assertIn("giay da nam", response.reply.lower())
        self.assertIn("chưa tìm thấy", response.reply.lower())

    def test_case_6_giay_da_nam_returns_shoes_when_available(self) -> None:
        session_id = "test-case-6-shoes"
        conversation_state_service.clear_state(session_id)

        mock_catalog = [
            {
                "product_id": 8,
                "variant_id": 80,
                "name": "Giay Da Nam",
                "slug": "giay-da-nam",
                "category_name": "giay",
                "color": "nau",
                "size": "42",
                "price": 890000,
                "available_quantity": 14,
                "status": "ACTIVE",
                "searchableText": "giay da nam mau nau size 42",
            },
            {
                "product_id": 5,
                "variant_id": 20,
                "name": "polo vnt",
                "slug": "polo-vnt",
                "category_name": "ao",
                "color": "xanh",
                "size": "M",
                "price": 100000,
                "available_quantity": 10,
                "status": "ACTIVE",
                "searchableText": "polo vnt xanh nam",
            },
        ]

        with patch.object(
            chat_service.recommendation_engine_service,
            "_get_recommendable_products",
            return_value=mock_catalog,
        ):
            response = chat_service.reply("gợi ý giày da nam", session_id=session_id)

        self.assertEqual(response.intent, "PRODUCT_RECOMMENDATION")
        self.assertEqual(response.widgetType, "PRODUCT_CAROUSEL")
        self.assertEqual(len(response.recommended_products), 1)
        self.assertEqual(response.recommended_products[0].get("product_id"), 8)
        self.assertIn("giay", response.recommended_products[0].get("name", "").lower())

    def test_fit_preference_without_size_context(self) -> None:
        session_id = "test-fit-no-context"
        conversation_state_service.clear_state(session_id)

        response = chat_service.reply("Mặc rộng thoải mái", session_id=session_id)

        self.assertEqual(response.intent, "UNKNOWN")
        self.assertEqual(response.widgetType, "TEXT_ONLY")
        self.assertEqual(response.recommended_products, [])
        self.assertIn("chiều cao", response.reply.lower())

    def test_greeting_after_product_does_not_show_old_products(self) -> None:
        session_id = "test-greeting-after-product"
        conversation_state_service.clear_state(session_id)

        chat_service.reply("tôi cần tìm áo polo", session_id=session_id)
        response = chat_service.reply("chào bạn", session_id=session_id)

        self.assertEqual(response.intent, "GREETING")
        self.assertEqual(response.widgetType, "TEXT_ONLY")
        self.assertEqual(response.recommended_products, [])

    def test_product_with_size_stays_product(self) -> None:
        result = rule_based_nlu.analyze_message("tôi cần tìm áo polo size M")

        self.assertEqual(result.intent, "PRODUCT_RECOMMENDATION")

    def test_tim_day_chuyen_is_product_intent(self) -> None:
        result = rule_based_nlu.analyze_message("tìm dây chuyền")

        self.assertEqual(result.intent, "PRODUCT_RECOMMENDATION")

    def test_cho_vai_mau_ao_is_product_intent(self) -> None:
        result = rule_based_nlu.analyze_message("cho tôi vài mẫu áo")

        self.assertEqual(result.intent, "PRODUCT_RECOMMENDATION")


class RecommendationEngineStrictMatchTests(unittest.TestCase):
    def setUp(self) -> None:
        self.engine = RecommendationEngineService()

    def test_giay_query_excludes_polo(self) -> None:
        polo = {
            "product_id": 5,
            "name": "polo vnt",
            "slug": "polo-vnt",
            "category_name": "ao",
            "color": "xanh",
            "size": "M",
            "searchableText": "polo vnt xanh nam",
        }
        shoes = {
            "product_id": 8,
            "name": "Giay Da Nam",
            "slug": "giay-da-nam",
            "category_name": "giay",
            "color": "nau",
            "size": "42",
            "searchableText": "giay da nam mau nau size 42",
        }

        polo_score, _ = self.engine._score_by_query(polo, "goi y giay da nam")
        shoe_score, _ = self.engine._score_by_query(shoes, "goi y giay da nam")

        self.assertEqual(polo_score, 0)
        self.assertGreater(shoe_score, 0)

    def test_fallback_products_dedupe_by_product_id(self) -> None:
        engine = RecommendationEngineService()

        variants = [
            {
                "product_id": 5,
                "variant_id": 20,
                "name": "polo vnt",
                "color": "xanh",
                "size": "S",
                "available_quantity": 10,
            },
            {
                "product_id": 5,
                "variant_id": 21,
                "name": "polo vnt",
                "color": "xanh",
                "size": "M",
                "available_quantity": 10,
            },
            {
                "product_id": 5,
                "variant_id": 22,
                "name": "polo vnt",
                "color": "xanh",
                "size": "L",
                "available_quantity": 10,
            },
        ]

        result = engine._fallback_products(variants, limit=8)

        self.assertEqual(len(result), 1)
        self.assertEqual(result[0].get("product_id"), 5)

    def test_ao_thun_basic_matches_shirt_not_shoes(self) -> None:
        shirt = {
            "product_id": 1,
            "name": "Ao Thun Basic",
            "slug": "ao-thun-basic",
            "category_name": "ao",
            "color": "den",
            "size": "M",
            "searchableText": "ao thun basic den nam",
        }
        shoes = {
            "product_id": 8,
            "name": "Giay Da Nam",
            "slug": "giay-da-nam",
            "category_name": "giay",
            "color": "nau",
            "size": "42",
            "searchableText": "giay da nam mau nau size 42",
        }

        shirt_score, _ = self.engine._score_by_query(shirt, "goi y ao thun basic")
        shoe_score, _ = self.engine._score_by_query(shoes, "goi y ao thun basic")

        self.assertGreater(shirt_score, 0)
        self.assertEqual(shoe_score, 0)

    def test_ao_query_excludes_dep_cao_cap(self) -> None:
        shirt = {
            "product_id": 2,
            "name": "Ao thun den",
            "slug": "ao-thun-den",
            "category_name": "ao thun",
            "color": "den",
            "size": "M",
            "searchableText": "ao thun den nam",
        }
        sandals = {
            "product_id": 3,
            "name": "Dep ma vang cao cap",
            "slug": "dep-ma-vang-cao-cap",
            "category_name": "dep",
            "color": "vang",
            "size": "L",
            "searchableText": "dep ma vang cao cap nam",
        }
        necklace = {
            "product_id": 4,
            "name": "Day chuyen ma vang",
            "slug": "day-chuyen-ma-vang",
            "category_name": "trang suc",
            "color": "vang kim",
            "size": "S",
            "searchableText": "day chuyen ma vang nu",
        }

        shirt_score, _ = self.engine._score_by_query(shirt, "toi can tim ao")
        sandal_score, _ = self.engine._score_by_query(sandals, "toi can tim ao")
        necklace_score, _ = self.engine._score_by_query(necklace, "toi can tim ao")

        self.assertGreater(shirt_score, 0)
        self.assertEqual(sandal_score, 0)
        self.assertEqual(necklace_score, 0)

    def test_day_chuyen_query_matches_necklace_not_shirt(self) -> None:
        shirt = {
            "product_id": 2,
            "name": "Ao thun den",
            "slug": "ao-thun-den",
            "category_name": "ao thun",
            "color": "den",
            "size": "M",
            "searchableText": "ao thun den nam",
        }
        necklace = {
            "product_id": 4,
            "name": "Day chuyen ma vang",
            "slug": "day-chuyen-ma-vang",
            "category_name": "trang suc",
            "color": "vang kim",
            "size": "S",
            "searchableText": "day chuyen ma vang nu",
        }

        shirt_score, _ = self.engine._score_by_query(shirt, "tim day chuyen")
        necklace_score, _ = self.engine._score_by_query(necklace, "tim day chuyen")

        self.assertEqual(shirt_score, 0)
        self.assertGreater(necklace_score, 0)


if __name__ == "__main__":
    unittest.main()
