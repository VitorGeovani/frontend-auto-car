import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Spinner,
  Alert,
  Carousel,
  Button,
} from "react-bootstrap";
import {
  FaCalendarAlt,
  FaTachometerAlt,
  FaGasPump,
  FaPaintBrush,
  FaCog,
  FaInfoCircle,
  FaTag,
  FaArrowLeft,
  FaListUl,
} from "react-icons/fa";
import { obterCarroPorId } from "../../services/carroService";
import api from "../../services/api";
import "./VeiculoDetalhes.scss";

const VeiculoDetalhes = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [veiculo, setVeiculo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categoriaInfo, setCategoriaInfo] = useState(null);

  useEffect(() => {
    const fetchVeiculo = async () => {
      try {
        setLoading(true);
        const data = await obterCarroPorId(id);
        setVeiculo(data);

        if (data && data.categoria_id) {
          try {
            const categoriaResponse = await api.get(
              `/categorias/${data.categoria_id}`
            );
            setCategoriaInfo(categoriaResponse.data);
          } catch (catErr) {
            console.error("Erro ao buscar detalhes da categoria:", catErr);
          }
        }

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

  const getImageUrl = (imagePath) => {
    if (!imagePath)
      return "https://via.placeholder.com/800x400?text=Sem+Imagem";
    if (imagePath.startsWith("http")) return imagePath;
    return `${api.defaults.baseURL}${imagePath}`;
  };

  const formatarPreco = (preco) => {
    return `R$ ${parseFloat(preco).toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const voltarParaCarros = () => {
    navigate("/");
  };

  const voltarParaEstoque = () => {
    navigate("/estoque");
  };

  if (loading) {
    return (
      <Container className="loading-container my-3">
        <Spinner animation="border" role="status" size="sm" />
        <p className="mt-2 small">Carregando...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="my-3">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  if (!veiculo) {
    return (
      <Container className="my-3">
        <Alert variant="warning">Veículo não encontrado.</Alert>
      </Container>
    );
  }

  return (
    <div className="veiculo-detalhes">
      <Container className="py-2">
        <Row>
          <Col lg={12} xl={10} className="mx-auto">
            <div className="botoes-navegacao mb-3">
              <Button
                variant="outline-secondary"
                size="sm"
                className="voltar-btn"
                onClick={voltarParaCarros}
              >
                <FaArrowLeft /> Voltar para Home
              </Button>

              <Button
                variant="outline-primary"
                size="sm"
                className="voltar-btn voltar-estoque-btn"
                onClick={voltarParaEstoque}
              >
                <FaListUl /> Ver Estoque Completo
              </Button>
            </div>

            <div className="veiculo-galeria mb-3">
              {veiculo.imagens && veiculo.imagens.length > 0 ? (
                <Carousel controls={false} indicators={false}>
                  {veiculo.imagens.map((imagem, index) => (
                    <Carousel.Item key={index}>
                      <img
                        className="d-block w-100"
                        src={getImageUrl(imagem)}
                        alt={`${veiculo.marca} ${veiculo.modelo} - Imagem ${
                          index + 1
                        }`}
                      />
                    </Carousel.Item>
                  ))}
                </Carousel>
              ) : (
                <img
                  className="d-block w-100"
                  src="https://via.placeholder.com/800x400?text=Sem+Imagem"
                  alt={`${veiculo.marca} ${veiculo.modelo}`}
                />
              )}
            </div>

            <div className="veiculo-info">
              <h2>
                {veiculo.marca} {veiculo.modelo}
              </h2>
              <div className="preco">
                {veiculo.preco &&
                typeof veiculo.preco === "string" &&
                veiculo.preco.startsWith("R$")
                  ? veiculo.preco
                  : formatarPreco(veiculo.preco)}
              </div>

              <div className="detalhes-principais">
                <div className="detalhe">
                  <FaCalendarAlt />
                  <span>Ano: {veiculo.ano}</span>
                </div>
                <div className="detalhe">
                  <FaTachometerAlt />
                  <span>
                    KM: {veiculo.quilometragem?.toLocaleString() || 0}
                  </span>
                </div>
                <div className="detalhe">
                  <FaGasPump />
                  <span>Combustível: {veiculo.combustivel || "-"}</span>
                </div>
                <div className="detalhe">
                  <FaPaintBrush />
                  <span>Cor: {veiculo.cores || "-"}</span>
                </div>
                <div className="detalhe">
                  <FaCog />
                  <span>Transmissão: {veiculo.transmissao || "-"}</span>
                </div>
                <div className="detalhe">
                  <FaTag />
                  <span>
                    Categoria:{" "}
                    {categoriaInfo?.nome || veiculo.categoria?.nome || "-"}
                  </span>
                </div>
              </div>

              <div className="descricao">
                <h3>Descrição</h3>
                <p>
                  {veiculo.descricao ||
                    "Não há descrição disponível para este veículo."}
                </p>
              </div>

              {veiculo.opcionais && veiculo.opcionais.length > 0 && (
                <div className="opcionais">
                  <h3>Opcionais</h3>
                  <ul>
                    {veiculo.opcionais.split(",").map((opcional, index) => (
                      <li key={index}>
                        <FaInfoCircle /> {opcional.trim()}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default VeiculoDetalhes;
