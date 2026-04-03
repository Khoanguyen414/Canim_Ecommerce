import api from "../utils/axios";

// --- 1. Định nghĩa các kiểu dữ liệu khớp với Backend Spring Boot ---

// Khớp với entity ProductImage
export interface ProductImage {
  id?: number;
  imageUrl: string; 
}

// Khớp với ProductResponse DTO
export interface Product {
  id: number;
  sku: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number; // Backend chưa có, ta để optional (?)
  shortDesc: string;
  images: ProductImage[]; // Quan trọng: Backend trả về list ảnh
  categoryId: number;
}

// Khớp với Page<ProductResponse> của Spring Data
export interface PageData<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

// Khớp với ApiResponse của Controller
export interface ApiResponse<T> {
  status: string; // "SUCCESS"
  message: string;
  data: T;
}

// --- 2. Code API cũ của bạn (chỉ thêm Generic Type <...>) ---

export const productApi = {
  // Thêm <ApiResponse<PageData<Product>>> để biết hàm này trả về gì
  getAll: (page = 0, size = 12) =>
    api.get<ApiResponse<PageData<Product>>>("/products", {
      params: { page, size, sort: 'createdAt,desc' }, // Thêm sort để mới nhất lên đầu
    }),

  getById: (id: number) =>
    api.get<ApiResponse<Product>>(`/products/${id}`),

  getBySlug: (slug: string) =>
    api.get<ApiResponse<Product>>(`/products/slug/${slug}`),
};