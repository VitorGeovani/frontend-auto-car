import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Spinner, Badge } from 'react-bootstrap';
import { FaGasPump, FaCalendarAlt, FaTachometerAlt, FaSearch, FaWhatsapp, 
         FaCog, FaPalette, FaFilter, FaArrowLeft, FaCar, FaMoneyBillWave,
         FaRuler, FaSearchDollar, FaTimes, FaInfoCircle, FaChevronDown } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { listarCarrosEstoque } from '../../services/carroService';
import api from '../../services/api';
import './Estoque.scss';

const Estoque = () => {
  const [carrosEstoque, setCarrosEstoque] = useState([]);
  const [carrosFiltrados, setCarrosFiltrados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtrosAbertos, setFiltrosAbertos] = useState(false);
  
  // Estados para os filtros
  const [filtros, setFiltros] = useState({
    anoMin: '',
    anoMax: '',
    precoMin: '',
    precoMax: '',
    kmMin: '',
    kmMax: '',
    marca: '',
    combustivel: ''
  });

  useEffect(() => {
    const fetchCarros = async () => {
      try {
        setLoading(true);
        const data = await listarCarrosEstoque();
        setCarrosEstoque(data);
        setCarrosFiltrados(data);
        setError(null);
      } catch (err) {
        console.error('Erro ao carregar carros do estoque:', err);
        setError('Não foi possível carregar os carros do estoque.');
      } finally {
        setLoading(false);
      }
    };

    fetchCarros();
  }, []);

  // Função para obter a URL completa da imagem
  const getImageUrl = (imagePath) => {
    if (!imagePath) return 'https://via.placeholder.com/300x200?text=Sem+Imagem';
    if (imagePath.startsWith('http')) return imagePath;
    return `${api.defaults.baseURL}${imagePath}`;
  };

  // Formatar preço como string em formato de moeda brasileira
  const formatarPreco = (preco) => {
    return `R$ ${parseFloat(preco).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  // Manipulador para alterações nos filtros
  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Função para aplicar os filtros
  const aplicarFiltros = () => {
    let carrosFiltrados = [...carrosEstoque];
    
    // Filtro por ano
    if (filtros.anoMin) {
      carrosFiltrados = carrosFiltrados.filter(carro => 
        carro.ano >= parseInt(filtros.anoMin)
      );
    }
    
    if (filtros.anoMax) {
      carrosFiltrados = carrosFiltrados.filter(carro => 
        carro.ano <= parseInt(filtros.anoMax)
      );
    }
    
    // Filtro por preço
    if (filtros.precoMin) {
      const precoMin = parseFloat(filtros.precoMin);
      carrosFiltrados = carrosFiltrados.filter(carro => {
        const preco = typeof carro.preco === 'string' ? 
          parseFloat(carro.preco.replace('R$', '').replace(/\./g, '').replace(',', '.')) : 
          parseFloat(carro.preco);
        return preco >= precoMin;
      });
    }
    
    if (filtros.precoMax) {
      const precoMax = parseFloat(filtros.precoMax);
      carrosFiltrados = carrosFiltrados.filter(carro => {
        const preco = typeof carro.preco === 'string' ? 
          parseFloat(carro.preco.replace('R$', '').replace(/\./g, '').replace(',', '.')) : 
          parseFloat(carro.preco);
        return preco <= precoMax;
      });
    }
    
    // Filtro por quilometragem
    if (filtros.kmMin) {
      carrosFiltrados = carrosFiltrados.filter(carro => 
        (carro.quilometragem || 0) >= parseInt(filtros.kmMin)
      );
    }
    
    if (filtros.kmMax) {
      carrosFiltrados = carrosFiltrados.filter(carro => 
        (carro.quilometragem || 0) <= parseInt(filtros.kmMax)
      );
    }
    
    // Filtro por marca
    if (filtros.marca) {
      carrosFiltrados = carrosFiltrados.filter(carro => 
        carro.marca.toLowerCase().includes(filtros.marca.toLowerCase())
      );
    }
    
    // Filtro por combustível
    if (filtros.combustivel) {
      carrosFiltrados = carrosFiltrados.filter(carro => 
        carro.combustivel === filtros.combustivel
      );
    }
    
    setCarrosFiltrados(carrosFiltrados);
    
    // Em dispositivos móveis, fecha o painel de filtros após aplicar
    if (window.innerWidth < 768) {
      setFiltrosAbertos(false);
    }
  };

  // Função para limpar todos os filtros
  const limparFiltros = () => {
    setFiltros({
      anoMin: '',
      anoMax: '',
      precoMin: '',
      precoMax: '',
      kmMin: '',
      kmMax: '',
      marca: '',
      combustivel: ''
    });
    setCarrosFiltrados([...carrosEstoque]);
  };

  // Lista única de marcas para o filtro
  const marcasDisponiveis = [...new Set(carrosEstoque.map(carro => carro.marca))];
  
  // Lista única de combustíveis para o filtro
  const combustiveisDisponiveis = [...new Set(carrosEstoque.map(carro => carro.combustivel).filter(Boolean))];

  return (
    <div className="estoque-page">
      <Container>
        <div className="page-header">
          <div className="header-content">
            <h1><FaCar /> Estoque de Veículos</h1>
            <p>Encontre o veículo ideal para você</p>
          </div>
          <Link to="/" className="btn-back">
            <FaArrowLeft /> Voltar para a página inicial
          </Link>
        </div>
        
        <div className="filtro-toggle-btn-container d-md-none">
          <Button 
            className="filtro-toggle-btn"
            onClick={() => setFiltrosAbertos(!filtrosAbertos)}
          >
            <FaFilter /> {filtrosAbertos ? 'Fechar Filtros' : 'Filtrar Veículos'}
          </Button>
        </div>
        
        {/* Overlay para fechar os filtros em mobile */}
        <div 
          className={`filtro-overlay ${filtrosAbertos ? 'aberto' : ''}`}
          onClick={() => setFiltrosAbertos(false)}
        ></div>
        
        <Row className="estoque-container">
          {/* Painel de filtros */}
          <Col md={3} className={`filtros-panel ${filtrosAbertos ? 'aberto' : ''}`}>
            <div className="filtros-header">
              <h3><FaFilter /> Filtros</h3>
              <Button 
                variant="link" 
                className="btn-clear" 
                onClick={limparFiltros}
              >
                Limpar
              </Button>
              <Button
                variant="link"
                className="btn-close-filtros d-md-none"
                onClick={() => setFiltrosAbertos(false)}
              >
                <FaTimes />
              </Button>
            </div>
            
            <Form className="filtros-form">
              <div className="filtro-section">
                <h4><FaCalendarAlt /> Ano</h4>
                <Row>
                  <Col xs={6}>
                    <Form.Group>
                      <Form.Label>De:</Form.Label>
                      <Form.Control 
                        type="number"
                        name="anoMin"
                        value={filtros.anoMin}
                        onChange={handleFiltroChange}
                        placeholder="Min"
                      />
                    </Form.Group>
                  </Col>
                  <Col xs={6}>
                    <Form.Group>
                      <Form.Label>Até:</Form.Label>
                      <Form.Control 
                        type="number"
                        name="anoMax"
                        value={filtros.anoMax}
                        onChange={handleFiltroChange}
                        placeholder="Max"
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </div>
              
              <div className="filtro-section">
                <h4><FaMoneyBillWave /> Preço</h4>
                <Row>
                  <Col xs={6}>
                    <Form.Group>
                      <Form.Label>De:</Form.Label>
                      <Form.Control 
                        type="number"
                        name="precoMin"
                        value={filtros.precoMin}
                        onChange={handleFiltroChange}
                        placeholder="R$ Min"
                      />
                    </Form.Group>
                  </Col>
                  <Col xs={6}>
                    <Form.Group>
                      <Form.Label>Até:</Form.Label>
                      <Form.Control 
                        type="number"
                        name="precoMax"
                        value={filtros.precoMax}
                        onChange={handleFiltroChange}
                        placeholder="R$ Max"
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </div>
              
              <div className="filtro-section">
                <h4><FaTachometerAlt /> Quilometragem</h4>
                <Row>
                  <Col xs={6}>
                    <Form.Group>
                      <Form.Label>De:</Form.Label>
                      <Form.Control 
                        type="number"
                        name="kmMin"
                        value={filtros.kmMin}
                        onChange={handleFiltroChange}
                        placeholder="Km Min"
                      />
                    </Form.Group>
                  </Col>
                  <Col xs={6}>
                    <Form.Group>
                      <Form.Label>Até:</Form.Label>
                      <Form.Control 
                        type="number"
                        name="kmMax"
                        value={filtros.kmMax}
                        onChange={handleFiltroChange}
                        placeholder="Km Max"
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </div>
              
              <div className="filtro-section">
                <h4><FaCar /> Marca</h4>
                <Form.Group>
                  <Form.Control 
                    as="select"
                    name="marca"
                    value={filtros.marca}
                    onChange={handleFiltroChange}
                  >
                    <option value="">Todas as marcas</option>
                    {marcasDisponiveis.map((marca, idx) => (
                      <option key={idx} value={marca}>{marca}</option>
                    ))}
                  </Form.Control>
                </Form.Group>
              </div>
              
              <div className="filtro-section">
                <h4><FaGasPump /> Combustível</h4>
                <Form.Group>
                  <Form.Control 
                    as="select"
                    name="combustivel"
                    value={filtros.combustivel}
                    onChange={handleFiltroChange}
                  >
                    <option value="">Todos</option>
                    {combustiveisDisponiveis.map((tipo, idx) => (
                      <option key={idx} value={tipo}>{tipo}</option>
                    ))}
                  </Form.Control>
                </Form.Group>
              </div>
              
              <Button 
                variant="primary" 
                className="btn-aplicar" 
                onClick={aplicarFiltros}
              >
                <FaSearchDollar /> Aplicar Filtros
              </Button>
            </Form>
          </Col>
          
          {/* Lista de Carros */}
          <Col md={9} className="estoque-list">
            {loading ? (
              <div className="loading-container">
                <Spinner animation="border" role="status" />
                <p>Carregando veículos...</p>
              </div>
            ) : error ? (
              <div className="error-message">
                <FaInfoCircle className="icon-error mb-2" />
                <p>{error}</p>
              </div>
            ) : carrosFiltrados.length === 0 ? (
              <div className="empty-message">
                <FaInfoCircle className="icon-info mb-2" />
                <p>Não há veículos que correspondam aos critérios selecionados.</p>
                <Button variant="outline-primary" onClick={limparFiltros}>
                  <FaTimes className="me-1" /> Limpar Filtros
                </Button>
              </div>
            ) : (
              <>
                <div className="resultados-header">
                  <FaCar className="me-2" />
                  <p><strong>{carrosFiltrados.length}</strong> {carrosFiltrados.length === 1 ? 'veículo encontrado' : 'veículos encontrados'}</p>
                </div>
                
                <Row xs={1} sm={1} md={1} lg={2} className="carro-grid">
                  {carrosFiltrados.map((carro, index) => (
                    <Col key={carro.id || index} className="mb-3">
                      <Card className="carro-card">
                        <div className="carro-img-container">
                          <Card.Img
                            variant="top"
                            src={carro.imagens && carro.imagens.length > 0 
                              ? getImageUrl(carro.imagens[0]) 
                              : 'https://via.placeholder.com/300x200?text=Sem+Imagem'}
                            alt={`${carro.marca} ${carro.modelo}`}
                          />
                        </div>
                        <Card.Body>
                          <Card.Title>{carro.marca} {carro.modelo}</Card.Title>
                          
                          <div className="carro-badges">
                            <Badge bg="light" text="dark">
                              <FaCalendarAlt /> {carro.ano}
                            </Badge>
                            <Badge bg="light" text="dark">
                              <FaTachometerAlt /> {(carro.quilometragem || 0).toLocaleString()} km
                            </Badge>
                            <Badge bg="light" text="dark">
                              <FaGasPump /> {carro.combustivel || 'Flex'}
                            </Badge>
                          </div>
                          
                          <div className="carro-detalhes">
                            {carro.cores && (
                              <div className="detalhe-item">
                                <FaPalette /> <span>Cor: {carro.cores}</span>
                              </div>
                            )}
                            {carro.transmissao && (
                              <div className="detalhe-item">
                                <FaCog /> <span>Câmbio: {carro.transmissao}</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="carro-preco">
                            {carro.preco && typeof carro.preco === 'string' && carro.preco.startsWith('R$') 
                              ? carro.preco 
                              : formatarPreco(carro.preco)}
                          </div>
                          
                          <div className="carro-btns">
                            <Link to={`/veiculo/${carro.id}`} className="btn-detalhes">
                              <FaSearch /> Ver detalhes
                            </Link>
                            <Link to={`/interesse/${carro.id}`} className="btn-interesse">
                              <FaWhatsapp /> Estou interessado
                            </Link>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </>
            )}
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Estoque;