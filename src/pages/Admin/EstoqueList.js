import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import './EstoqueList.scss';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import { toast } from 'react-toastify';

const EstoqueList = () => {
  const [estoque, setEstoque] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEstoque();
  }, []);

  const fetchEstoque = async () => {
    try {
      setLoading(true);
      const response = await api.get('/estoque');
      console.log('Dados do estoque:', response.data);
      setEstoque(response.data);
      setError(null);
    } catch (err) {
      console.error('Erro ao buscar estoque:', err);
      setError('Não foi possível carregar os dados do estoque.');
    } finally {
      setLoading(false);
    }
  };

  const atualizarQuantidade = async (itemId, novaQuantidade) => {
    try {
      await api.put(`/estoque/${itemId}`, { 
        quantidade: novaQuantidade 
      });
      
      setEstoque(estoque.map(item => 
        item.id === itemId 
          ? { ...item, quantidade: novaQuantidade } 
          : item
      ));
      
      toast.success('Quantidade atualizada com sucesso!');
    } catch (err) {
      console.error('Erro ao atualizar estoque:', err);
      toast.error('Erro ao atualizar quantidade no estoque.');
    }
  };

  const excluirItem = async (id, carroId) => {
    if (!window.confirm('Tem certeza que deseja remover este item do estoque?')) {
      return;
    }
    
    try {
      // Primeiro excluir o item do estoque
      await api.delete(`/estoque/${id}`);
      
      // Perguntar se também deseja excluir o veículo completamente
      if (window.confirm('Deseja excluir o veículo permanentemente do sistema?')) {
        // Excluir as imagens associadas ao veículo
        try {
          await api.delete(`/imagens/carro/${carroId}`);
        } catch (error) {
          console.error('Erro ao excluir imagens do veículo:', error);
        }
        
        // Excluir o veículo
        await api.delete(`/carros/${carroId}`);
        toast.success('Veículo excluído permanentemente do sistema!');
      } else {
        toast.info('Veículo removido do estoque mas mantido no sistema.');
      }
      
      // Atualizar a lista de estoque
      setEstoque(estoque.filter(item => item.id !== id));
    } catch (err) {
      console.error('Erro ao excluir item do estoque:', err);
      toast.error('Erro ao remover veículo do estoque.');
    }
  };

  if (loading) return <div className="loading">Carregando estoque...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="estoque-list">
      <div className="header-actions">
        <h1>Gerenciamento de Estoque</h1>
        <Link to="/admin/veiculos/novo" className="add-button">
          <FaPlus /> Adicionar Veículo
        </Link>
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
                        disabled={item.quantidade <= 0}
                      >
                        -
                      </button>
                      <span>{item.quantidade}</span>
                      <button onClick={() => atualizarQuantidade(item.id, item.quantidade + 1)}>
                        +
                      </button>
                    </div>
                  </td>
                  <td>{item.localizacao || 'N/A'}</td>
                  <td className="actions">
                    <Link to={`/admin/veiculos/editar/${item.carro_id}`} className="edit-btn">
                      <FaEdit /> Editar
                    </Link>
                    <button onClick={() => excluirItem(item.id, item.carro_id)} className="delete-btn">
                      <FaTrash /> Excluir
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