import React, { useState } from "react";
import "./Register.scss";

const Register = () => {
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    senha: "",
    telefone: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Dados enviados:", formData);
  };

  return (
    <div className="register-container">
      <h2>Cadastro de Cliente</h2>
      <form onSubmit={handleSubmit} className="register-form">
        <input
          type="text"
          name="nome"
          placeholder="Nome completo"
          value={formData.nome}
          onChange={handleChange}
          required
        />
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
        <input
          type="tel"
          name="telefone"
          placeholder="Telefone"
          value={formData.telefone}
          onChange={handleChange}
        />
        <button type="submit">Cadastrar</button>
      </form>
    </div>
  );
};

export default Register;
