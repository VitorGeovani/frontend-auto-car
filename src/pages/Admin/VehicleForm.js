import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../services/api";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Spinner,
  Card,
  Image,
  Alert,
} from "react-bootstrap";
import { FaTimes } from "react-icons/fa";
import "./VehicleForm.scss";

const VehicleForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categorias, setCategorias] = useState([]);
  const [loadingCategorias, setLoadingCategorias] = useState(true);
  const [categoriasError, setCategoriasError] = useState(null);
  const [imagens, setImagens] = useState([]);
  const [imagensPreview, setImagensPreview] = useState([]);
  const [imagensAtuais, setImagensAtuais] = useState([]);

  // Modifique esta função para garantir formatação correta dos caminhos
const formatImageUrl = (url) => {
  if (!url) return '';
  
  // Se a URL já estiver completa com o protocolo, retorna como está
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // Verificar formatos comuns e padronizar
  if (url.includes('/uploads/carros/')) {
    // Extrair apenas o nome do arquivo se for um caminho completo
    const fileName = url.split('/').pop();
    return `${api.defaults.baseURL}/uploads/carros/${fileName}`;
  }
  
  // Se a URL começar com / (caminho absoluto), retira a primeira barra
  const cleanPath = url.startsWith('/') ? url.substring(1) : url;
  
  // Combina com a URL base da API
  return `${api.defaults.baseURL}/${cleanPath}`;
};

  // Estado para dados do veículo
  const [formData, setFormData] = useState({
    modelo: "",
    marca: "",
    ano: new Date().getFullYear(),
    preco: "",
    descricao: "",
    quilometragem: 0,
    cores: "",
    transmissao: "manual",
    combustivel: "gasolina",
    opcionais: "",
    categoria_id: "",
  });

  // Estado para dados de estoque
  const [estoqueData, setEstoqueData] = useState({
    quantidade: 1,
    localizacao: "",
  });

  // Buscar categorias ao montar o componente
  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        setLoadingCategorias(true);
        const response = await api.get("/categorias");
        console.log("Resposta de categorias:", response.data);

        // Verificar se os dados são um array
        if (Array.isArray(response.data)) {
          setCategorias(response.data);
          setCategoriasError(null);
        } else {
          console.error(
            "Resposta de categorias não é um array:",
            response.data
          );
          setCategorias([]);
          setCategoriasError("Formato de resposta inválido para categorias");
        }
      } catch (error) {
        console.error("Erro ao buscar categorias:", error);
        setCategorias([]);
        setCategoriasError("Não foi possível carregar as categorias");
        toast.error("Erro ao carregar categorias. Tente novamente.");
      } finally {
        setLoadingCategorias(false);
      }
    };

    fetchCategorias();

    // Se estiver editando, buscar dados do veículo
    if (id) {
      const fetchCarro = async () => {
        try {
          setLoading(true);
          const response = await api.get(`/carros/${id}`);
          console.log("Dados do veículo recebidos:", response.data);
          console.log("Imagens recebidas do servidor:", response.data.imagens);

          if (response.data) {
            setFormData({
              modelo: response.data.modelo || "",
              marca: response.data.marca || "",
              ano: response.data.ano || new Date().getFullYear(),
              preco: response.data.preco || "",
              descricao: response.data.descricao || "",
              quilometragem: response.data.quilometragem || 0,
              cores: response.data.cores || "",
              transmissao: response.data.transmissao || "manual",
              combustivel: response.data.combustivel || "gasolina",
              opcionais: response.data.opcionais || "",
              categoria_id: response.data.categoria_id || "",
            });

            if (response.data.imagens && Array.isArray(response.data.imagens)) {
              setImagensAtuais(response.data.imagens);
            } else {
              console.warn(
                "Imagens não disponíveis ou não são um array:",
                response.data.imagens
              );
              setImagensAtuais([]);
            }
          } else {
            toast.error("Dados do veículo não encontrados ou inválidos");
          }

          // Buscar dados de estoque
          try {
            const estoqueResponse = await api.get("/estoque");
            console.log("Dados do estoque recebidos:", estoqueResponse.data);

            if (Array.isArray(estoqueResponse.data)) {
              const estoqueItem = estoqueResponse.data.find(
                (item) => item.carro_id === parseInt(id)
              );

              if (estoqueItem) {
                setEstoqueData({
                  quantidade: estoqueItem.quantidade || 1,
                  localizacao: estoqueItem.localizacao || "",
                });
              }
            } else {
              console.error(
                "Resposta do estoque não é um array:",
                estoqueResponse.data
              );
            }
          } catch (estoqueError) {
            console.error("Erro ao buscar dados do estoque:", estoqueError);
            // Continua usando os valores padrão para estoque
          }
        } catch (error) {
          console.error("Erro ao buscar dados do veículo:", error);
          toast.error(
            error.response?.data?.mensagem ||
              "Erro ao carregar dados do veículo"
          );
        } finally {
          setLoading(false);
        }
      };

      fetchCarro();
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleEstoqueChange = (e) => {
    const { name, value } = e.target;
    setEstoqueData({
      ...estoqueData,
      [name]: value,
    });
  };

  const handleImagemChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      setImagens(files);

      // Criar previews das imagens
      const previews = files.map((file) => URL.createObjectURL(file));
      setImagensPreview(previews);
    } else {
      setImagens([]);
      setImagensPreview([]);
    }
  };

  const removerImagem = async (src, index) => {
    try {
      console.log('Removendo imagem:', src);
      
      // Se a imagem tiver um ID numérico na URL
      if (src.includes('/uploads/carros/')) {
        // Extrair apenas o nome do arquivo da URL completa
        const nomeArquivo = src.split('/').pop();
        console.log('Nome do arquivo extraído:', nomeArquivo);
        
        // Tentar excluir pelo nome do arquivo
        await api.delete(`/imagens/arquivo/${encodeURIComponent(nomeArquivo)}`);
      } else {
        // Se for uma URL com ID direto (formato antigo)
        const idMatch = src.match(/\/imagens\/(\d+)/);
        if (idMatch && idMatch[1]) {
          const imagemId = idMatch[1];
          console.log('ID da imagem extraído:', imagemId);
          await api.delete(`/imagens/${imagemId}`);
        } else {
          throw new Error('Formato de URL de imagem não reconhecido');
        }
      }
      
      // Atualizar o estado local
      const novasImagensAtuais = [...imagensAtuais];
      novasImagensAtuais.splice(index, 1);
      setImagensAtuais(novasImagensAtuais);
      
      toast.success('Imagem removida com sucesso!');
    } catch (error) {
      console.error('Erro ao remover imagem:', error);
      console.log('URL da imagem que causou erro:', src);
      toast.error('Erro ao remover imagem. Verifique o console para mais detalhes.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.group("Submissão do formulário");
    console.log("ID do veículo (se edição):", id);
    console.log("Dados do formulário:", formData);
    console.log("Dados de estoque:", estoqueData);
    console.log("Imagens novas:", imagens.length);
    console.log("Imagens atuais:", imagensAtuais.length);

    try {
      setLoading(true);

      // Validação dos campos obrigatórios
      if (!formData.modelo.trim()) {
        toast.error("O modelo do veículo é obrigatório");
        return;
      }

      if (!formData.marca.trim()) {
        toast.error("A marca do veículo é obrigatória");
        return;
      }

      if (!formData.preco) {
        toast.error("O preço do veículo é obrigatório");
        return;
      }

      // Preparar objeto do carro com tipos corretos
      const carroData = {
        modelo: formData.modelo.trim(),
        marca: formData.marca.trim(),
        ano: parseInt(formData.ano) || new Date().getFullYear(),
        preco: parseFloat(formData.preco) || 0,
        descricao: formData.descricao || "",
        quilometragem: parseInt(formData.quilometragem) || 0,
        cores: formData.cores || "",
        transmissao: formData.transmissao || "manual",
        combustivel: formData.combustivel || "gasolina",
        opcionais: formData.opcionais || "",
        categoria_id: formData.categoria_id
          ? parseInt(formData.categoria_id)
          : null,
      };

      let carroId;

      console.log("Enviando dados do carro:", carroData);

      if (id) {
        // Atualizar carro existente
        const response = await api.put(`/carros/${id}`, carroData);
        console.log("Resposta da atualização do carro:", response.data);
        carroId = id;

        try {
          // Atualizar estoque
          const estoqueResponse = await api.get("/estoque");

          if (Array.isArray(estoqueResponse.data)) {
            const estoqueItem = estoqueResponse.data.find(
              (item) => item.carro_id === parseInt(id)
            );

            const estoquePayload = {
              quantidade: parseInt(estoqueData.quantidade) || 1,
              localizacao: estoqueData.localizacao || "",
            };

            if (estoqueItem) {
              await api.put(`/estoque/${estoqueItem.id}`, estoquePayload);
              console.log("Estoque atualizado com sucesso");
            } else {
              // Criar novo item de estoque
              const novoEstoquePayload = {
                ...estoquePayload,
                carro_id: parseInt(id),
              };

              await api.post("/estoque", novoEstoquePayload);
              console.log("Novo item de estoque criado");
            }
          } else {
            throw new Error("Resposta de estoque inválida");
          }
        } catch (estoqueError) {
          console.error("Erro ao atualizar estoque:", estoqueError);
          toast.warning(
            "Veículo salvo, mas houve um erro ao atualizar o estoque"
          );
        }
      } else {
        // Criar novo carro
        try {
          const response = await api.post("/carros", carroData);
          console.log("Resposta da criação do carro:", response.data);

          // Verificar se o ID do carro foi retornado
          if (!response.data || !response.data.id) {
            throw new Error("ID do carro não retornado pela API");
          }

          carroId = response.data.id;

          // Adicionar ao estoque
          const estoquePayload = {
            carro_id: carroId,
            quantidade: parseInt(estoqueData.quantidade) || 1,
            localizacao: estoqueData.localizacao || "",
          };

          console.log("Enviando dados para estoque:", estoquePayload);
          const estoqueResponse = await api.post("/estoque", estoquePayload);
          console.log("Resposta do estoque:", estoqueResponse.data);
        } catch (error) {
          console.error("Erro ao criar carro ou adicionar ao estoque:", error);
          throw error;
        }
      }

      // Upload de imagens se houver novas
      if (imagens.length > 0 && carroId) {
        try {
          // Se estiver editando e tiver novas imagens, primeiro excluir as antigas
          if (id) {
            console.log("Excluindo imagens antigas do carro ID:", carroId);
            try {
              // Chamar API para excluir todas as imagens do carro
              await api.delete(`/imagens/carro/${carroId}`);
              console.log("Imagens antigas excluídas com sucesso");
            } catch (deleteError) {
              console.error("Erro ao excluir imagens antigas:", deleteError);
              // Continua mesmo se falhar a exclusão
            }
          }

          // Fazer upload das novas imagens
          console.log("Fazendo upload de", imagens.length, "novas imagens");
          const formData = new FormData();
          imagens.forEach((img) => {
            formData.append("imagens", img);
          });

          await api.post(`/imagens/carro/${carroId}`, formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });

          console.log("Imagens enviadas com sucesso");

          // Buscar dados atualizados do veículo para mostrar as novas imagens
          const veiculoAtualizado = await api.get(`/carros/${carroId}`);
          if (veiculoAtualizado.data && veiculoAtualizado.data.imagens) {
            setImagensAtuais(veiculoAtualizado.data.imagens);
            setImagens([]);
            setImagensPreview([]);
          }
        } catch (imagemError) {
          console.error("Erro ao processar imagens:", imagemError);
          toast.warning(
            "Veículo salvo, mas houve um erro ao processar as imagens"
          );
        }
      }

      toast.success("Veículo salvo com sucesso!");

      // Se estiver editando, recarregar os dados antes de navegar
      if (id) {
        await recarregarDados(id);
      }

      // Aguardar um curto período para garantir que os dados
      // sejam atualizados antes de redirecionar
      setTimeout(() => {
        navigate("/admin/estoque");
      }, 1000);
      
    } catch (error) {
      console.error("Erro ao salvar veículo:", error);

      // Mostrar mensagem de erro mais específica se disponível
      const errorMessage =
        error.response?.data?.mensagem ||
        "Ocorreu um erro ao salvar o veículo. Por favor, tente novamente.";

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Função para recarregar os dados do veículo
  const recarregarDados = async (carroId) => {
    try {
      // Buscar dados atualizados do veículo
      const response = await api.get(`/carros/${carroId}`);

      if (response.data) {
        setFormData({
          modelo: response.data.modelo || "",
          marca: response.data.marca || "",
          ano: response.data.ano || new Date().getFullYear(),
          preco: response.data.preco || "",
          descricao: response.data.descricao || "",
          quilometragem: response.data.quilometragem || 0,
          cores: response.data.cores || "",
          transmissao: response.data.transmissao || "manual",
          combustivel: response.data.combustivel || "gasolina",
          opcionais: response.data.opcionais || "",
          categoria_id: response.data.categoria_id || "",
        });

        if (response.data.imagens && Array.isArray(response.data.imagens)) {
          setImagensAtuais(response.data.imagens);
        }

        return true;
      }
    } catch (error) {
      console.error("Erro ao recarregar dados:", error);
      return false;
    }
  };

  return (
    <Container className="vehicle-form-container">
      <h2 className="my-4">{id ? "Editar Veículo" : "Novo Veículo"}</h2>

      {categoriasError && (
        <Alert variant="warning">
          {categoriasError}. Você ainda pode prosseguir sem selecionar uma
          categoria.
        </Alert>
      )}

      {loading ? (
        <div className="text-center my-5 loading">
          <Spinner animation="border" role="status" />
          <p className="mt-2">Carregando dados...</p>
        </div>
      ) : (
        <Form onSubmit={handleSubmit} className="vehicle-form">
          <Card className="mb-4">
            <Card.Header>Dados do Veículo</Card.Header>
            <Card.Body>
              <Row className="form-grid">
                <Col md={6}>
                  <Form.Group className="mb-3 form-group">
                    <Form.Label>Modelo*</Form.Label>
                    <Form.Control
                      type="text"
                      name="modelo"
                      value={formData.modelo}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3 form-group">
                    <Form.Label>Marca*</Form.Label>
                    <Form.Control
                      type="text"
                      name="marca"
                      value={formData.marca}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row className="form-grid">
                <Col md={4}>
                  <Form.Group className="mb-3 form-group">
                    <Form.Label>Ano*</Form.Label>
                    <Form.Control
                      type="number"
                      name="ano"
                      value={formData.ano}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3 form-group">
                    <Form.Label>Preço*</Form.Label>
                    <Form.Control
                      type="number"
                      name="preco"
                      value={formData.preco}
                      onChange={handleChange}
                      step="0.01"
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3 form-group">
                    <Form.Label>Quilometragem</Form.Label>
                    <Form.Control
                      type="number"
                      name="quilometragem"
                      value={formData.quilometragem}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3 form-group full-width">
                <Form.Label>Descrição</Form.Label>
                <Form.Control
                  as="textarea"
                  name="descricao"
                  value={formData.descricao}
                  onChange={handleChange}
                  rows={3}
                />
              </Form.Group>

              <Row className="form-grid">
                <Col md={4}>
                  <Form.Group className="mb-3 form-group">
                    <Form.Label>Cores</Form.Label>
                    <Form.Control
                      type="text"
                      name="cores"
                      value={formData.cores}
                      onChange={handleChange}
                      placeholder="Branco, Preto, Prata..."
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3 form-group">
                    <Form.Label>Transmissão</Form.Label>
                    <Form.Select
                      name="transmissao"
                      value={formData.transmissao}
                      onChange={handleChange}
                    >
                      <option value="manual">Manual</option>
                      <option value="automatico">Automático</option>
                      <option value="semi-automatico">Semi-Automático</option>
                      <option value="cvt">CVT</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3 form-group">
                    <Form.Label>Combustível</Form.Label>
                    <Form.Select
                      name="combustivel"
                      value={formData.combustivel}
                      onChange={handleChange}
                    >
                      <option value="gasolina">Gasolina</option>
                      <option value="etanol">Etanol</option>
                      <option value="flex">Flex</option>
                      <option value="diesel">Diesel</option>
                      <option value="eletrico">Elétrico</option>
                      <option value="hibrido">Híbrido</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <Row className="form-grid">
                <Col md={6}>
                  <Form.Group className="mb-3 form-group">
                    <Form.Label>Opcionais</Form.Label>
                    <Form.Control
                      as="textarea"
                      name="opcionais"
                      value={formData.opcionais}
                      onChange={handleChange}
                      rows={2}
                      placeholder="Ar condicionado, Direção hidráulica, Vidros elétricos..."
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3 form-group">
                    <Form.Label>Categoria</Form.Label>
                    <Form.Select
                      name="categoria_id"
                      value={formData.categoria_id}
                      onChange={handleChange}
                      disabled={loadingCategorias}
                    >
                      <option value="">Selecione uma categoria</option>
                      {Array.isArray(categorias) && categorias.length > 0 ? (
                        categorias.map((categoria) => (
                          <option key={categoria.id} value={categoria.id}>
                            {categoria.nome}
                          </option>
                        ))
                      ) : (
                        <option disabled>Nenhuma categoria disponível</option>
                      )}
                    </Form.Select>
                    {loadingCategorias && (
                      <Form.Text className="text-muted">
                        Carregando categorias...
                      </Form.Text>
                    )}
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          <Card className="mb-4">
            <Card.Header>Estoque</Card.Header>
            <Card.Body>
              <Row className="form-grid">
                <Col md={6}>
                  <Form.Group className="mb-3 form-group">
                    <Form.Label>Quantidade*</Form.Label>
                    <Form.Control
                      type="number"
                      name="quantidade"
                      value={estoqueData.quantidade}
                      onChange={handleEstoqueChange}
                      min="1"
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3 form-group">
                    <Form.Label>Localização</Form.Label>
                    <Form.Control
                      type="text"
                      name="localizacao"
                      value={estoqueData.localizacao}
                      onChange={handleEstoqueChange}
                      placeholder="Ex: Loja Principal, Filial Norte..."
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          <Card className="mb-4">
            <Card.Header>Imagens</Card.Header>
            <Card.Body>
              <Form.Group className="mb-3 form-group">
                <Form.Label>Upload de Imagens</Form.Label>
                <Form.Control
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImagemChange}
                />
                <Form.Text className="text-muted">
                  Selecione uma ou mais imagens para o veículo.
                </Form.Text>
              </Form.Group>

              {imagensPreview.length > 0 && (
                <div className="mt-3 image-preview">
                  <h6>Novas imagens:</h6>
                  <div className="d-flex flex-wrap">
                    {imagensPreview.map((src, index) => (
                      <div key={index} className="m-2">
                        <Image
                          src={src}
                          alt={`Preview ${index + 1}`}
                          thumbnail
                          width={150}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {Array.isArray(imagensAtuais) && imagensAtuais.length > 0 && (
                <div className="mt-3 image-preview">
                  <h6>Imagens atuais:</h6>
                  <div className="d-flex flex-wrap">
                    {imagensAtuais.map((src, index) => (
                      <div key={index} className="m-2 image-item">
                        <Image
                          src={formatImageUrl(src)}
                          alt={`Imagem ${index + 1}`}
                          thumbnail
                          width={150}
                        />
                        <Button
                          variant="danger"
                          size="sm"
                          className="remove-image-btn"
                          onClick={() => removerImagem(src, index)}
                        >
                          <FaTimes />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>

          <div className="d-flex justify-content-end mb-4 form-actions">
            <Button
              variant="secondary"
              className="me-2 cancel-button"
              onClick={() => navigate("/admin/estoque")}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              type="submit"
              className="submit-button"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-2"
                  />
                  Salvando...
                </>
              ) : (
                "Salvar Veículo"
              )}
            </Button>
          </div>
        </Form>
      )}
    </Container>
  );
};

export default VehicleForm;