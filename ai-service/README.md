# Canim AI Service

`ai-service` là service AI riêng của dự án **Canim_Ecommerce**.

Service này được xây dựng bằng **Python + FastAPI**, dùng để hỗ trợ các tính năng AI cho hệ thống E-commerce như:

* AI Chatbot tư vấn khách hàng.
* Nhận diện ý định khách hàng.
* Nhận diện cảm xúc khách hàng.
* Gợi ý sản phẩm theo nhu cầu.
* Chuẩn bị dữ liệu huấn luyện AI.
* Kết nối backend Spring Boot để lấy dữ liệu sản phẩm thật.

---

## 1. Vai trò của AI Service

Trong kiến trúc tổng thể của Canim_Ecommerce:

```text
Customer Frontend / Admin Frontend
↓
AI Service FastAPI
↓
Spring Boot Backend
↓
MySQL Database
```

AI Service không thay thế backend Spring Boot.

AI Service chỉ xử lý phần AI:

* Hiểu câu khách hàng.
* Phân loại intent.
* Phân loại emotion.
* Gợi ý sản phẩm.
* Gọi backend để lấy product context.
* Trả kết quả cho frontend hiển thị chatbot.

Backend Spring Boot vẫn là nơi quản lý nghiệp vụ chính:

* Product
* Product Variant
* Inventory
* Order
* User
* Cart
* Role
* Security

---

## 2. Công nghệ sử dụng

| Thành phần          | Công nghệ    |
| ------------------- | ------------ |
| API Framework       | FastAPI      |
| Server              | Uvicorn      |
| Data Validation     | Pydantic     |
| HTTP Client         | httpx        |
| Dataset Processing  | Pandas       |
| Fake Data / Dataset | Faker        |
| Machine Learning    | scikit-learn |
| Model Storage       | joblib       |

---

## 3. Cấu trúc thư mục

```text
ai-service/
├── README.md
├── requirements.txt
├── .env.example
├── .env
├── main.py
│
├── app/
│   ├── api/
│   │   └── chat_router.py
│   │
│   ├── core/
│   │   └── config.py
│   │
│   ├── schemas/
│   │   └── chat_schema.py
│   │
│   ├── services/
│   │   ├── intent_service.py
│   │   ├── emotion_service.py
│   │   ├── chat_service.py
│   │   └── recommendation_service.py
│   │
│   ├── clients/
│   │   └── backend_client.py
│   │
│   ├── nlu/
│   │   ├── rule_based_nlu.py
│   │   ├── ml_nlu.py
│   │   ├── training_data_loader.py
│   │   └── train_intent_emotion_models.py
│   │
│   └── utils/
│       └── text_utils.py
│
├── ai_training/
│   ├── README.md
│   └── intent_emotion_samples.csv
│
├── dataset_generator/
│   └── output/
│
└── models/
    ├── intent_classifier.joblib
    └── emotion_classifier.joblib
```

---

## 4. Giải thích các folder chính

### `app/api`

Chứa các API route của FastAPI.

Ví dụ:

```text
POST /ai/chat
```

File chính:

```text
app/api/chat_router.py
```

Vai trò giống `Controller` trong Spring Boot.

---

### `app/schemas`

Chứa request/response schema.

Ví dụ:

```text
ChatRequest
ChatResponse
IntentType
EmotionType
```

Vai trò giống DTO trong Spring Boot.

---

### `app/services`

Chứa logic nghiệp vụ AI.

Các file chính:

```text
intent_service.py
emotion_service.py
chat_service.py
recommendation_service.py
```

Vai trò:

* `intent_service.py`: phân loại ý định khách hàng.
* `emotion_service.py`: phân loại cảm xúc khách hàng.
* `chat_service.py`: quyết định chatbot trả lời gì.
* `recommendation_service.py`: gợi ý sản phẩm theo message khách.

---

### `app/nlu`

`NLU` là viết tắt của **Natural Language Understanding**.

Đây là phần giúp chatbot hiểu ngôn ngữ tự nhiên của khách hàng.

Các file chính:

```text
rule_based_nlu.py
ml_nlu.py
training_data_loader.py
train_intent_emotion_models.py
```

Vai trò:

* `rule_based_nlu.py`: hiểu tin nhắn bằng luật keyword.
* `ml_nlu.py`: hiểu tin nhắn bằng model học máy.
* `training_data_loader.py`: đọc và kiểm tra dataset training.
* `train_intent_emotion_models.py`: train model intent/emotion từ CSV.

---

### `app/clients`

Chứa code gọi API bên ngoài.

File chính:

```text
backend_client.py
```

Vai trò:

* Gọi backend Spring Boot.
* Lấy product context cho AI.
* Không xử lý logic AI trong file này.

---

### `ai_training`

Chứa dataset huấn luyện AI.

File chính:

```text
intent_emotion_samples.csv
```

Dataset này dùng để train model:

```text
text → intent
text → emotion
```

Ví dụ:

```csv
text,intent,emotion
tôi muốn tìm áo khoác,PRODUCT_RECOMMENDATION,NEUTRAL
shop làm ăn quá chán tôi rất tức,COMPLAINT,ANGRY
```

---

### `models`

Chứa model đã train.

Ví dụ:

```text
intent_classifier.joblib
emotion_classifier.joblib
```

Các file này được sinh ra sau khi chạy script train model.

---

## 5. Cài đặt môi trường

Đứng tại thư mục:

```powershell
cd D:\Canim_Ecommerce\ai-service
```

Tạo môi trường ảo:

```powershell
python -m venv .venv
```

Kích hoạt môi trường ảo:

```powershell
.\.venv\Scripts\activate
```

Cài thư viện:

```powershell
pip install -r requirements.txt
```

Kiểm tra thư viện:

```powershell
python -c "import fastapi, uvicorn, pandas, sklearn, joblib, httpx; print('AI service dependencies OK')"
```

---

## 6. Cấu hình `.env`

Copy file mẫu:

```powershell
Copy-Item .env.example .env
```

Các biến quan trọng:

```env
APP_ENV=development
APP_NAME=Canim AI Service

AI_SERVICE_HOST=127.0.0.1
AI_SERVICE_PORT=8001

BACKEND_BASE_URL=http://localhost:8000/canim_ecommerce
BACKEND_PRODUCT_CONTEXT_PATH=/ai/products/context

CUSTOMER_FRONTEND_URL=http://localhost:5173
ADMIN_FRONTEND_URL=http://localhost:5174

AI_NLU_MODE=rule_based
DEBUG=true
```

---

## 7. Chạy AI Service

Đứng trong thư mục:

```powershell
cd D:\Canim_Ecommerce\ai-service
```

Bật môi trường ảo:

```powershell
.\.venv\Scripts\activate
```

Chạy FastAPI:

```powershell
uvicorn main:app --reload --port 8001
```

Health check:

```text
http://localhost:8001/health
```

Swagger UI:

```text
http://localhost:8001/docs
```

---

## 8. Test API Chatbot

Endpoint:

```text
POST /ai/chat
```

URL:

```text
http://localhost:8001/ai/chat
```

Request body:

```json
{
  "session_id": "sk_test",
  "message": "tôi muốn áo khoác xanh"
}
```

Response mẫu:

```json
{
  "reply": "Dạ được ạ. Anh/Chị cho em biết thêm loại sản phẩm, màu sắc, size hoặc khoảng giá mong muốn để em gợi ý chính xác hơn nha.",
  "intent": "PRODUCT_RECOMMENDATION",
  "emotion": "NEUTRAL",
  "should_handoff": false,
  "handoff_reason": null
}
```

Test case khách tức giận:

```json
{
  "session_id": "sk_test",
  "message": "shop làm ăn quá chán tôi rất tức"
}
```

Response mong muốn:

```json
{
  "intent": "COMPLAINT",
  "emotion": "ANGRY",
  "should_handoff": true
}
```

---

## 9. NLU Mode: Rule-based và ML

AI Service hỗ trợ 2 chế độ hiểu ngôn ngữ:

```text
rule_based
ml
```

### 9.1. Rule-based mode

Cấu hình:

```env
AI_NLU_MODE=rule_based
```

Ý nghĩa:

```text
AI hiểu intent/emotion bằng luật keyword trong rule_based_nlu.py
```

Ví dụ:

```text
Có từ "áo", "quần", "váy" → PRODUCT_RECOMMENDATION
Có từ "tức", "bực", "ức chế" → ANGRY
```

Ưu điểm:

* Dễ hiểu.
* Dễ sửa.
* Không cần train model.
* Phù hợp giai đoạn đầu.

---

### 9.2. ML mode

Cấu hình:

```env
AI_NLU_MODE=ml
```

Ý nghĩa:

```text
AI dùng model đã train để dự đoán intent/emotion
```

Model được load từ:

```text
models/intent_classifier.joblib
models/emotion_classifier.joblib
```

Nếu model chưa tồn tại hoặc load lỗi, hệ thống sẽ fallback về rule-based để chatbot không bị crash.

---

## 10. Train model intent/emotion

Dataset training:

```text
ai_training/intent_emotion_samples.csv
```

Chạy train:

```powershell
cd D:\Canim_Ecommerce\ai-service
.\.venv\Scripts\activate

python -m app.nlu.train_intent_emotion_models
```

Sau khi train thành công, model được lưu tại:

```text
models/intent_classifier.joblib
models/emotion_classifier.joblib
```

Script train sử dụng:

```text
TfidfVectorizer
LogisticRegression
joblib
```

Luồng train:

```text
CSV dataset
↓
TrainingDatasetLoader validate dữ liệu
↓
TfidfVectorizer biến text thành vector số
↓
LogisticRegression học phân loại
↓
joblib lưu model ra file .joblib
```

---

## 11. Product Recommendation

Hiện tại service đã có recommendation dạng content-based đơn giản.

Luồng xử lý:

```text
Khách hỏi sản phẩm
↓
chat_service.py
↓
recommendation_service.py
↓
backend_client.py
↓
Spring Boot Backend Product Context API
```

Backend endpoint dự kiến:

```text
GET http://localhost:8000/canim_ecommerce/ai/products/context
```

Nếu backend trả product context, AI sẽ dùng các trường:

```text
name
categoryName
color
size
searchableText
```

để tính điểm phù hợp và gợi ý sản phẩm.

Nếu backend chưa chạy hoặc chưa có dữ liệu, AI service sẽ trả danh sách rỗng và chatbot fallback bằng cách hỏi thêm thông tin.

---

## 12. Logic handoff cho admin

Nếu khách có cảm xúc tức giận:

```text
emotion = ANGRY
```

hoặc khách khiếu nại:

```text
intent = COMPLAINT
```

chatbot có thể trả:

```json
{
  "should_handoff": true,
  "handoff_reason": "Khách có cảm xúc tức giận, cần nhân viên hỗ trợ kiểm tra."
}
```

Frontend có thể dùng field này để:

* Hiển thị thông báo kết nối nhân viên.
* Tạo ticket hỗ trợ.
* Gửi cảnh báo cho admin.
* Chuyển cuộc trò chuyện sang live chat sau này.

---

## 13. Các lệnh test nhanh

Test backend client:

```powershell
python -c "from app.clients.backend_client import backend_client; print(backend_client.build_url('/ai/products/context')); print(backend_client.get_product_contexts())"
```

Test ML NLU:

```powershell
python -c "from app.nlu.ml_nlu import ml_nlu_service; print(ml_nlu_service.predict_intent('tôi muốn áo khoác xanh')); print(ml_nlu_service.predict_emotion('shop làm ăn quá chán tôi rất tức'))"
```

Test service intent/emotion:

```powershell
python -c "from app.services.intent_service import intent_service; from app.services.emotion_service import emotion_service; print(intent_service.classify('tôi muốn áo khoác xanh')); print(emotion_service.classify('shop làm ăn quá chán tôi rất tức'))"
```

---

## 14. Git ignore

Không commit các file sau:

```text
.venv/
__pycache__/
*.pyc
.env
```

Có thể commit file mẫu:

```text
.env.example
```

Với model `.joblib`, team có thể chọn:

* Commit model nhỏ để demo nhanh.
* Không commit model nếu muốn bắt buộc train lại.

Trong giai đoạn đồ án/demo, có thể commit model nhỏ để leader hoặc thành viên khác clone về test nhanh hơn.

---

## 15. Ghi chú cho team

AI Service hiện tại là nền tảng bước đầu.

Đã có:

* FastAPI app.
* Chat API.
* Rule-based NLU.
* ML NLU loader.
* Training dataset.
* Training script.
* Intent/emotion model.
* Product recommendation service.
* Backend client.

Các bước nâng cấp tiếp theo:

1. Tạo `chatbot_dataset.csv` cho FAQ/Q&A.
2. Tạo dataset generator cho users/products/user_events/orders.
3. Nâng cấp recommendation bằng user behavior.
4. Tích hợp UI chatbot vào customer frontend.
5. Tạo dashboard/ticket handoff cho admin frontend.
