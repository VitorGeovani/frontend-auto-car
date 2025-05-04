import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api, { clearCache } from '../../services/api';
import './EstoqueList.scss';
import { FaEdit, FaTrash, FaPlus, FaSync } from 'react-icons/fa';
import { toast } from 'react-toastify';

const EstoqueList = () => {
  const [estoque, setEstoque] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [atualizandoEstoque, setAtualizandoEstoque] = useState(false);

  // Função para buscar dados do estoque com anti-cache
  const fetchEstoque = async (forceRefresh = false) => {
    try {
      setAtualizandoEstoque(true);
      
      if (forceRefresh) {
        // Limpar qualquer cache potencial ao forçar atualização
        clearCache();
      }
      
      const response = await api.get('/estoque', {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        params: { _nocache: new Date().getTime() }
      });
      
      console.log('Dados do estoque recebidos:', response.data);
      setEstoque(response.data);
      setError(null);
    } catch (err) {
      console.error('Erro ao buscar estoque:', err);
      setError('Não foi possível carregar os dados do estoque.');
    } finally {
      setLoading(false);
      setAtualizandoEstoque(false);
    }
  };

  // Efeito inicial para carregar dados
  useEffect(() => {
    fetchEstoque(true); // Forçar atualização na primeira carga
  }, []);

  // Efeito para recarregar dados quando o componente recebe foco
  useEffect(() => {
    // Função para recarregar dados quando o usuário volta para a página
    const handleFocus = () => {
      console.log("Estoque recebeu foco - atualizando dados");
      fetchEstoque(true); // Forçar atualização ao receber foco
    };

    // Registrar event listeners
    window.addEventListener('focus', handleFocus);
    
    // Configurar intervalo de atualização automática (a cada 30 segundos)
    const intervalId = setInterval(() => {
      if (document.visibilityState === 'visible' && !atualizandoEstoque) {
        console.log("Recarregando estoque automaticamente");
        fetchEstoque();
      }
    }, 30000);
    
    // Limpar event listeners e intervalos ao desmontar componente
    return () => {
      window.removeEventListener('focus', handleFocus);
      clearInterval(intervalId);
    };
  }, [atualizandoEstoque]);

  // Manejar visibilidade do documento para atualização automática
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchEstoque();
      }
    };
    
    document.addEventListener("visibilitychange", handleVisibilityChange);
    
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const atualizarQuantidade = async (itemId, novaQuantidade) => {
    try {
      setAtualizandoEstoque(true);
      
      // Limpar cache antes da operação
      clearCache();
      
      await api.put(`/estoque/${itemId}`, { 
        quantidade: novaQuantidade 
      }, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      // Atualizar o estado local após a operação no servidor
      setEstoque(estoque.map(item => 
        item.id === itemId 
          ? { ...item, quantidade: novaQuantidade } 
          : item
      ));
      
      toast.success('Quantidade atualizada com sucesso!');
      
      // Recarregar dados para garantir consistência
      setTimeout(() => fetchEstoque(), 500);
    } catch (err) {
      console.error('Erro ao atualizar estoque:', err);
      toast.error('Erro ao atualizar quantidade no estoque.');
    } finally {
      setAtualizandoEstoque(false);
    }
  };

  const excluirItem = async (id, carroId) => {
    if (!window.confirm('Tem certeza que deseja remover este item do estoque?')) {
      return;
    }
    
    try {
      setLoading(true);
      
      // Primeiro excluir o item do estoque
      await api.delete(`/estoque/${id}`);
      
      // Perguntar se também deseja excluir o veículo completamente
      if (window.confirm('Deseja excluir o veículo permanentemente do sistema?')) {
        try {
          // Primeiro excluir os interesses relacionados ao veículo
          await api.delete(`/interesses/carro/${carroId}`).catch(err => {
            console.warn("Aviso ao tentar excluir interesses:", err);
          });
          
          // Excluir as imagens associadas ao veículo
          await api.delete(`/imagens/carro/${carroId}`).catch(err => {
            console.warn("Aviso ao tentar excluir imagens:", err);
          });
          
          // Agora é seguro excluir o veículo
          await api.delete(`/carros/${carroId}`);
          toast.success('Veículo excluído permanentemente do sistema!');
        } catch (error) {
          console.error('Erro ao excluir veículo:', error);
          toast.error(`Erro ao excluir veículo: ${error.response?.data?.mensagem || 'Erro desconhecido'}`);
        }
      } else {
        toast.info('Veículo removido do estoque mas mantido no sistema.');
      }
      
      // Limpar cache após as modificações
      clearCache();
      
      // Atualizar a lista de estoque
      setEstoque(estoque.filter(item => item.id !== id));
      
      // Recarregar dados do estoque para garantir consistência
      setTimeout(() => fetchEstoque(true), 500);
    } catch (err) {
      console.error('Erro ao excluir item do estoque:', err);
      toast.error('Erro ao remover veículo do estoque.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchEstoque(true); // Forçar atualização ao clicar no botão de refresh
    toast.info("Atualizando lista de estoque...");
  };

  if (loading) return <div className="loading">Carregando estoque...</div>;
  if (error) return (
    <div className="error-message">
      {error}
      <button className="refresh-button" onClick={handleRefresh}>
        <FaSync /> Tentar novamente
      </button>
    </div>
  );

  return (
    <div className="estoque-list">
      <div className="header-actions">
        <h1>Gerenciamento de Estoque</h1>
        <div className="action-buttons">
          <button onClick={handleRefresh} className="refresh-btn" disabled={atualizandoEstoque}>
            <FaSync className={atualizandoEstoque ? "rotating" : ""} /> 
            {atualizandoEstoque ? "Atualizando..." : "Atualizar Lista"}
          </button>
          <Link to="/admin/veiculos/novo" className="add-button">
            <FaPlus /> Adicionar Veículo
          </Link>
        </div>
      </div>

      <div className="table-container">
        {estoque.length === 0 ? (
          <div className="no-data">Nenhum veículo no estoque.</div>
        ) : (
          <table className="estoque-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Modelo</th>
                <th>Quantidade</th>
                <th>Localização</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {estoque.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.modelo_carro}</td>
                  <td>
                    <div className="quantity-control">
                      <button 
                        onClick={() => atualizarQuantidade(item.id, Math.max(0, item.quantidade - 1))}
                        disabled={item.quantidade <= 0 || atualizandoEstoque}
                      >
                        -
                      </button>
                      <span>{item.quantidade}</span>
                      <button 
                        onClick={() => atualizarQuantidade(item.id, item.quantidade + 1)}
                        disabled={atualizandoEstoque}
                      >
                        +
                      </button>
                    </div>
                  </td>
                  <td>{item.localizacao || 'N/A'}</td>
                  <td className="actions">
                    <Link to={`/admin/veiculos/editar/${item.carro_id}`} className="edit-btn">
                      <FaEdit /> Editar
                    </Link>
                    <button 
                      onClick={() => excluirItem(item.id, item.carro_id)} 
                      className="delete-btn"
                      disabled={loading}
                    >
                      <FaTrash /> {loading ? 'Excluindo...' : 'Excluir'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default EstoqueList;