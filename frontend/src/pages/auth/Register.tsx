import { useState } from "react";
import { authApi } from "../../api/auth.api";
import { useNavigate } from "react-router-dom";
import "../../assets/css/auth.css";

const Register = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    fullName: "",
    password: "",
    phone: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await authApi.register(form);
    navigate("/login");
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h3 className="text-center auth-title">🛍️ Tạo tài khoản</h3>
        <p className="text-center auth-subtitle">
          Tham gia mua sắm hàng ngàn sản phẩm giá tốt
        </p>

        <form onSubmit={handleSubmit}>
          <div className="auth-input-group mb-3">
            <i className="bi bi-envelope"></i>
            <input
              className="form-control"
              placeholder="Email"
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
            />
          </div>

          <div className="auth-input-group mb-3">
            <i className="bi bi-person"></i>
            <input
              className="form-control"
              placeholder="Họ và tên"
              onChange={(e) =>
                setForm({ ...form, fullName: e.target.value })
              }
            />
          </div>

          <div className="auth-input-group mb-3">
            <i className="bi bi-lock"></i>
            <input
              type="password"
              className="form-control"
              placeholder="Mật khẩu"
              onChange={(e) =>
                setForm({ ...form, password: e.target.value })
              }
            />
          </div>

          <div className="auth-input-group mb-4">
            <i className="bi bi-telephone"></i>
            <input
              className="form-control"
              placeholder="Số điện thoại"
              onChange={(e) =>
                setForm({ ...form, phone: e.target.value })
              }
            />
          </div>

          <button className="btn btn-shop w-100">
            Đăng ký ngay
          </button>
        </form>

        <p className="text-center mt-3">
          Đã có tài khoản?{" "}
          <span
            style={{ color: "#ff5722", cursor: "pointer" }}
            onClick={() => navigate("/login")}
          >
            Đăng nhập
          </span>
        </p>
      </div>
    </div>
  );
};

export default Register;
