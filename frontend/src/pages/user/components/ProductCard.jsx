// src/components/ProductCard.jsx
import React from 'react';
import '../../../assets/css/ProductCard.css';

const ProductCard = ({ product }) => {
  // 1. Xử lý ảnh: Lấy ảnh đầu tiên trong mảng, nếu không có thì dùng ảnh rỗng
  const mainImage = product.images && product.images.length > 0 
      ? product.images[0].imageUrl 
      : "https://via.placeholder.com/300"; // Ảnh mặc định nếu chưa upload

  // 2. Giả lập dữ liệu Shopee (Vì backend chưa có field sold, rating)
  const fakeSold = product.id * 12 + 5; 
  
  return (
    <div className="product-card">
      <div className="product-img-wrapper">
        <img src={mainImage} alt={product.name} />
        {/* ... code giảm giá ... */}
      </div>
      
      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        <div className="price-section">
          <span className="current-price">
            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
          </span>
        </div>
        <div className="meta-info">
           <span>Đã bán {fakeSold}</span>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;