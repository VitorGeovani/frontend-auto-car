import React, { useState, useEffect } from 'react';
import './Testimonials.scss';
import { FaQuoteLeft, FaSpinner } from 'react-icons/fa';
import api from '../../services/api';

const Testimonials = () => {
  const [depoimentos, setDepoimentos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Função para buscar depoimentos aprovados
    const fetchDepoimentos = async () => {
      try {
        setLoading(true);
        const response = await api.get('/depoimentos', {
          headers: { 'Cache-Control': 'no-cache' },
          params: { _t: new Date().getTime() }
        });
        
        // Filtrar apenas os aprovados (redundante, já que a API já deveria filtrar,
        // mas é uma camada extra de segurança)
        const depoimentosAprovados = response.data.filter(d => d.aprovado);
        
        setDepoimentos(depoimentosAprovados);
      } catch (error) {
        console.error('Erro ao buscar depoimentos:', error);
        setDepoimentos([]); // Em caso de erro, mostra lista vazia
      } finally {
        setLoading(false);
      }
    };

    fetchDepoimentos();
  }, []);

  // Se não houver depoimentos aprovados, não exibir a seção
  if (!loading && depoimentos.length === 0) {
    return null;
  }

  return (
    <section className="testimonials" id="testimonials">
      <div className="testimonials-container">
        <h2>Depoimentos de Clientes</h2>
        <p>Veja o que nossos clientes dizem sobre sua experiência conosco</p>
        
        {loading ? (
          <div className="loading-container">
            <FaSpinner className="spinner" />
            <p>Carregando depoimentos...</p>
          </div>
        ) : (
          <div className="testimonials-grid">
            {depoimentos.map((item) => (
              <div className="testimonial-card" key={item.id}>
                <FaQuoteLeft className="quote-icon" />
                <p className="depoimento">"{item.texto}"</p>
                <h4>{item.nome_cliente}</h4>
                <span>{item.cidade}</span>
                {item.avaliacao && (
                  <div className="avaliacao">
                    {"★".repeat(item.avaliacao)}
                    {"☆".repeat(5 - item.avaliacao)}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Testimonials;