"""
# CanimShop - Hệ Thống E-Commerce

## Giới Thiệu Dự Án

**CanimShop** là một nền tảng mua sắm trực tuyến hiện đại được xây dựng với công nghệ web mới nhất. 
Dự án bao gồm **Frontend React** + **Backend Spring Boot**, tập trung vào trải nghiệm người dùng tuyệt vời 
và hiệu suất cao.

---

## 🚀 Công Nghệ Sử Dụng

### Frontend (React + Vite)
- **React 19.2** - UI Framework
- **TypeScript** - Type safety
- **Vite 7.2** - Build tool
- **Tailwind CSS** - Styling
- **Shadcn/UI** - UI Components
- **Lucide React** - Icons
- **Zustand** - State management
- **React Router v7** - Routing
- **Axios** - HTTP Client

### Backend (Java + Spring Boot)
- **Spring Boot** - Framework
- **PostgreSQL** - Database
- **Flyway** - Migrations
- **Maven** - Build tool
- **JWT** - Authentication

---

## 📁 Cấu Trúc Dự Án

```
Canim_Ecommerce/
├── backend/                     # Spring Boot API
│   └── canim_ecommerce/
│       ├── src/
│       ├── pom.xml
│       └── Dockerfile
│
└── frontend/                    # React App
    ├── src/
    │   ├── components/         # React Components
    │   ├── pages/              # Page Components
    │   ├── store/              # Zustand Stores
    │   ├── api/                # API Integration
    │   └── utils/              # Utilities
    ├── package.json
    └── vite.config.js
```

---

## ⚙️ Cài Đặt & Chạy

### 1. Frontend Setup
```bash
cd frontend
npm install
npm run dev          # Phát triển
npm run build        # Build production
npm run lint         # Kiểm tra linting
```

### 2. Backend Setup
```bash
cd backend/canim_ecommerce
./mvnw clean install
./mvnw spring-boot:run
```

### 3. Sử Dụng Docker
```bash
docker-compose up    # Chạy cả frontend + backend
docker-compose down  # Dừng containers
```

---

## 📋 Các Tính Năng Chính

### 1. Authentication (Xác Thực)
- ✅ Đăng ký tài khoản
- ✅ Đăng nhập/Đăng xuất
- ✅ Quên mật khẩu
- ✅ Quản lý hồ sơ
- ✅ JWT Token Management

### 2. Shopping (Mua Sắm)
- ✅ Duyệt sản phẩm
- ✅ Tìm kiếm & Lọc
- ✅ Xem chi tiết sản phẩm
- ✅ Đánh giá & Bình luận
- ✅ Danh sách yêu thích

### 3. Cart & Checkout (Giỏ & Thanh Toán)
- ✅ Thêm/xóa từ giỏ hàng
- ✅ Tính tổng giá tự động
- ✅ Process thanh toán
- ✅ Nhiều phương thức thanh toán
- ✅ Lịch sử đơn hàng

### 4. Orders (Đơn Hàng)
- ✅ Tạo đơn hàng
- ✅ Theo dõi trạng thái
- ✅ Xem lịch sử
- ✅ Hủy/Trả hàng
- ✅ Xuất hóa đơn

### 5. Admin Dashboard
- ✅ Quản lý sản phẩm
- ✅ Quản lý đơn hàng
- ✅ Quản lý khách hàng
- ✅ Thống kê doanh số
- ✅ Quản lý danh mục

---

## 🔒 Bảo Mật

### Frontend Security
- ✅ JWT Token trong localStorage
- ✅ CSRF Protection
- ✅ XSS Prevention
- ✅ Environment variables

### Backend Security
- ✅ Spring Security
- ✅ Password Hashing (bcrypt)
- ✅ Role-Based Access Control (RBAC)
- ✅ API Rate Limiting
- ✅ Input Validation

---

## 📊 API Endpoints

### Authentication
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/refresh-token
GET    /api/auth/profile
```

### Products
```
GET    /api/products
GET    /api/products/:id
GET    /api/categories
GET    /api/products/reviews
```

### Cart
```
GET    /api/cart
POST   /api/cart/items
PUT    /api/cart/items/:id
DELETE /api/cart/items/:id
```

### Orders
```
POST   /api/orders
GET    /api/orders
GET    /api/orders/:id
PUT    /api/orders/:id
```

---

## 🎨 Theming & Styling

### Tailwind CSS Configuration
- Sử dụng CSS Variables cho consistent theming
- Dark mode support
- Component utility classes
- Responsive design

### Color Scheme
```
Primary:      #[Đỏ chính]
Secondary:    #[Xám phụ]
Destructive:  #[Đỏ cảnh báo]
Muted:        #[Xám muted]
```

---

## 📈 Performance Optimization

### Frontend
- Code splitting by route
- Lazy loading components
- Image optimization
- Caching strategies
- Tree shaking

### Backend
- Database connection pooling
- Query optimization
- Redis caching
- Async processing
- Pagination

---

## 🧪 Testing

### Unit Tests
```bash
npm run test
```

### Integration Tests
```bash
npm run test:integration
```

### E2E Tests
```bash
npm run test:e2e
```

---

## 📝 Quy Ước Code

### Naming
- Components: PascalCase (`ProductCard.tsx`)
- Functions: camelCase (`handleSubmit()`)
- Constants: UPPER_SNAKE_CASE (`MAX_ITEMS`)
- Interfaces: PascalCase (`ProductProps`)

### File Organization
- Một component chính = một file
- Related files trong cùng folder
- Index files để export
- Tests cạnh file

### Formatting
- Sử dụng Prettier
- ESLint rules enforcement
- Type safety strict mode

---

## 🚨 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Database Connection Error
```bash
# Check PostgreSQL
sudo service postgresql status
```

### CORS Issues
```
Kiểm tra backend CORS configuration
```

### Build Errors
```bash
# Clear cache
rm -rf node_modules package-lock.json
npm install
npm run build
```

---

## 📚 Tài Liệu Tham Khảo

- [React Docs](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Shadcn/UI](https://ui.shadcn.com)
- [Spring Boot](https://spring.io/projects/spring-boot)
- [PostgreSQL](https://www.postgresql.org)

---

## 👥 Team & Support

- **Website:** https://canimshop.com
- **Email:** support@canimshop.com
- **Phone:** +84 (0) 123 456 789
- **Address:** Ho Chi Minh City, Vietnam

---

## 📄 License

MIT License - Copyright © 2024 CanimShop

---

**Last Updated:** March 2024
**Version:** 1.0.0
"""
