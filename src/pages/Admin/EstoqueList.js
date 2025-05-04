import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api, { clearCache } from '../../services/api';
import './EstoqueList.scss';
import { FaEdit, FaTrash, FaPlus, FaSync, FaExclamationTriangle } from 'react-icons/fa';
import { toast } from 'react-toastify';

const EstoqueList = () => {
  const [estoque, setEstoque] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [atualizandoEstoque, setAtualizandoEstoque] = useState(false);

  // Função otimizada para buscar dados do estoque
  const fetchEstoque = async (forceRefresh = false) => {
    try {
      setAtualizandoEstoque(true);
      
      if (forceRefresh) {
        console.log('Forçando atualização completa do estoque...');
        clearCache();
        
        // Forçar revalidação do estoque no backend
        try {
          await api.get('/estoque/revalidar', {
            headers: { 'Cache-Control': 'no-cache' },
            params: { _force: new Date().getTime() }
          });
          console.log('Estoque revalidado no servidor');
        } catch (revalidateErr) {
          console.warn('Não foi possível revalidar estoque:', revalidateErr);
        }
      }
      
      // Buscar com anti-cache agressivo
      const timestamp = new Date().getTime();
      const response = await api.get(`/estoque?_t=${timestamp}`, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      if (!Array.isArray(response.data)) {
        console.error('Resposta não é um array:', response.data);
        setError('Formato de dados inválido recebido do servidor');
        return;
      }
      
      console.log(`${response.data.length} itens de estoque recebidos`);
      
      // Processar dados para garantir que temos os nomes dos modelos
      const processedData = response.data.map(item => {
        // Se o modelo do carro não estiver disponível diretamente, buscar de outros campos
        if (!item.modelo) {
          item.modelo = item.modelo_carro || item.marca_modelo || 
                       `${item.marca || ''} ${item.nome || ''}`.trim() || 
                       `Veículo ID: ${item.carro_id}`;
        }
        return item;
      });
      
      setEstoque(processedData);
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
    fetchEstoque(true); // Forçar atualização completa na primeira carga
  }, []);

  // Recarregar quando a página receber foco
  useEffect(() => {
    const handleFocus = () => {
      console.log("Página de estoque recebeu foco - atualizando dados");
      fetchEstoque(true);
    };

    window.addEventListener('focus', handleFocus);
    
    // Atualização automática a cada 45 segundos
    const intervalId = setInterval(() => {
      if (document.visibilityState === 'visible' && !atualizandoEstoque) {
        console.log("Recarregando estoque automaticamente");
        fetchEstoque(false); // Atualização leve quando automática
      }
    }, 45000);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      clearInterval(intervalId);
    };
  }, [atualizandoEstoque]);

  // Acompanhar visibilidade do documento
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchEstoque();
      }
    };
    
    document.addEventListener("visibilitychange", handleVisibilityChange);
    
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  // Função para atualizar quantidade no estoque
  const atualizarQuantidade = async (itemId, novaQuantidade) => {
    try {
      setAtualizandoEstoque(true);
      clearCache();
      
      // Atualizar no servidor
      await api.put(`/estoque/${itemId}`, { 
        quantidade: novaQuantidade 
      }, {
        headers: { 'Cache-Control': 'no-cache' }
      });
      
      // Atualizar o estado local
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
      
      // Tentar novamente buscando dados atualizados
      fetchEstoque(true);
    } finally {
      setAtualizandoEstoque(false);
    }
  };

  // Função melhorada para excluir veículos
  const excluirItem = async (id, carroId) => {
    if (!window.confirm('Tem certeza que deseja remover este veículo do estoque?')) {
      return;
    }
    
    try {
      setLoading(true);
      
      // Limpar cache antes da operação
      clearCache();
      
      // 1. Primeiro excluir o item do estoque
      await api.delete(`/estoque/${id}`);
      toast.info('Veículo removido do estoque.');
      
      // 2. Perguntar se também deseja excluir o veículo completamente
      const confirmaExclusaoCompleta = window.confirm(
        'Deseja excluir o veículo permanentemente do sistema?\n\n' +
        'Isso removerá todas as imagens e registros associados a este veículo.'
      );
      
      if (confirmaExclusaoCompleta) {
        try {
          console.log(`Tentando excluir veículo ID: ${carroId} permanentemente...`);
          
          // a. PRIMEIRO: Excluir todos os interesses relacionados ao veículo
          try {
            console.log(`Excluindo interesses do veículo ${carroId}`);
            const interessesResponse = await api.get(`/interesses/carro/${carroId}`);
            
            if (interessesResponse?.data?.length > 0) {
              console.log(`Encontrados ${interessesResponse.data.length} interesses para excluir`);
              
              // Excluir cada interesse individualmente para garantir
              for (const interesse of interessesResponse.data) {
                console.log(`Excluindo interesse ID: ${interesse.id}`);
                await api.delete(`/interesses/${interesse.id}`);
              }
            }
          } catch (interestError) {
            console.error("Erro ao processar interesses:", interestError);
            throw new Error(`Não foi possível excluir os interesses associados a este veículo.`);
          }
          
          // b. Excluir imagens do veículo
          try {
            console.log(`Excluindo imagens do veículo ${carroId}`);
            await api.delete(`/imagens/carro/${carroId}`);
          } catch (imgError) {
            console.warn("Aviso ao excluir imagens:", imgError);
            // Continuar mesmo se houver erro nas imagens
          }
          
          // c. Finalmente excluir o veículo
          console.log(`Excluindo o veículo ${carroId} do banco de dados`);
          await api.delete(`/carros/${carroId}`);
          toast.success('Veículo excluído permanentemente do sistema!');
        } catch (error) {
          console.error('Erro ao excluir veículo:', error);
          
          if (error.response) {
            toast.error(`Erro do servidor: ${error.response.data.message || error.response.statusText}`);
          } else {
            toast.error(error.message || 'Erro ao excluir veículo do sistema.');
          }
        }
      } else {
        toast.info('Veículo removido apenas do estoque, mas mantido no sistema.');
      }
      
      // Limpar cache após as modificações
      clearCache();
      
      // Atualizar a lista de estoque localmente
      setEstoque(estoque.filter(item => item.id !== id));
      
      // Recarregar dados do estoque para garantir consistência
      setTimeout(() => fetchEstoque(true), 500);
    } catch (err) {
      console.error('Erro ao excluir item do estoque:', err);
      toast.error('Erro ao processar a exclusão. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchEstoque(true); // Forçar atualização ao clicar no botão de refresh
    toast.info("Atualizando lista de estoque...");
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Carregando...</span>
        </div>
        <p>Carregando estoque...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="error-message">
        <FaExclamationTriangle className="error-icon" />
        <p>{error}</p>
        <button className="refresh-button" onClick={handleRefresh}>
          <FaSync /> Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="estoque-list">
      <div className="header-actions">
        <h1>Gerenciamento de Estoque</h1>
        <div className="action-buttons">
          <button 
            onClick={handleRefresh} 
            className="refresh-btn" 
            disabled={atualizandoEstoque}
          >
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
          <div className="no-data">
            Nenhum veículo encontrado no estoque.
            <Link to="/admin/veiculos/novo" className="mt-3 btn btn-primary">
              <FaPlus /> Adicionar primeiro veículo
            </Link>
          </div>
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
                <tr key={item.id} className={item.quantidade <= 0 ? "zero-stock" : ""}>
                  <td>{item.id}</td>
                  <td>
                    {item.modelo || item.modelo_carro || 
                     `${item.marca || ''} ${item.nome || ''}`.trim() || 
                     `ID: ${item.carro_id}`}
                  </td>
                  <td>
                    <div className="quantity-control">
                      <button 
                        onClick={() => atualizarQuantidade(item.id, Math.max(0, item.quantidade - 1))}
                        disabled={item.quantidade <= 0 || atualizandoEstoque}
                        title="Diminuir quantidade"
                      >
                        -
                      </button>
                      <span className={item.quantidade <= 0 ? "zero-quantity" : ""}>
                        {item.quantidade}
                      </span>
                      <button 
                        onClick={() => atualizarQuantidade(item.id, item.quantidade + 1)}
                        disabled={atualizandoEstoque}
                        title="Aumentar quantidade"
                      >
                        +
                      </button>
                    </div>
                  </td>
                  <td>{item.localizacao || 'Matriz'}</td>
                  <td className="actions">
                    <Link 
                      to={`/admin/veiculos/editar/${item.carro_id}`} 
                      className="edit-btn"
                      title="Editar veículo"
                    >
                      <FaEdit /> Editar
                    </Link>
                    <button 
                      onClick={() => excluirItem(item.id, item.carro_id)} 
                      className="delete-btn"
                      disabled={loading}
                      title="Remover veículo"
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