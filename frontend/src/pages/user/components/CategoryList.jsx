const categories = [
  "Điện thoại",
  "Laptop",
  "Thời trang",
  "Gia dụng",
  "Phụ kiện",
];

const CategoryList = () => {
  return (
    <div className="container mt-4">
      <div className="row text-center">
        {categories.map((c, i) => (
          <div key={i} className="col">
            <div className="border rounded p-3">{c}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryList;
