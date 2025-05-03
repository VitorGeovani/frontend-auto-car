// frontend/src/pages/Admin/TestimonialList.js
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import './TestimonialList.scss';
import { FaCheck, FaTimes, FaTrash } from 'react-icons/fa';

const TestimonialList = () => {
  const [depoimentos, setDepoimentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDepoimento, setSelectedDepoimento] = useState(null);

  useEffect(() => {
    fetchDepoimentos();
  }, []);

  const fetchDepoimentos = async () => {
    try {
      setLoading(true);
      const response = await api.get('/depoimentos');
      setDepoimentos(response.data);
      setError(null);
    } catch (err) {
      console.error('Erro ao buscar depoimentos:', err);
      setError('Não foi possível carregar os depoimentos.');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, aprovado) => {
    try {
      await api.put(`/depoimentos/${id}`, { aprovado });
      setDepoimentos(depoimentos.map(depoimento => 
        depoimento.id === id ? { ...depoimento, aprovado } : depoimento
      ));
    } catch (err) {
      console.error('Erro ao atualizar status do depoimento:', err);
      alert('Erro ao atualizar status do depoimento. Tente novamente.');
    }
  };

  const prepareDelete = (depoimento) => {
    setSelectedDepoimento(depoimento);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedDepoimento) return;
    
    try {
      await api.delete(`/depoimentos/${selectedDepoimento.id}`);
      setDepoimentos(depoimentos.filter(d => d.id !== selectedDepoimento.id));
      setShowDeleteModal(false);
      setSelectedDepoimento(null);
    } catch (err) {
      console.error('Erro ao excluir depoimento:', err);
      alert('Erro ao excluir depoimento. Tente novamente.');
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setSelectedDepoimento(null);
  };

  if (loading) return <div className="loading">Carregando depoimentos...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="testimonial-list">
      <h1>Gerenciamento de Depoimentos</h1>
      
      <div className="filters">
        <button className="filter-all active">Todos</button>
        <button className="filter-pending">Pendentes</button>
        <button className="filter-approved">Aprovados</button>
      </div>

      <div className="testimonial-grid">
        {depoimentos.length > 0 ? (
          depoimentos.map((depoimento) => (
            <div 
              key={depoimento.id} 
              className={`testimonial-card ${depoimento.aprovado ? 'approved' : 'pending'}`}
            >
              <div className="testimonial-header">
                <div className="user-info">
                  <h3>{depoimento.nome_cliente}</h3>
                  <span className="date">
                    {new Date(depoimento.data).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <div className="status-badge">
                  {depoimento.aprovado ? 'Aprovado' : 'Pendente'}
                </div>
              </div>
              
              <div className="testimonial-content">
                <p>{depoimento.texto}</p>
              </div>
              
              <div className="rating">
                {'★'.repeat(depoimento.avaliacao)}
                {'☆'.repeat(5 - depoimento.avaliacao)}
              </div>
              
              <div className="testimonial-actions">
                {!depoimento.aprovado && (
                  <button 
                    className="approve-btn"
                    onClick={() => updateStatus(depoimento.id, true)}
                  >
                    <FaCheck /> Aprovar
                  </button>
                )}
                {depoimento.aprovado && (
                  <button 
                    className="reject-btn"
                    onClick={() => updateStatus(depoimento.id, false)}
                  >
                    <FaTimes /> Reprovar
                  </button>
                )}
                <button 
                  className="delete-btn"
                  onClick={() => prepareDelete(depoimento)}
                >
                  <FaTrash /> Excluir
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-data">
            Nenhum depoimento cadastrado.
          </div>
        )}
      </div>

      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="delete-modal">
            <h3>Confirmar Exclusão</h3>
            <p>Tem certeza que deseja excluir o depoimento de <strong>{selectedDepoimento?.nome_cliente}</strong>?</p>
            <p className="warning">Esta ação não pode ser desfeita.</p>
            <div className="modal-actions">
              <button onClick={cancelDelete} className="cancel-btn">Cancelar</button>
              <button onClick={confirmDelete} className="confirm-btn">Confirmar Exclusão</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestimonialList;