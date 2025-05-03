import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './Dashboard.scss';
import api from '../../services/api';
import { 
  FaCarSide, 
  FaUsers, 
  FaCommentDots, 
  FaPlus, 
  FaPencilAlt, 
  FaWarehouse,
  FaBell
} from 'react-icons/fa';

const Dashboard = () => {
  const [stats, setStats] = useState({ 
    clientes: 0, 
    agendamentos: 0, 
    vendas: 0,
    veiculos: 0,
    depoimentos: 0,
    interesses: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const res = await api.get('/admin/dashboard');
        setStats(res.data);
        setError(null);
      } catch (err) {
        console.error("Erro ao carregar dados do dashboard:", err);
        setError("Não foi possível carregar os dados do dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <div className="loading">Carregando dados do dashboard...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="admin-dashboard">
      <h1>Painel Administrativo</h1>
      
      <div className="stats-grid">
        <div className="stat-card">
          <FaCarSide className="icon" />
          <h3>Veículos em Estoque</h3>
          <p className="stat-number">{stats.veiculos}</p>
          <Link to="/admin/estoque">Ver detalhes</Link>
        </div>

        <div className="stat-card">
          <FaUsers className="icon" />
          <h3>Clientes Cadastrados</h3>
          <p className="stat-number">{stats.clientes}</p>
          <Link to="/admin/usuarios">Ver todos</Link>
        </div>

        <div className="stat-card">
          <FaCommentDots className="icon" />
          <h3>Depoimentos</h3>
          <p className="stat-number">{stats.depoimentos}</p>
          <Link to="/admin/depoimentos">Gerenciar</Link>
        </div>
        
        <div className="stat-card">
          <FaBell className="icon" />
          <h3>Interesses</h3>
          <p className="stat-number">{stats.interesses || 0}</p>
          <Link to="/admin/interesses">Ver detalhes</Link>
        </div>
      </div>

      <div className="actions-section">
        <h2>Ações Rápidas</h2>
        <div className="action-buttons">
          <Link to="/admin/veiculos/novo" className="action-button">
            <FaPlus /> Cadastrar Veículo
          </Link>
          <Link to="/admin/veiculos" className="action-button">
            <FaPencilAlt /> Alterar Dados de Veículo
          </Link>
          <Link to="/admin/estoque" className="action-button">
            <FaWarehouse /> Consultar Estoque
          </Link>
          <Link to="/admin/interesses" className="action-button">
            <FaBell /> Gerenciar Interesses
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;