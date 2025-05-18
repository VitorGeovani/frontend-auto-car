import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import { Table, Button, Spinner, Alert } from "react-bootstrap";
import { FaEdit, FaTrash, FaEye, FaSync } from "react-icons/fa";
import "./VehicleList.scss";

const VehicleList = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      // Usando nossa API configurada com anti-cache
      const res = await api.get("/carros");
      console.log("Veículos carregados:", res.data);
      setVehicles(res.data);
      setError(null);
    } catch (err) {
      console.error("Erro ao carregar veículos:", err);
      setError("Não foi possível carregar a lista de veículos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Tem certeza que deseja excluir este veículo?")) {
      try {
        await api.delete(`/carros/${id}`);
        // Atualizar a lista sem fazer nova requisição
        setVehicles(vehicles.filter((v) => v.id !== id));

        // Invalidar cache de rotas relacionadas
        await api.get("/estoque", {
          headers: { "Cache-Control": "no-cache" },
          params: { _t: new Date().getTime() },
        });
      } catch (error) {
        console.error("Erro ao excluir veículo:", error);
        alert("Erro ao excluir veículo.");
      }
    }
  };

  const handleRefresh = () => {
    fetchVehicles();
  };

  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" role="status" />
        <p className="mt-2">Carregando veículos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger">
        {error}
        <Button
          variant="outline-danger"
          size="sm"
          className="ms-3"
          onClick={handleRefresh}
        >
          <FaSync /> Tentar novamente
        </Button>
      </Alert>
    );
  }

  return (
    <div className="vehicle-list container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Lista de Veículos</h2>
        <div>
          <Button
            variant="outline-secondary"
            className="me-2"
            onClick={handleRefresh}
          >
            <FaSync /> Atualizar
          </Button>
          <Link to="/admin/veiculos/novo" className="btn btn-primary">
            + Novo Veículo
          </Link>
        </div>
      </div>

      {vehicles.length === 0 ? (
        <Alert variant="info">Nenhum veículo encontrado.</Alert>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>ID</th>
              <th>Marca/Modelo</th>
              <th>Ano</th>
              <th>Preço</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map((vehicle) => (
              <tr key={vehicle.id}>
                <td>{vehicle.id}</td>
                <td>
                  {vehicle.marca} {vehicle.modelo}
                </td>
                <td>{vehicle.ano}</td>
                <td>
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(vehicle.preco)}
                </td>
                <td className="actions">
                  <Link
                    to={`/admin/veiculos/${vehicle.id}`}
                    className="btn btn-sm btn-info me-2"
                  >
                    <FaEye /> Ver
                  </Link>
                  <Link
                    to={`/admin/veiculos/editar/${vehicle.id}`}
                    className="btn btn-sm btn-warning me-2"
                  >
                    <FaEdit /> Editar
                  </Link>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(vehicle.id)}
                  >
                    <FaTrash /> Excluir
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
};

export default VehicleList;
