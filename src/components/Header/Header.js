import React, { useState, useEffect } from "react";
import "./Header.scss";
import { FaCar, FaPhoneAlt, FaSignInAlt, FaUser } from "react-icons/fa";
import { Link } from "react-router-dom";

const Header = () => {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    // Verificar se o usuário está logado ao carregar o componente
    const userDataString = localStorage.getItem('userData');
    if (userDataString) {
      try {
        const parsedUserData = JSON.parse(userDataString);
        setUserData(parsedUserData);
      } catch (error) {
        console.error("Erro ao processar dados do usuário:", error);
      }
    }

    // Adicionar um event listener para atualizar o header quando o login for bem-sucedido
    const handleStorageChange = () => {
      const updatedUserData = localStorage.getItem('userData');
      if (updatedUserData) {
        try {
          setUserData(JSON.parse(updatedUserData));
        } catch (error) {
          console.error("Erro ao processar dados do usuário:", error);
        }
      } else {
        setUserData(null);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Criando um evento personalizado que podemos disparar após o login
    window.addEventListener('userLogin', handleStorageChange);

    // Limpar os event listeners ao desmontar o componente
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userLogin', handleStorageChange);
    };
  }, []);

  // Função para realizar logout
  const handleLogout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userData');
    setUserData(null);
  };

  return (
    <header className="header">
      <div className="container">
        <div className="logo">
          <a href="/" className="logo-link"><FaCar className="logo-icon" /></a>
          <span>Auto Car</span>
        </div>
        <nav className="nav">
          <a href="#about">Sobre</a>
          <a href="#services">Serviços</a>
          <a href="#cars">Carros</a>
          <a href="#testimonials">Depoimentos</a>
          <a href="#contact">Contato</a>
        </nav>
        <div className="header-buttons">
          <a href="#contact" className="cta-button">
            <FaPhoneAlt /> Agende sua visita
          </a>
          
          {userData ? (
            <div className="user-menu">
              <span className="user-greeting">
                <FaUser /> {userData.nome}
              </span>
              <button onClick={handleLogout} className="logout-button">
                Sair
              </button>
            </div>
          ) : (
            <Link to="/login-cadastro" className="login-button">
              <FaSignInAlt /> Entrar
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;