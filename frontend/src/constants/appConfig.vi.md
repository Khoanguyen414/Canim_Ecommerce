***

# Cấu Hình Dự Án E-Commerce CanimShop

## Tổng Quan Dự Án

**Tên Dự Án:** CanimShop - Nền Tảng Mua Sắm Trực Tuyến
**Phiên Bản:** 1.0.0
**Mô Tả:** Ứng dụng e-commerce hiện đại được xây dựng bằng React, TypeScript, Vite và Tailwind CSS.

---

## Công Nghệ Sử Dụng

### Frontend Stack
- **Framework:** React 19.2.0 + TypeScript
- **Build Tool:** Vite 7.2.4
- **Styling:** Tailwind CSS + Shadcn/UI Components
- **Icons:** Lucide React 1.3.0
- **State Management:** Zustand 5.0.9
- **Routing:** React Router DOM 7.11.0
- **Form Handling:** React Hook Form 7.69.0
- **HTTP Client:** Axios 1.13.2
- **UI Library:** Bootstrap Icons & React Icons

### Backend Stack
- **Framework:** Spring Boot (Java)
- **Database:** PostgreSQL với Flyway migrations
- **Build:** Maven
- **Docker:** Containerization support

### Development Tools
- **Linter:** ESLint 9.39.2
- **Formatter:** Prettier 3.7.4
- **Babel Plugin:** React Compiler 1.0.0

---

## Cấu Trúc Thư Mục

```
Canim_Ecommerce/
├── backend/                          # Spring Boot API Server
│   └── canim_ecommerce/
│       ├── src/
│       │   ├── main/
│       │   │   ├── java/com/example/canim_ecommerce/
│       │   │   │   ├── controller/      # REST Controllers
│       │   │   │   ├── service/         # Business Logic
│       │   │   │   ├── repository/      # JPA Repositories
│       │   │   │   ├── entity/          # JPA Entities
│       │   │   │   ├── dto/             # Data Transfer Objects
│       │   │   │   ├── mapper/          # Entity-DTO Mappers
│       │   │   │   ├── security/        # Security Config
│       │   │   │   ├── config/          # Configuration
│       │   │   │   ├── exception/       # Custom Exceptions
│       │   │   │   └── utils/           # Utility Classes
│       │   │   └── resources/
│       │   │       ├── application.properties
│       │   │       └── db/migration/    # Flyway SQL Migrations
│       │   └── test/
│       ├── pom.xml                  # Maven Configuration
│       ├── Dockerfile               # Docker Image
│       └── docker-compose.yml       # Docker Compose
│
└── frontend/                         # React Vite App
    ├── src/
    │   ├── components/
    │   │   ├── ui/                  # Shadcn/UI Components
    │   │   │   ├── button.tsx
    │   │   │   ├── input.tsx
    │   │   │   ├── card.tsx
    │   │   │   ├── badge.tsx
    │   │   │   └── select.tsx
    │   │   ├── common/              # Common Components
    │   │   │   ├── Header.tsx       # Navigation
    │   │   │   └── Footer.tsx       # Footer
    │   │   ├── product/             # Product Components
    │   │   │   ├── ProductCard.tsx
    │   │   │   ├── ProductGrid.tsx
    │   │   │   └── ProductFilter.tsx
    │   │   └── cart/                # Cart Components
    │   │       ├── CartItem.tsx
    │   │       └── CartSummary.tsx
    │   ├── layouts/
    │   │   ├── MainLayout.tsx       # Main layout with Header/Footer
    │   │   └── AuthLayout.tsx       # Auth pages layout
    │   ├── pages/
    │   │   ├── auth/                # Authentication Pages
    │   │   │   ├── Login.tsx
    │   │   │   └── Register.tsx
    │   │   ├── user/                # User Pages
    │   │   │   ├── HomePage.jsx
    │   │   │   └── UserProfile.tsx
    │   │   ├── shopping/            # Shopping Pages
    │   │   │   ├── Products.tsx
    │   │   │   ├── ProductDetail.tsx
    │   │   │   └── Categories.tsx
    │   │   ├── cart/
    │   │   │   └── Cart.tsx
    │   │   ├── checkout/            # Checkout Pages
    │   │   │   ├── Checkout.tsx
    │   │   │   ├── Address.tsx
    │   │   │   ├── Payment.tsx
    │   │   │   └── OrderConfirm.tsx
    │   │   └── admin/               # Admin Pages
    │   │       ├── Dashboard.tsx
    │   │       ├── Products.tsx
    │   │       ├── Orders.tsx
    │   │       └── Users.tsx
    │   ├── router/
    │   │   └── AppRouter.tsx        # Route definitions
    │   ├── store/                   # Zustand Stores
    │   │   ├── auth.store.ts        # Authentication
    │   │   ├── product.store.ts     # Products state
    │   │   ├── cart.store.ts        # Shopping cart
    │   │   └── order.store.ts       # Orders
    │   ├── api/                     # API Services
    │   │   ├── auth.api.ts          # Auth endpoints
    │   │   ├── product.api.ts       # Product endpoints
    │   │   ├── cart.api.ts          # Cart endpoints
    │   │   └── order.api.ts         # Order endpoints
    │   ├── utils/                   # Utilities
    │   │   ├── axios.ts             # Axios configuration
    │   │   └── cn.ts                # CSS utilities
    │   ├── constants/               # Constants & Config
    │   ├── assets/                  # Static Assets
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── public/                      # Public Assets
    │   └── products/                # Product Images
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── tsconfig.json
    └── eslint.config.js
```

---

## Tính Năng Chính

### 1. Xác Thực & Quản Lý Tài Khoản
- ✅ Đăng ký tài khoản
- ✅ Đăng nhập với email/mật khẩu
- ✅ Quản lý hồ sơ người dùng
- ✅ Đổi mật khẩu
- ✅ Quên mật khẩu (token reset)

### 2. Quản Lý Sản Phẩm
- ✅ Danh sách sản phẩm với phân trang
- ✅ Tìm kiếm sản phẩm
- ✅ Lọc theo danh mục, giá, đánh giá
- ✅ Xem chi tiết sản phẩm
- ✅ Lựa chọn màu sắc & kích thước
- ✅ Đánh giá & bình luận sản phẩm

### 3. Giỏ Hàng & Thanh Toán
- ✅ Thêm/xóa sản phẩm khỏi giỏ
- ✅ Cập nhật số lượng
- ✅ Tính tổng giá tự động
- ✅ Lưu giỏ hàng (localStorage/API)
- ✅ Checkout process
- ✅ Nhập địa chỉ giao hàng
- ✅ Chọn phương thức thanh toán

### 4. Đơn Hàng & Lịch Sử
- ✅ Xem lịch sử đơn hàng
- ✅ Theo dõi trạng thái đơn hàng
- ✅ Hủy đơn hàng
- ✅ Trả hàng/Hoàn tiền
- ✅ In hóa đơn

### 5. Danh Mục & Lọc
- ✅ Hiển thị danh mục sản phẩm
- ✅ Lọc theo giá
- ✅ Lọc theo đánh giá
- ✅ Lọc theo tính sẵn có
- ✅ Sắp xếp (giá, mới nhất, bán chạy)

### 6. Yêu Thích
- ✅ Thêm sản phẩm vào danh sách yêu thích
- ✅ Quản lý danh sách yêu thích
- ✅ Chia sẻ wishlist

### 7. Admin Dashboard
- ✅ Quản lý sản phẩm
- ✅ Quản lý đơn hàng
- ✅ Quản lý người dùng
- ✅ Thống kê doanh số
- ✅ Quản lý danh mục

---

## API Endpoints

### Authentication
```
POST   /api/auth/register       - Đăng ký
POST   /api/auth/login          - Đăng nhập
POST   /api/auth/logout         - Đăng xuất
POST   /api/auth/refresh-token  - Làm mới token
GET    /api/auth/profile        - Lấy profil
PUT    /api/auth/profile        - Cập nhật profil
```

### Products
```
GET    /api/products            - Danh sách sản phẩm
GET    /api/products/:id        - Chi tiết sản phẩm
GET    /api/categories          - Danh sách danh mục
GET    /api/categories/:id      - Chi tiết danh mục
GET    /api/products/reviews    - Bình luận sản phẩm
```

### Cart
```
GET    /api/cart                - Lấy giỏ hàng
POST   /api/cart/items          - Thêm vào giỏ
PUT    /api/cart/items/:id      - Cập nhật giỏ
DELETE /api/cart/items/:id      - Xóa khỏi giỏ
DELETE /api/cart                - Xóa giỏ hàng
```

### Orders
```
POST   /api/orders              - Tạo đơn hàng
GET    /api/orders              - Danh sách đơn hàng
GET    /api/orders/:id          - Chi tiết đơn hàng
PUT    /api/orders/:id          - Cập nhật đơn hàng
DELETE /api/orders/:id          - Hủy đơn hàng
```

---

## Quy Trình Phát Triển

### Frontend Development
```bash
# Cài đặt dependencies
npm install

# Phát triển (dev server)
npm run dev

# Build version production
npm run build

# Preview build
npm run preview

# Kiểm tra linting
npm run lint
```

### Backend Development
```bash
# Build project
./mvnw clean package

# Chạy ứng dụng
./mvnw spring-boot:run

# Chạy database migrations
./mvnw flyway:migrate
```

### Docker
```bash
# Build images
docker-compose build

# Chạy containers
docker-compose up

# Stop containers
docker-compose down
```

---

## Quy Ước Mã Hóa

### Naming Conventions
- **Components:** PascalCase (e.g., `ProductCard.tsx`)
- **Files:** camelCase hoặc kebab-case (e.g., `auth.store.ts`)
- **Functions:** camelCase (e.g., `fetchProducts()`)
- **Constants:** UPPER_SNAKE_CASE (e.g., `MAX_ITEMS = 10`)
- **Types/Interfaces:** PascalCase (e.g., `ProductProps`)

### File Organization
- Một component chính = một file
- Related files trong cùng folder
- Index files để export
- Tests cạnh file được test

### Code Style
- Use Prettier for formatting
- Use ESLint for linting
- Comment tiếng Anh/Việt cho xcode phức tạp
- Viết unit tests cho logic quan trọng

---

## Biến Môi Trường

### Frontend (.env)
```
VITE_API_URL=http://localhost:8080/api
VITE_APP_NAME=CanimShop
VITE_APP_VERSION=1.0.0
```

### Backend (application.properties)
```
spring.datasource.url=jdbc:postgresql://localhost:5432/canim_ecommerce
spring.datasource.username=postgres
spring.jpa.hibernate.ddl-auto=validate
server.port=8080
```

---

## Bảo Mật

### Frontend
- ✅ Lưu JWT token trong localStorage
- ✅ Refresh token rotation
- ✅ CSRF protection
- ✅ XSS prevention through React
- ✅ Secure HTTP-only cookies

### Backend
- ✅ JWT Bearer token authentication
- ✅ Role-based access control (RBAC)
- ✅ Input validation & sanitization
- ✅ SQL injection prevention
- ✅ Password hashing (bcrypt)
- ✅ Rate limiting
- ✅ CORS configuration

---

## Hiệu Suất

### Frontend Optimization
- ✅ Code splitting by route
- ✅ Lazy loading components
- ✅ Image optimization
- ✅ Caching strategies
- ✅ Tree shaking enabled

### Backend Optimization
- ✅ Database query optimization
- ✅ Connection pooling
- ✅ Caching (Redis)
- ✅ Pagination for large datasets
- ✅ Async processing for heavy tasks

---

## Kiểm Thử

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

## CI/CD Pipeline

### GitHub Actions
- ✅ Lint & Format Check
- ✅ Unit Tests
- ✅ Build Verification
- ✅ Docker Build & Push
- ✅ Deployment

---

## Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Kill process on port 8080
lsof -ti:8080 | xargs kill -9
```

#### Database Connection Error
```bash
# Check PostgreSQL service
sudo service postgresql status
```

#### CORS Issues
```bash
# Ensure backend CORS config includes frontend origin
```

---

## Tài Liệu Tham Khảo

- [React Documentation](https://react.dev)
- [React Router v7](https://reactrouter.com)
- [Tailwind CSS](https://tailwindcss.com)
- [Shadcn/UI](https://ui.shadcn.com)
- [Spring Boot](https://spring.io/projects/spring-boot)
- [PostgreSQL](https://www.postgresql.org)

---

## Liên Hệ & Support

- **Website:** https://canimshop.com
- **Email:** support@canimshop.com
- **Phone:** +84 (0) 123 456 789
- **Address:** Ho Chi Minh City, Vietnam

---

**Last Updated:** March 2024
**Maintained By:** CanimShop Development Team

***
