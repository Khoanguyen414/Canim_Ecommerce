// src/pages/HomePage.jsx
import React, { useEffect, useState } from 'react';
import { productApi } from '../../api/product.api'; // Import file bạn vừa sửa
import ProductCard from '../../pages/user/components/ProductCard';
import '../../assets/css/home.css';

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        
        // 1. Gọi API theo cách cũ của bạn
        const response = await productApi.getAll(0, 12);

        // 2. LOGIC QUAN TRỌNG: Đào dữ liệu (Kiểm tra kỹ config axios của bạn)
        // Trường hợp 1: Nếu axios.ts KHÔNG có interceptor response (mặc định)
        // Cấu trúc: axios.data (http) -> apiResponse.data (backend) -> page.content (list)
        const productList = response.data?.data?.content || [];
        
        // Trường hợp 2: Nếu axios.ts CÓ interceptor (return response.data)
        // const productList = response.data?.content || [];

        setProducts(productList);

      } catch (error) {
        console.error("Lỗi tải sản phẩm:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="home-container">
       {/* Giữ nguyên phần banner... */}
       
       <div className="product-list-container">
        {loading ? (
          <p>Đang tải...</p>
        ) : (
          <div className="product-grid">
            {products.map((product) => (
              // Truyền đúng object product xuống
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;