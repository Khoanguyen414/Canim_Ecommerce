# Canim Admin Frontend

Project admin React tach rieng khoi storefront frontend.

## Chuc nang hien tai

- Dang nhap bang tai khoan co quyen `ADMIN`
- Route admin duoc bao ve session JWT
- Dashboard thong ke nhanh
- Cac trang danh sach co ban: products, categories, roles, suppliers, warehouses

## Chay local

```bash
cp .env.example .env
npm install
npm run dev
```

## Bien moi truong

- `VITE_API_BASE_URL`: URL backend, mac dinh `http://localhost:8000/canim_ecommerce`

## Huong mo rong tiep

- Tao CRUD form rieng cho tung module
- Tach service layer theo module (`product.service`, `category.service`, ...)
- Them design system (Tailwind hoặc UI library) neu can giao dien enterprise
