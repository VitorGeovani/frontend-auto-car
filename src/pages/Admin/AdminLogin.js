import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../services/api";
import "./AdminLogin.scss";
import { FaLock, FaEnvelope, FaCar, FaArrowLeft, FaHome } from "react-icons/fa";

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    email: "",
    senha: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Corrigido o endpoint para usar o prefixo /auth
      const response = await api.post("/auth/admin/login", formData);

      // Armazenar token e dados do admin em localStorage
      localStorage.setItem("adminToken", response.data.token);
      localStorage.setItem("adminData", JSON.stringify(response.data.admin));

      // Redirecionar para o dashboard admin
      navigate("/admin/");
    } catch (err) {
      console.error("Erro ao fazer login:", err);
      setError(err.response?.data?.erro || "Email ou senha incorretos");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login">
      <div className="login-container">
        <div className="logo">
          <FaCar />
          <h1>
            Auto Car <span>Admin</span>
          </h1>
        </div>

        <h2>Acesso Administrativo</h2>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">
              <FaEnvelope />
            </label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="senha">
              <FaLock />
            </label>
            <input
              type="password"
              id="senha"
              name="senha"
              placeholder="Senha"
              value={formData.senha}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Processando..." : "Entrar"}
          </button>
        </form>

        <div className="navigation-links">
          <Link to="/login-cadastro" className="back-option">
            <FaArrowLeft /> Voltar às opções de acesso
          </Link>
          <Link to="/" className="back-home">
            <FaHome /> Voltar ao site
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
