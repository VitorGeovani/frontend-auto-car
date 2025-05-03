// frontend/src/pages/Login/LoginCadastro.js
import React from 'react';
import { Link } from 'react-router-dom';
import './LoginCadastro.scss';
import { FaUser, FaUserShield, FaArrowLeft, FaCar } from 'react-icons/fa';

const LoginCadastro = () => {
  return (
    <div className="login-cadastro-page">
      <div className="login-container">
        <div className="logo">
          <FaCar />
          <h1>Auto Car <span>Acesso</span></h1>
        </div>
        
        <h2>Escolha seu tipo de acesso</h2>
        
        <div className="access-options">
          <Link to="/cliente-login" className="access-option">
            <div className="icon-container">
              <FaUser />
            </div>
            <div className="option-info">
              <h3>Sou Cliente</h3>
              <p>Acesse sua conta para ver histórico e agendar visitas</p>
            </div>
          </Link>
          
          <Link to="/admin/login" className="access-option">
            <div className="icon-container admin">
              <FaUserShield />
            </div>
            <div className="option-info">
              <h3>Sou Funcionário</h3>
              <p>Acesse o painel administrativo</p>
            </div>
          </Link>
        </div>
        
        <div className="back-link">
          <Link to="/">
            <FaArrowLeft /> Voltar para o site
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginCadastro;