import React from "react";
import "./Footer.scss";
import { FaFacebookF, FaInstagram, FaWhatsapp } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-about">
          <h3>Auto Car</h3>
          <p>
            Conectando você ao carro dos seus sonhos. Qualidade, confiança e
            atendimento de excelência.
          </p>
        </div>

        <div className="footer-links">
          <h4>Links Rápidos</h4>
          <ul>
            <li><a href="#about">Sobre</a></li>
            <li><a href="#services">Serviços</a></li>
            <li><a href="#cars">Estoque</a></li>
            <li><a href="#contact">Contato</a></li>
          </ul>
        </div>

        <div className="footer-contact">
          <h4>Contato</h4>
          <p>Email: atendimento@marciodiasveiculos.com</p>
          <p>Telefone: (11) 91234-5678</p>
          <p>Endereço: R. Campos Borges, 123 - São Paulo, SP</p>

          <div className="footer-socials">
            <a href="#"><FaFacebookF /></a>
            <a href="#"><FaInstagram /></a>
            <a href="#"><FaWhatsapp /></a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Auto Car. Todos os direitos reservados.</p>
      </div>
    </footer>
  );
};

export default Footer;
