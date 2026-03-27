import { useState } from "react";
import { useAuthStore } from "../../store/auth.store";
import { useNavigate, Link } from "react-router-dom";
import { FiMail, FiLock } from "react-icons/fi";

const Login = () => {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate("/");
    } catch {
      setError("Email hoặc mật khẩu không đúng");
    }
  };

  return (
    <div className="shop-bg">
      <div className="shop-card">

        {/* FORM */}
        <div className="shop-form">
          <h2>Đăng nhập</h2>
          <p>Mua sắm thả ga – Giá tốt mỗi ngày</p>

          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="shop-input">
              <FiMail />
              <input
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="shop-input">
              <FiLock />
              <input
                type="password"
                placeholder="Mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button className="shop-btn">Đăng nhập</button>
          </form>

          <span className="shop-link">
            Chưa có tài khoản? <Link to="/register">Đăng ký</Link>
          </span>
        </div>

        {/* HÌNH SẢN PHẨM */}
        <div className="shop-images">
  <img
    src="/products/shop-banner.png"
    alt="shopping"
    className="shop-banner"
  />
</div>


      </div>
    </div>
  );
};

export default Login;
