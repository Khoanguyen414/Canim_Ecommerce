import ProductCard from "./ProductCard";

const products = Array.from({ length: 12 }).map((_, i) => ({
  id: i + 1,
  name: "Áo thun nam cotton",
  price: 149000 + i * 10000,
  image: `https://picsum.photos/300/300?random=${i}`,
}));

const ProductList = () => {
  return (
    <div className="container mt-4">
      <h5 className="mb-3">🔥 Sản phẩm nổi bật</h5>
      <div className="row">
        {products.map((p) => (
          <div key={p.id} className="col-md-3 mb-4">
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductList;
