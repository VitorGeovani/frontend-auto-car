import React, { useState, useEffect } from 'react';
import './Cars.scss';
import { FaGasPump, FaCalendarAlt, FaTachometerAlt, FaSearch, FaWhatsapp } from 'react-icons/fa';
import { listarCarrosEstoque } from '../../services/carroService';
import { Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const Cars = () => {
  const [carrosEstoque, setCarrosEstoque] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCarros = async () => {
      try {
        setLoading(true);
        const data = await listarCarrosEstoque();
        setCarrosEstoque(data);
        setError(null);
      } catch (err) {
        console.error('Erro ao carregar carros do estoque:', err);
        setError('Não foi possível carregar os carros do estoque.');
      } finally {
        setLoading(false);
      }
    };

    fetchCarros();
  }, []);

  // Formatar preço como string em formato de moeda brasileira
  const formatarPreco = (preco) => {
    return `R$ ${parseFloat(preco).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };
  
  // Função para obter a URL completa da imagem
  const getImageUrl = (imagePath) => {
    if (!imagePath) return 'https://via.placeholder.com/300x200?text=Sem+Imagem';
    
    // Se já for uma URL completa (começa com http), use diretamente
    if (imagePath.startsWith('http')) return imagePath;
    
    // Se for um caminho relativo, adicione a URL base da API
    return `${api.defaults.baseURL}${imagePath}`;
  };

  // Limitar a exibição a no máximo 6 carros do estoque
  const carrosParaExibir = carrosEstoque.slice(0, 6);

  return (
    <section className="cars" id="cars">
      <div className="cars__container">
        <h4 className="tag">Estoque</h4>
        <h2>Carros disponíveis</h2>
        <p className="subtitle">Veja algumas das nossas ofertas com veículos prontos para você sair dirigindo hoje mesmo.</p>

        {loading ? (
          <div className="loading-container">
            <Spinner animation="border" role="status" />
            <p>Carregando carros...</p>
          </div>
        ) : error ? (
          <div className="error-message">
            <p>{error}</p>
          </div>
        ) : carrosParaExibir.length === 0 ? (
          <div className="empty-message">
            <p>Não há veículos disponíveis no estoque no momento.</p>
          </div>
        ) : (
          <div className="car__list">
            {carrosParaExibir.map((carro, index) => (
              <div className="car__card" key={index}>
                <div className="car__image-container">
                  <img 
                    src={
                      carro.imagens && carro.imagens.length > 0 
                        ? getImageUrl(carro.imagens[0]) 
                        : 'https://via.placeholder.com/300x200?text=Sem+Imagem'
                    } 
                    alt={carro.nome || `${carro.marca} ${carro.modelo}`} 
                    className="car__image"
                  />
                </div>
                <div className="car__info">
                  <h3>{carro.nome || `${carro.marca} ${carro.modelo}`}</h3>
                  <p>
                    <FaCalendarAlt /> {carro.ano} &nbsp; 
                    <FaTachometerAlt /> {(carro.quilometragem || 0).toLocaleString()} km &nbsp; 
                    <FaGasPump /> {carro.combustivel || 'Flex'}
                  </p>
                  <div className="car__price">
                    {carro.preco && typeof carro.preco === 'string' && carro.preco.startsWith('R$') 
                      ? carro.preco 
                      : formatarPreco(carro.preco)}
                  </div>
                  <div className="car__buttons">
                    <Link to={`/veiculo/${carro.id}`} className="btn-details">
                      <FaSearch /> Ver mais detalhes
                    </Link>
                    <Link to={`/interesse/${carro.id}`} className="btn-interest">
                      <FaWhatsapp /> Estou interessado
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="car__cta">
          <a href="/estoque" className="btn btn-primary">
            Ver todo o estoque
          </a>
        </div>
      </div>
    </section>
  );
};

export default Cars;