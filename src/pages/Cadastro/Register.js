import React, { useState } from 'react';
import './Register.scss';
import axios from 'axios';

const Register = () => {
  const [formData, setFormData] = useState({ nome: '', email: '', senha: '' });

  const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleSubmit = e => {
    e.preventDefault();
    axios.post('/api/clientes', formData)
      .then(res => alert('Cadastro realizado!'));
  };

  return (
    <form className="register-form" onSubmit={handleSubmit}>
      <input type="text" name="nome" placeholder="Nome" onChange={handleChange} />
      <input type="email" name="email" placeholder="Email" onChange={handleChange} />
      <input type="password" name="senha" placeholder="Senha" onChange={handleChange} />
      <button type="submit">Cadastrar</button>
    </form>
  );
};

export default Register;