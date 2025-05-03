import React from "react";
import "./Contact.scss";
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Corrigir o problema de ícones do Leaflet no webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png'
});

const Contact = () => {
  // Coordenadas aproximadas para R. Campos Borges - São Paulo
  const position = [-23.5489, -46.6388];
  
  return (
    <section className="contact" id="contact">
      <div className="map-background">
        <MapContainer 
          center={position} 
          zoom={15} 
          scrollWheelZoom={false}
          zoomControl={false}
          dragging={false}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <Marker position={position}>
            <Popup>
              R. Campos Borges, 123<br />
              Jd. São Bento Novo<br />
              São Paulo - SP
            </Popup>
          </Marker>
        </MapContainer>
      </div>
      <div className="overlay"></div>
      <div className="contact-container">
        <h2>Fale Conosco</h2>
        <p>Estamos prontos para te atender. Agende uma visita, tire dúvidas ou solicite uma simulação!</p>

        <div className="contact-content">
          <form className="contact-form">
            <input type="text" placeholder="Seu nome" required />
            <input type="email" placeholder="Seu e-mail" required />
            <textarea placeholder="Digite sua mensagem..." rows="5" required></textarea>
            <button type="submit">Enviar Mensagem</button>
          </form>

          <div className="contact-info">
            <div>
              <FaPhoneAlt className="icon" />
              <span>(11) 91234-5678</span>
            </div>
            <div>
              <FaEnvelope className="icon" />
              <span>contato@marciodiasveiculos.com</span>
            </div>
            <div>
              <FaMapMarkerAlt className="icon" />
              <span>R. Campos Borges, 123 - Jd. São Bento Novo, São Paulo - SP</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;