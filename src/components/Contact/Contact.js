import React, { useState, useEffect } from "react";
import "./Contact.scss";
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaStar, FaCheck } from "react-icons/fa";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import api from '../../services/api';

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
  
  // Estados para gerenciar o formulário e feedback
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    cidade: '',
    depoimento: '',
    avaliacao: 5,
    tipoMensagem: 'contato' // pode ser 'contato' ou 'depoimento'
  });
  const [enviando, setEnviando] = useState(false);
  const [mensagemEnviada, setMensagemEnviada] = useState(false);
  const [erro, setErro] = useState(null);
  const [usuarioLogado, setUsuarioLogado] = useState(false);
  const [dadosUsuario, setDadosUsuario] = useState(null);
  const [camposPreenchidos, setCamposPreenchidos] = useState({
    nome: false,
    email: false
  });
  
  // Efeito para verificar se o usuário está logado e salvar seus dados
  useEffect(() => {
    // Verificar se o usuário está logado
    const userDataString = localStorage.getItem('userData');
    if (userDataString) {
      try {
        const userData = JSON.parse(userDataString);
        if (userData && userData.nome && userData.email) {
          // Salvar os dados do usuário para uso posterior
          setDadosUsuario(userData);
          setUsuarioLogado(true);
        }
      } catch (error) {
        console.error("Erro ao processar dados do usuário:", error);
      }
    }
    
    // Adicionar listener para atualizar se o usuário fizer login após carregar a página
    const handleUserLogin = () => {
      const updatedUserData = localStorage.getItem('userData');
      if (updatedUserData) {
        try {
          const userData = JSON.parse(updatedUserData);
          setDadosUsuario(userData);
          setUsuarioLogado(true);
        } catch (error) {
          console.error("Erro ao processar dados do usuário:", error);
        }
      }
    };
    
    window.addEventListener('userLogin', handleUserLogin);
    
    // Limpar listener ao desmontar o componente
    return () => {
      window.removeEventListener('userLogin', handleUserLogin);
    };
  }, []);
  
  // Gerenciador para foco nos campos de nome e email
  const handleFocus = (e) => {
    const { name } = e.target;
    
    // Se o campo estiver vazio e temos os dados do usuário, preencher automaticamente
    if (
      (name === 'nome' || name === 'email') && 
      dadosUsuario && 
      !formData[name] &&
      !camposPreenchidos[name]
    ) {
      // Definir o valor apenas se o campo estiver vazio
      setFormData(prevState => ({
        ...prevState,
        [name]: dadosUsuario[name] || ''
      }));
      
      // Marcar o campo como preenchido
      setCamposPreenchidos(prev => ({
        ...prev,
        [name]: true
      }));
    }
  };
  
  // Gerenciador de mudanças nos campos do formulário
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Se o usuário apagou todo o conteúdo, marcar como não preenchido
    if ((name === 'nome' || name === 'email') && value === '') {
      setCamposPreenchidos(prev => ({
        ...prev,
        [name]: false
      }));
    }
    
    // Atualizar o valor normalmente
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };
  
  // Gerenciador para alteração na avaliação
  const handleAvaliacaoChange = (novaAvaliacao) => {
    setFormData(prevState => ({
      ...prevState,
      avaliacao: novaAvaliacao
    }));
  };
  
  // Gerenciador para alteração no tipo de mensagem
  const handleTipoMensagemChange = (e) => {
    setFormData(prevState => ({
      ...prevState,
      tipoMensagem: e.target.value
    }));
  };
  
  // Função para enviar o formulário
  const handleSubmit = async (e) => {
    e.preventDefault();
    setEnviando(true);
    setErro(null);
    
    try {
      if (formData.tipoMensagem === 'depoimento') {
        // Enviar depoimento
        await api.post('/depoimentos', {
          nome_cliente: formData.nome,
          email: formData.email,
          cidade: formData.cidade,
          texto: formData.depoimento,
          avaliacao: formData.avaliacao
        });
      } else {
        // Enviar mensagem de contato normal
        await api.post('/contato', {
          nome: formData.nome,
          email: formData.email,
          cidade: formData.cidade,
          depoimento: formData.depoimento
        });
      }
      
      // Resetar o formulário mantendo os campos preenchidos marcados
      const nomePreenchido = camposPreenchidos.nome;
      const emailPreenchido = camposPreenchidos.email;
      
      // Resetar o formulário
      setFormData({
        nome: nomePreenchido && dadosUsuario ? dadosUsuario.nome : '',
        email: emailPreenchido && dadosUsuario ? dadosUsuario.email : '',
        cidade: '',
        depoimento: '',
        avaliacao: 5,
        tipoMensagem: 'contato'
      });
      
      setMensagemEnviada(true);
      
      // Esconder mensagem de sucesso após 5 segundos
      setTimeout(() => {
        setMensagemEnviada(false);
      }, 5000);
      
    } catch (error) {
      console.error('Erro ao enviar formulário:', error);
      setErro('Ocorreu um erro ao enviar sua mensagem. Por favor, tente novamente.');
    } finally {
      setEnviando(false);
    }
  };
  
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
        <p>Estamos prontos para te atender. Agende uma visita, tire dúvidas ou envie um depoimento!</p>

        {mensagemEnviada && (
          <div className="success-message">
            <FaCheck /> 
            {formData.tipoMensagem === 'depoimento' 
              ? 'Seu depoimento foi enviado com sucesso e será avaliado pela nossa equipe!'
              : 'Sua mensagem foi enviada com sucesso! Entraremos em contato em breve.'}
          </div>
        )}
        
        {erro && <div className="error-message">{erro}</div>}
        
        {usuarioLogado && (
          <div className="info-message">
            Seus dados serão preenchidos automaticamente ao clicar nos campos.
          </div>
        )}

        <div className="form-type-selector">
          <label>
            <input
              type="radio"
              name="tipoMensagem"
              value="contato"
              checked={formData.tipoMensagem === 'contato'}
              onChange={handleTipoMensagemChange}
            />
            Contato
          </label>
          <label>
            <input
              type="radio"
              name="tipoMensagem"
              value="depoimento"
              checked={formData.tipoMensagem === 'depoimento'}
              onChange={handleTipoMensagemChange}
            />
            Depoimento
          </label>
        </div>

        <div className="contact-content">
          <form className="contact-form" onSubmit={handleSubmit}>
            <input 
              type="text" 
              name="nome" 
              placeholder="Seu nome" 
              value={formData.nome}
              onChange={handleChange}
              onFocus={handleFocus}
              className={camposPreenchidos.nome ? 'pre-filled' : ''}
              required 
            />
            <input 
              type="email" 
              name="email" 
              placeholder="Seu e-mail" 
              value={formData.email}
              onChange={handleChange}
              onFocus={handleFocus}
              className={camposPreenchidos.email ? 'pre-filled' : ''}
              required 
            />
            <input 
              type="text" 
              name="cidade" 
              placeholder="Seu bairro" 
              value={formData.cidade}
              onChange={handleChange}
              required 
            />
            
            {formData.tipoMensagem === 'depoimento' && (
              <div className="avaliacao-container">
                <label>Sua avaliação:</label>
                <div className="estrelas">
                  {[1, 2, 3, 4, 5].map(valor => (
                    <FaStar 
                      key={valor} 
                      className={valor <= formData.avaliacao ? 'estrela ativa' : 'estrela'}
                      onClick={() => handleAvaliacaoChange(valor)}
                    />
                  ))}
                </div>
              </div>
            )}
            
            <textarea 
              name="depoimento" 
              placeholder={formData.tipoMensagem === 'depoimento' ? "Conte sua experiência conosco..." : "Digite sua mensagem..."}
              rows="5" 
              value={formData.depoimento}
              onChange={handleChange}
              required
            ></textarea>
            
            <button type="submit" disabled={enviando}>
              {enviando ? 'Enviando...' : formData.tipoMensagem === 'depoimento' ? 'Enviar Depoimento' : 'Enviar Mensagem'}
            </button>
          </form>

          <div className="contact-info">
            <div>
              <FaPhoneAlt className="icon" />
              <span>(11) 91234-5678</span>
            </div>
            <div>
              <FaEnvelope className="icon" />
              <span>sincerev36@gmail.com</span>
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