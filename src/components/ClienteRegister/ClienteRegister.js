// frontend/src/components/ClienteRegister/ClienteRegister.js
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './ClienteRegister.scss';
import api from '../../services/api';
import { FaUser, FaEnvelope, FaLock, FaPhone, FaCar } from 'react-icons/fa';

const ClienteRegister = () => {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    telefone: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await api.post('/usuarios', formData);
      navigate('/cliente-login');
      
    } catch (err) {
      console.error("Erro ao cadastrar:", err);
      setError(err.response?.data?.erro || 'Erro ao realizar o cadastro. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="client-register">
      <div className="register-container">
        <div className="logo">
          <FaCar />
          <h1>Auto Car <span>Cliente</span></h1>
        </div>
        
        <h2>Cadastro de Cliente</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="nome">
              <FaUser />
            </label>
            <input
              type="text"
              id="nome"
              name="nome"
              placeholder="Nome completo"
              value={formData.nome}
              onChange={handleChange}
              required
            />
          </div>
          
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
          
          <div className="form-group">
            <label htmlFor="telefone">
              <FaPhone />
            </label>
            <input
              type="tel"
              id="telefone"
              name="telefone"
              placeholder="Telefone"
              value={formData.telefone}
              onChange={handleChange}
              required
            />
          </div>
          
          <button type="submit" disabled={loading}>
            {loading ? 'Processando...' : 'Cadastrar'}
          </button>
        </form>
        
        <div className="form-footer">
          <p>Já tem uma conta? <Link to="/cliente-login">Faça login</Link></p>
        </div>
        
        <div className="back-link">
          <Link to="/">Voltar para o site</Link>
        </div>
      </div>
    </div>
  );
};

export default ClienteRegister;