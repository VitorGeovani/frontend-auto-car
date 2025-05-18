// frontend/src/pages/Admin/UserList.js
import React, { useState, useEffect } from "react";
import api from "../../services/api";
import "./UserList.scss";
import { FaSearch, FaUserEdit, FaUserTimes } from "react-icons/fa";

const UserList = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    try {
      setLoading(true);
      const response = await api.get("/usuarios");
      setUsuarios(response.data);
      setError(null);
    } catch (err) {
      console.error("Erro ao buscar usuários:", err);
      setError("Não foi possível carregar a lista de usuários.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const prepareDelete = (usuario) => {
    setSelectedUser(usuario);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedUser) return;

    try {
      await api.delete(`/usuarios/${selectedUser.id}`);
      setUsuarios(usuarios.filter((user) => user.id !== selectedUser.id));
      setShowDeleteModal(false);
      setSelectedUser(null);
    } catch (err) {
      console.error("Erro ao excluir usuário:", err);
      alert("Erro ao excluir usuário. Tente novamente.");
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setSelectedUser(null);
  };

  const filteredUsuarios = usuarios.filter(
    (user) =>
      user.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.telefone?.includes(searchTerm)
  );

  if (loading) return <div className="loading">Carregando usuários...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="user-list">
      <h1>Gerenciamento de Usuários</h1>

      <div className="search-container">
        <div className="search-input">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Buscar por nome, email ou telefone..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
      </div>

      <div className="table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nome</th>
              <th>Email</th>
              <th>Telefone</th>
              <th>Data de Cadastro</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsuarios.length > 0 ? (
              filteredUsuarios.map((usuario) => (
                <tr key={usuario.id}>
                  <td>{usuario.id}</td>
                  <td>{usuario.nome}</td>
                  <td>{usuario.email}</td>
                  <td>{usuario.telefone}</td>
                  <td>
                    {new Date(usuario.created_at).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="actions">
                    <button
                      className="delete-btn"
                      onClick={() => prepareDelete(usuario)}
                    >
                      <FaUserTimes /> Excluir
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="no-data">
                  {searchTerm
                    ? "Nenhum usuário encontrado com esses critérios."
                    : "Nenhum usuário cadastrado."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="delete-modal">
            <h3>Confirmar Exclusão</h3>
            <p>
              Tem certeza que deseja excluir o usuário{" "}
              <strong>{selectedUser?.nome}</strong>?
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

export default UserList;
