import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './ClienteLogin.scss';
import api from '../../services/api';
import { FaLock, FaEnvelope, FaCar, FaArrowLeft, FaHome, FaSpinner } from 'react-icons/fa';

const ClienteLogin = () => {
  const [formData, setFormData] = useState({ email: '', senha: '' });
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
      console.log('Enviando requisição de login:', formData.email);
      // Notar o uso do endpoint correto com prefixo /auth
      const response = await api.post('/auth/usuario/login', formData);
      console.log('Resposta de login:', response.data);
      
      // Salvar token e dados do usuário no localStorage
      localStorage.setItem('userToken', response.data.token);
      localStorage.setItem('userData', JSON.stringify(response.data.usuario));
      
      // Disparar evento personalizado para notificar que o usuário fez login
      window.dispatchEvent(new Event('userLogin'));
      
      // Redirecionar para a página inicial
      navigate('/');
      
    } catch (err) {
      console.error("Erro ao fazer login:", err);
      
      // Obtém mensagem de erro da resposta da API ou usa uma mensagem padrão
      const errorMsg = err.response?.data?.erro || 
                      'Erro ao fazer login. Verifique suas credenciais.';
      
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="client-login">
      <div className="login-container">
        <div className="logo">
          <FaCar />
          <h1>Auto Car <span>Cliente</span></h1>
        </div>
        
        <h2>Login de Cliente</h2>
        
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
              disabled={loading}
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
              disabled={loading}
            />
          </div>
          
          <button type="submit" disabled={loading} className={loading ? 'loading-button' : ''}>
            {loading ? (
              <>
                <FaSpinner className="spin-icon" /> Processando...
              </>
            ) : (
              'Entrar'
            )}
          </button>
        </form>
        
        <div className="form-footer">
          <p>Não tem uma conta? <Link to="/cliente-register">Cadastre-se</Link></p>
        </div>
        
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

export default ClienteLogin;