import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Alert,
  Spinner,
  Badge,
} from "react-bootstrap";
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaTachometerAlt,
  FaGasPump,
  FaMoneyBillWave,
  FaCarSide,
  FaInfoCircle,
} from "react-icons/fa";
import { obterCarroPorId } from "../../services/carroService";
import FormularioInteresse from "../../components/FormularioInteresse/FormularioInteresse";
import api from "../../services/api";
import "./Interesse.scss";

const Interesse = () => {
  const { id } = useParams();
  const [veiculo, setVeiculo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVeiculo = async () => {
      try {
        setLoading(true);
        const data = await obterCarroPorId(id);
        setVeiculo(data);
        setError(null);
      } catch (err) {
        console.error("Erro ao carregar detalhes do veículo:", err);
        setError("Não foi possível carregar os detalhes deste veículo.");
      } finally {
        setLoading(false);
      }
    };

    fetchVeiculo();
  }, [id]);

  // Função para obter a URL completa da imagem
  const getImageUrl = (imagePath) => {
    if (!imagePath)
      return "https://via.placeholder.com/300x200?text=Sem+Imagem";
    if (imagePath.startsWith("http")) return imagePath;
    return `${api.defaults.baseURL}${imagePath}`;
  };

  if (loading) {
    return (
      <Container className="loading-container">
        <Spinner animation="border" role="status" />
        <p>Carregando informações do veículo...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="error-container">
        <Alert variant="danger">
          <FaInfoCircle className="me-2" /> {error}
        </Alert>
        <Link to="/" className="btn btn-primary">
          <FaArrowLeft /> Voltar para a página inicial
        </Link>
      </Container>
    );
  }

  if (!veiculo) {
    return (
      <Container className="error-container">
        <Alert variant="warning">
          <FaInfoCircle className="me-2" /> Veículo não encontrado.
        </Alert>
        <Link to="/" className="btn btn-primary">
          <FaArrowLeft /> Voltar para a página inicial
        </Link>
      </Container>
    );
  }

  return (
    <div className="interesse-page">
      <Container>
        <div className="page-header">
          <h2>
            <FaCarSide className="me-2" /> Demonstrar interesse
          </h2>
          <Link to={`/veiculo/${id}`} className="btn btn-outline-primary">
            <FaArrowLeft /> Ver detalhes
          </Link>
        </div>

        <Row className="interesse-content">
          <Col lg={4} md={5} sm={12}>
            <Card className="veiculo-card">
              <div className="img-container">
                <Card.Img
                  variant="top"
                  src={
                    veiculo.imagens && veiculo.imagens.length > 0
                      ? getImageUrl(veiculo.imagens[0])
                      : "https://via.placeholder.com/300x200?text=Sem+Imagem"
                  }
                  alt={`${veiculo.marca} ${veiculo.modelo}`}
                />
              </div>
              <Card.Body>
                <Card.Title>
                  {veiculo.marca} {veiculo.modelo}
                </Card.Title>
                <div className="veiculo-badges">
                  <Badge bg="light" text="dark">
                    <FaCalendarAlt /> {veiculo.ano}
                  </Badge>
                  <Badge bg="light" text="dark">
                    <FaTachometerAlt />{" "}
                    {veiculo.quilometragem?.toLocaleString() || 0} km
                  </Badge>
                  <Badge bg="light" text="dark">
                    <FaGasPump /> {veiculo.combustivel || "Flex"}
                  </Badge>
                </div>
                <div className="veiculo-preco">
                  <FaMoneyBillWave />
                  {veiculo.preco &&
                  typeof veiculo.preco === "string" &&
                  veiculo.preco.startsWith("R$")
                    ? veiculo.preco
                    : `R$ ${parseFloat(veiculo.preco).toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}`}
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={8} md={7} sm={12}>
            <FormularioInteresse veiculo={veiculo} />
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Interesse;
