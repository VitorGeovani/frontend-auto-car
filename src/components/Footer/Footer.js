import React from "react";
import "./Footer.scss";
import {
  FaFacebookF,
  FaInstagram,
  FaWhatsapp,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
} from "react-icons/fa";
import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-about">
          <h3>Auto Car</h3>
          <p>
            Conectando você ao carro dos seus sonhos. Qualidade, confiança e
            atendimento de excelência desde 2010.
          </p>
          <div className="footer-socials">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
            >
              <FaFacebookF />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
            >
              <FaInstagram />
            </a>
            <a
              href="https://wa.me/5511912345678"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
            >
              <FaWhatsapp />
            </a>
          </div>
        </div>

        <div className="footer-contact">
          <h4>Contato</h4>
          <div className="contact-item">
            <FaEnvelope className="icon" />
            <p>atendimento@autocar.com.br</p>
          </div>
          <div className="contact-item">
            <FaPhone className="icon" />
            <p>(11) 91234-5678</p>
          </div>
          <div className="contact-item">
            <FaMapMarkerAlt className="icon" />
            <p>R. Campos Borges, 123 - São Paulo, SP</p>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {currentYear} Auto Car. Todos os direitos reservados.</p>
      </div>
    </footer>
  );
};

export default Footer;
