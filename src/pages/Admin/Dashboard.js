import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Dashboard.scss";
import api from "../../services/api";
import {
  FaCarSide,
  FaUsers,
  FaCommentDots,
  FaPlus,
  FaPencilAlt,
  FaWarehouse,
  FaBell,
  FaSync,
  FaExclamationTriangle,
} from "react-icons/fa";

const Dashboard = () => {
  const [stats, setStats] = useState({
    clientes: 0,
    estoque: 0,
    interesses: 0,
    depoimentos: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      console.log("Solicitando dados do dashboard...");
      const res = await api.get("/admin/dashboard");
      console.log("Dados recebidos:", res.data);
      setStats({
        clientes: res.data.clientes || 0,
        estoque: res.data.estoque || 0,
        interesses: res.data.interesses || 0,
        depoimentos: res.data.depoimentos || 0,
      });
      setError(null);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Erro ao carregar dados do dashboard:", err);
      setError(
        `Não foi possível carregar os dados: ${
          err.message || "Erro desconhecido"
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRefresh = () => {
    fetchDashboardData();
  };

  const formatDateTime = (date) => {
    if (!date) return "";
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Painel Administrativo</h1>
        {lastUpdated && (
          <div className="last-update">
            Última atualização: {formatDateTime(lastUpdated)}
            <button
              className="refresh-btn"
              onClick={handleRefresh}
              disabled={loading}
            >
              <FaSync className={loading ? "rotating" : ""} /> Atualizar
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="error-message">
          <FaExclamationTriangle /> {error}
          <button className="retry-btn" onClick={handleRefresh}>
            Tentar novamente
          </button>
        </div>
      )}

      <div className="stats-grid">
        <div className="stat-card">
          <FaCarSide className="icon" />
          <h3>Veículos em Estoque</h3>
          {loading ? (
            <div className="stat-loading">Carregando...</div>
          ) : (
            <p className="stat-number">{stats.estoque}</p>
          )}
          <Link to="/admin/estoque">Ver detalhes</Link>
        </div>

        <div className="stat-card">
          <FaUsers className="icon" />
          <h3>Clientes Cadastrados</h3>
          {loading ? (
            <div className="stat-loading">Carregando...</div>
          ) : (
            <p className="stat-number">{stats.clientes}</p>
          )}
          <Link to="/admin/usuarios">Ver todos</Link>
        </div>

        <div className="stat-card">
          <FaBell className="icon" />
          <h3>Interesses</h3>
          {loading ? (
            <div className="stat-loading">Carregando...</div>
          ) : (
            <p className="stat-number">{stats.interesses}</p>
          )}
          <Link to="/admin/interesses">Ver detalhes</Link>
        </div>

        <div className="stat-card">
          <FaCommentDots className="icon" />
          <h3>Depoimentos</h3>
          {loading ? (
            <div className="stat-loading">Carregando...</div>
          ) : (
            <p className="stat-number">{stats.depoimentos}</p>
          )}
          <Link to="/admin/depoimentos">Gerenciar</Link>
        </div>
      </div>

      <div className="actions-section">
        <h2>Ações Rápidas</h2>
        <div className="action-buttons">
          <Link to="/admin/veiculos/novo" className="action-button">
            <FaPlus /> Cadastrar Veículo
          </Link>
          <Link to="/admin/estoque" className="action-button">
            <FaWarehouse /> Consultar Estoque
          </Link>
          <Link to="/admin/interesses" className="action-button">
            <FaBell /> Gerenciar Interesses
          </Link>
          <Link to="/admin/depoimentos" className="action-button">
            <FaCommentDots /> Gerenciar Depoimentos
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
