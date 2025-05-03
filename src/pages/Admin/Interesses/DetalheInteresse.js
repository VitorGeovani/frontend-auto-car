import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaCheck, FaTrash, FaUser, FaCar, FaEnvelope, FaPhone, FaCalendarAlt } from 'react-icons/fa';
// Correção do caminho de importação
import { obterInteressePorId, marcarComoLido, excluirInteresse } from '../../../services/interesseService';
import './Interesses.scss';

const DetalheInteresse = () => {
  const { id } = useParams();
  const [interesse, setInteresse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInteresse = async () => {
      try {
        setLoading(true);
        const data = await obterInteressePorId(id);
        setInteresse(data);
        setError(null);
      } catch (error) {
        console.error('Erro ao carregar interesse:', error);
        setError('Não foi possível carregar os detalhes do interesse.');
      } finally {
        setLoading(false);
      }
    };

    fetchInteresse();
  }, [id]);

  const handleMarcarComoLido = async () => {
    try {
      await marcarComoLido(id);
      setInteresse({ ...interesse, lido: true });
    } catch (error) {
      console.error('Erro ao marcar interesse como lido:', error);
      alert('Não foi possível marcar o interesse como lido.');
    }
  };

  const handleExcluir = async () => {
    if (window.confirm('Tem certeza que deseja excluir este interesse?')) {
      try {
        await excluirInteresse(id);
        navigate('/admin/interesses');
      } catch (error) {
        console.error('Erro ao excluir interesse:', error);
        alert('Não foi possível excluir o interesse.');
      }
    }
  };

  if (loading) return <div className="loading">Carregando detalhes do interesse...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!interesse) return <div className="error-message">Interesse não encontrado.</div>;

  return (
    <div className="interesse-detalhe">
      <div className="page-header">
        <Link to="/admin/interesses" className="back-button">
          <FaArrowLeft /> Voltar
        </Link>
        <h1>Detalhes do Interesse #{interesse.id}</h1>
        <div className="actions">
          {!interesse.lido && (
            <button className="btn-read" onClick={handleMarcarComoLido}>
              <FaCheck /> Marcar como lido
            </button>
          )}
          <button className="btn-delete" onClick={handleExcluir}>
            <FaTrash /> Excluir
          </button>
        </div>
      </div>

      <div className="status-banner">
        <span className={`status-badge ${interesse.lido ? 'lido' : 'nao-lido'}`}>
          {interesse.lido ? 'Lido' : 'Não lido'}
        </span>
        <span className="date">
          <FaCalendarAlt /> Registrado em {new Date(interesse.data_registro).toLocaleDateString('pt-BR')} às {
            new Date(interesse.data_registro).toLocaleTimeString('pt-BR', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })
          }
        </span>
      </div>

      <div className="content-grid">
        <div className="card cliente-card">
          <div className="card-header">
            <FaUser /> Informações do Cliente
          </div>
          <div className="card-body">
            <h3>{interesse.nome}</h3>
            <p><FaEnvelope /> {interesse.email}</p>
            <p><FaPhone /> {interesse.telefone}</p>
          </div>
        </div>

        <div className="card veiculo-card">
          <div className="card-header">
            <FaCar /> Veículo de Interesse
          </div>
          <div className="card-body">
            <h3>{interesse.marca} {interesse.modelo}</h3>
            <p>Ano: {interesse.ano}</p>
            <p>Preço: R$ {parseFloat(interesse.preco).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            <Link to={`/admin/veiculos/${interesse.carro_id}`} className="view-vehicle-link">
              Ver detalhes do veículo
            </Link>
          </div>
        </div>
      </div>

      <div className="card mensagem-card">
        <div className="card-header">
          Mensagem do Cliente
        </div>
        <div className="card-body">
          <div className="mensagem">{interesse.mensagem || "Nenhuma mensagem adicional."}</div>
        </div>
      </div>
    </div>
  );
};

export default DetalheInteresse;