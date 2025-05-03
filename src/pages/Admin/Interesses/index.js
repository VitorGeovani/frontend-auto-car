import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaEye, FaCheck, FaTrash, FaBell } from 'react-icons/fa';
// Correção do caminho de importação
import { listarInteresses, marcarComoLido, excluirInteresse } from '../../../services/interesseService';
import './Interesses.scss';

const AdminInteresses = () => {
  const [interesses, setInteresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchInteresses();
  }, []);

  const fetchInteresses = async () => {
    try {
      setLoading(true);
      const data = await listarInteresses();
      setInteresses(data);
    } catch (error) {
      console.error('Erro ao carregar interesses:', error);
      setError('Não foi possível carregar os interesses.');
    } finally {
      setLoading(false);
    }
  };

  const handleMarcarComoLido = async (id) => {
    try {
      await marcarComoLido(id);
      setInteresses(interesses.map(interesse => 
        interesse.id === id ? { ...interesse, lido: true } : interesse
      ));
    } catch (error) {
      console.error('Erro ao marcar interesse como lido:', error);
      alert('Não foi possível marcar o interesse como lido.');
    }
  };

  const handleExcluir = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este interesse?')) {
      try {
        await excluirInteresse(id);
        setInteresses(interesses.filter(interesse => interesse.id !== id));
      } catch (error) {
        console.error('Erro ao excluir interesse:', error);
        alert('Não foi possível excluir o interesse.');
      }
    }
  };

  if (loading) return <div className="loading">Carregando interesses...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="admin-interesses">
      <div className="page-header">
        <h1><FaBell className="icon" /> Gerenciamento de Interesses</h1>
        <button onClick={fetchInteresses} className="refresh-button">Atualizar</button>
      </div>

      {interesses.length === 0 ? (
        <div className="empty-state">
          <p>Nenhum interesse registrado no momento.</p>
        </div>
      ) : (
        <>
          <div className="table-container">
            <table className="interesses-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Data</th>
                  <th>Nome</th>
                  <th>Veículo</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {interesses.map(interesse => (
                  <tr key={interesse.id} className={interesse.lido ? '' : 'unread'}>
                    <td>{interesse.id}</td>
                    <td>
                      {new Date(interesse.data_registro).toLocaleDateString('pt-BR')}
                      <div className="time">
                        {new Date(interesse.data_registro).toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </td>
                    <td>
                      <div className="cliente-info">
                        <div className="nome">{interesse.nome}</div>
                        <div className="email">{interesse.email}</div>
                      </div>
                    </td>
                    <td>
                      <div className="veiculo-info">
                        <div className="modelo">{interesse.marca} {interesse.modelo}</div>
                        <div className="ano">{interesse.ano}</div>
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${interesse.lido ? 'lido' : 'nao-lido'}`}>
                        {interesse.lido ? 'Lido' : 'Não lido'}
                      </span>
                    </td>
                    <td>
                      <div className="actions">
                        <Link to={`/admin/interesses/${interesse.id}`} className="view-button">
                          <FaEye />
                        </Link>
                        {!interesse.lido && (
                          <button 
                            className="read-button" 
                            onClick={() => handleMarcarComoLido(interesse.id)}
                            title="Marcar como lido"
                          >
                            <FaCheck />
                          </button>
                        )}
                        <button 
                          className="delete-button" 
                          onClick={() => handleExcluir(interesse.id)}
                          title="Excluir interesse"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminInteresses;