import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./FuncionarioLogin.scss";
import api from "../../services/api";

const FuncionarioLogin = () => {
  const [formData, setFormData] = useState({ email: "", senha: "" });
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
      const response = await api.post("/admin/login", formData);

      localStorage.setItem("adminToken", response.data.token);
      localStorage.setItem("adminData", JSON.stringify(response.data.admin));

      navigate("/dashboard");
    } catch (err) {
      console.error("Erro ao fazer login:", err);
      setError(
        err.response?.data?.erro || "Credenciais inválidas. Tente novamente."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="funcionario-login">
      <h2>Login de Funcionário</h2>
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          placeholder="E-mail"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="senha"
          placeholder="Senha"
          value={formData.senha}
          onChange={handleChange}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "Processando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
};

export default FuncionarioLogin;
