import React, { useState, useEffect } from "react";
import api from "../../services/api";
import "./TestimonialList.scss";
import { FaCheck, FaTimes, FaTrash, FaSync } from "react-icons/fa";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const TestimonialList = () => {
  const [depoimentos, setDepoimentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDepoimento, setSelectedDepoimento] = useState(null);
  const [filter, setFilter] = useState("todos"); // 'todos', 'pendentes', 'aprovados'
  const navigate = useNavigate();

  const fetchDepoimentos = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("adminToken");

      if (!token) {
        toast.error("Sessão expirada, faça login novamente");
        navigate("/admin/login");
        return;
      }

      const response = await api.get("/depoimentos/admin", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Cache-Control": "no-cache",
        },
        params: { _t: new Date().getTime() },
      });

      setDepoimentos(response.data);
      setError(null);
    } catch (err) {
      console.error("Erro ao buscar depoimentos:", err);

      if (err.response && err.response.status === 401) {
        toast.error("Sessão expirada, faça login novamente");
        navigate("/admin/login");
        return;
      }

      setError("Não foi possível carregar os depoimentos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepoimentos();
  }, []);

  const updateStatus = async (id, aprovado) => {
    try {
      const token = localStorage.getItem("adminToken");

      if (!token) {
        toast.error("Sessão expirada, faça login novamente");
        navigate("/admin/login");
        return;
      }

      await api.put(
        `/depoimentos/${id}`,
        { aprovado },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Atualizar o estado local sem precisar refazer a requisição
      setDepoimentos(
        depoimentos.map((depoimento) =>
          depoimento.id === id ? { ...depoimento, aprovado } : depoimento
        )
      );

      toast.success(
        aprovado
          ? "Depoimento aprovado com sucesso!"
          : "Depoimento reprovado com sucesso!"
      );
    } catch (err) {
      console.error("Erro ao atualizar status do depoimento:", err);

      if (err.response && err.response.status === 401) {
        toast.error("Sessão expirada, faça login novamente");
        navigate("/admin/login");
        return;
      }

      toast.error("Erro ao atualizar status do depoimento. Tente novamente.");
    }
  };

  const prepareDelete = (depoimento) => {
    setSelectedDepoimento(depoimento);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedDepoimento) return;

    try {
      const token = localStorage.getItem("adminToken");

      if (!token) {
        toast.error("Sessão expirada, faça login novamente");
        navigate("/admin/login");
        return;
      }

      await api.delete(`/depoimentos/${selectedDepoimento.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Atualizar o estado local sem precisar refazer a requisição
      setDepoimentos(depoimentos.filter((d) => d.id !== selectedDepoimento.id));
      setShowDeleteModal(false);
      setSelectedDepoimento(null);
      toast.success("Depoimento excluído com sucesso!");
    } catch (err) {
      console.error("Erro ao excluir depoimento:", err);

      if (err.response && err.response.status === 401) {
        toast.error("Sessão expirada, faça login novamente");
        navigate("/admin/login");
        return;
      }

      toast.error("Erro ao excluir depoimento. Tente novamente.");
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setSelectedDepoimento(null);
  };

  const handleFilter = (filterType) => {
    setFilter(filterType);
  };

  const filteredDepoimentos =
    filter === "todos"
      ? depoimentos
      : filter === "pendentes"
      ? depoimentos.filter((d) => !d.aprovado)
      : depoimentos.filter((d) => d.aprovado);

  if (loading) return <div className="loading">Carregando depoimentos...</div>;
  if (error)
    return (
      <div className="error-message">
        {error}
        <button className="refresh-button" onClick={fetchDepoimentos}>
          <FaSync /> Tentar novamente
        </button>
      </div>
    );

  return (
    <div className="testimonial-list">
      <div className="page-header">
        <h1>Gerenciamento de Depoimentos</h1>
        <button onClick={fetchDepoimentos} className="refresh-btn">
          <FaSync /> Atualizar
        </button>
      </div>

      <div className="filters">
        <button
          className={`filter-btn ${filter === "todos" ? "active" : ""}`}
          onClick={() => handleFilter("todos")}
        >
          Todos ({depoimentos.length})
        </button>
        <button
          className={`filter-btn ${filter === "pendentes" ? "active" : ""}`}
          onClick={() => handleFilter("pendentes")}
        >
          Pendentes ({depoimentos.filter((d) => !d.aprovado).length})
        </button>
        <button
          className={`filter-btn ${filter === "aprovados" ? "active" : ""}`}
          onClick={() => handleFilter("aprovados")}
        >
          Aprovados ({depoimentos.filter((d) => d.aprovado).length})
        </button>
      </div>

      <div className="testimonial-grid">
        {filteredDepoimentos.length > 0 ? (
          filteredDepoimentos.map((depoimento) => (
            <div
              key={depoimento.id}
              className={`testimonial-card ${
                depoimento.aprovado ? "approved" : "pending"
              }`}
            >
              <div className="testimonial-header">
                <div className="user-info">
                  <h3>{depoimento.nome_cliente}</h3>
                  <span className="date">
                    {new Date(depoimento.data).toLocaleDateString("pt-BR")}
                  </span>
                </div>
                <div className="status-badge">
                  {depoimento.aprovado ? "Aprovado" : "Pendente"}
                </div>
              </div>

              <div className="testimonial-meta">
                <span className="email">{depoimento.email}</span>
                {depoimento.cidade && (
                  <span className="cidade">• {depoimento.cidade}</span>
                )}
              </div>

              <div className="testimonial-content">
                <p>{depoimento.texto}</p>
              </div>

              <div className="rating">
                {"★".repeat(depoimento.avaliacao)}
                {"☆".repeat(5 - depoimento.avaliacao)}
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
            {filter === "todos"
              ? "Nenhum depoimento cadastrado."
              : filter === "pendentes"
              ? "Nenhum depoimento pendente."
              : "Nenhum depoimento aprovado."}
          </div>
        )}
      </div>

      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="delete-modal">
            <h3>Confirmar Exclusão</h3>
            <p>
              Tem certeza que deseja excluir o depoimento de{" "}
              <strong>{selectedDepoimento?.nome_cliente}</strong>?
            </p>
            <p className="warning">Esta ação não pode ser desfeita.</p>
            <div className="modal-actions">
              <button onClick={cancelDelete} className="cancel-btn">
                Cancelar
              </button>
              <button onClick={confirmDelete} className="confirm-btn">
                Confirmar Exclusão
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestimonialList;
