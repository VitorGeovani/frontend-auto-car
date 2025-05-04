import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import api, { clearCache } from "../../services/api";
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

  // Função melhorada para formatação de URLs de imagens
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
    
    // Se for apenas o nome do arquivo
    if (!url.includes('/')) {
      return `${api.defaults.baseURL}/uploads/carros/${url}`;
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
    ativo: true, // Importante para garantir que o veículo apareça no estoque
  });

  // Estado para dados de estoque
  const [estoqueData, setEstoqueData] = useState({
    quantidade: 1,
    localizacao: "",
  });

  // Função para invalidar o cache do navegador para uma rota específica
  const invalidateCache = async (route) => {
    try {
      await api.get(route, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
          'If-Modified-Since': '0'
        },
        params: { _nocache: new Date().getTime() }
      });
      console.log(`Cache invalidado para: ${route}`);
    } catch (error) {
      console.error(`Erro ao invalidar cache para ${route}:`, error);
    }
  };

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
          // Adicionado timestamp para evitar cache
          const response = await api.get(`/carros/${id}?_nocache=${new Date().getTime()}`);
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
              ativo: response.data.ativo !== false, // Garantir que o campo ativo exista
            });

            // Processamento melhorado para lidar com diferentes formatos de imagens
            if (response.data.imagens) {
              let imagens = response.data.imagens;
              
              // Assegurar que temos um array, mesmo que a API retorne string ou objeto
              if (typeof imagens === 'string') {
                imagens = [imagens]; // Converter string única para array
              } else if (!Array.isArray(imagens) && imagens !== null) {
                // Tentar extrair as imagens de um objeto, se aplicável
                imagens = Object.values(imagens).filter(img => img);
              }
              
              setImagensAtuais(imagens || []);
            } else {
              console.warn("Imagens não disponíveis");
              setImagensAtuais([]);
            }
          } else {
            toast.error("Dados do veículo não encontrados ou inválidos");
          }

          // Buscar dados de estoque
          try {
            const estoqueResponse = await api.get(`/estoque?_nocache=${new Date().getTime()}`);
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

  // Função melhorada para remover imagem
  const removerImagem = async (src, index) => {
    try {
      console.log('Removendo imagem:', src);
      
      let nomeArquivo;
      
      // Melhor lógica para extrair o nome do arquivo ou ID
      if (src.includes('/uploads/carros/')) {
        // Extrair apenas o nome do arquivo da URL completa
        nomeArquivo = src.split('/').pop();
        console.log('Nome do arquivo extraído:', nomeArquivo);
        
        try {
          // Tentar excluir pelo nome do arquivo
          await api.delete(`/imagens/arquivo/${encodeURIComponent(nomeArquivo)}`);
        } catch (deleteError) {
          console.warn('Falha ao deletar pelo arquivo, tentando alternativas:', deleteError);
          
          // Tentar rota alternativa
          try {
            if (id) {
              await api.delete(`/imagens/carro/${id}/${encodeURIComponent(nomeArquivo)}`);
            }
          } catch (altError) {
            console.error('Todas as tentativas de exclusão falharam:', altError);
            // Continuar mesmo se falhar - apenas atualizamos a UI
          }
        }
      } else {
        // Se for uma URL com ID direto (formato antigo)
        const idMatch = src.match(/\/imagens\/(\d+)/);
        if (idMatch && idMatch[1]) {
          const imagemId = idMatch[1];
          console.log('ID da imagem extraído:', imagemId);
          await api.delete(`/imagens/${imagemId}`);
        } else {
          // Para outros formatos, tentar deduzir o nome do arquivo
          nomeArquivo = src.split('/').pop();
          try {
            await api.delete(`/imagens/arquivo/${encodeURIComponent(nomeArquivo)}`);
          } catch (error) {
            console.warn('Não foi possível remover imagem do servidor:', error);
            // Continuar mesmo se falhar
          }
        }
      }
      
      // Sempre atualizar o estado local, mesmo que a exclusão do servidor falhe
      const novasImagensAtuais = [...imagensAtuais];
      novasImagensAtuais.splice(index, 1);
      setImagensAtuais(novasImagensAtuais);
      
      toast.success('Imagem removida com sucesso!');
    } catch (error) {
      console.error('Erro ao remover imagem:', error);
      console.log('URL da imagem que causou erro:', src);
      
      // Ainda atualizamos a UI, mesmo que a exclusão do servidor falhe
      const novasImagensAtuais = [...imagensAtuais];
      novasImagensAtuais.splice(index, 1);
      setImagensAtuais(novasImagensAtuais);
      
      toast.warning('A imagem foi removida da visualização, mas pode não ter sido excluída do servidor.');
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
        setLoading(false);
        return;
      }

      if (!formData.marca.trim()) {
        toast.error("A marca do veículo é obrigatória");
        setLoading(false);
        return;
      }

      if (!formData.preco) {
        toast.error("O preço do veículo é obrigatório");
        setLoading(false);
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
        ativo: true, // Garantir que o veículo esteja ativo
      };

      let carroId;

      console.log("Enviando dados do carro:", carroData);

      if (id) {
        // LÓGICA MELHORADA PARA EDIÇÃO DE CARRO
        console.log("INICIANDO ATUALIZAÇÃO DO CARRO ID:", id);
        console.log("DADOS ENVIADOS PARA ATUALIZAÇÃO:", JSON.stringify(carroData));
        
        // Limpar cache antes da atualização
        clearCache();
        
        // Garantir que estamos usando a requisição correta com cabeçalhos apropriados
        const response = await api.put(`/carros/${id}?_nocache=${new Date().getTime()}`, carroData, {
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
            'Content-Type': 'application/json'
          }
        });
        
        console.log("RESPOSTA DA ATUALIZAÇÃO:", response.data);
        carroId = id;
        
        // Aguardar um tempo para que a atualização seja processada completamente
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Forçar nova consulta para verificar se a atualização foi aplicada
        const verificacao = await api.get(`/carros/${id}?_nocache=${new Date().getTime()}`, {
          headers: { 'Cache-Control': 'no-cache' }
        });
        
        console.log("VERIFICAÇÃO PÓS-ATUALIZAÇÃO:", verificacao.data);
        
        if (verificacao.data.modelo !== carroData.modelo) {
          console.warn(`ALERTA: Os dados verificados após atualização não correspondem aos enviados! 
                       Enviado: ${carroData.modelo}, recebido: ${verificacao.data.modelo}`);
        }

        try {
          // Atualizar estoque
          const estoqueResponse = await api.get(`/estoque?_nocache=${new Date().getTime()}`);

          if (Array.isArray(estoqueResponse.data)) {
            const estoqueItem = estoqueResponse.data.find(
              (item) => item.carro_id === parseInt(id)
            );

            const estoquePayload = {
              quantidade: parseInt(estoqueData.quantidade) || 1,
              localizacao: estoqueData.localizacao || "",
              carro_id: parseInt(id), // Garantir que o ID do carro esteja no payload
            };

            if (estoqueItem) {
              await api.put(`/estoque/${estoqueItem.id}?_nocache=${new Date().getTime()}`, estoquePayload, {
                headers: { 'Cache-Control': 'no-cache' }
              });
              console.log("Estoque atualizado com sucesso");
            } else {
              // Criar novo item de estoque
              const novoEstoquePayload = {
                ...estoquePayload,
                carro_id: parseInt(id),
              };

              await api.post("/estoque?_nocache=" + new Date().getTime(), novoEstoquePayload, {
                headers: { 'Cache-Control': 'no-cache' }
              });
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
          const response = await api.post("/carros?_nocache=" + new Date().getTime(), carroData);
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
          const estoqueResponse = await api.post("/estoque?_nocache=" + new Date().getTime(), estoquePayload);
          console.log("Resposta do estoque:", estoqueResponse.data);
        } catch (error) {
          console.error("Erro ao criar carro ou adicionar ao estoque:", error);
          throw error;
        }
      }

      // Upload de imagens se houver novas
      if (imagens.length > 0 && carroId) {
        try {
          // Fazer upload das novas imagens
          console.log("Fazendo upload de", imagens.length, "novas imagens");
          const formData = new FormData();
          imagens.forEach((img) => {
            formData.append("imagens", img);
          });

          // Tentar diferentes endpoints para upload de imagens
          try {
            await api.post(`/upload/carros/${carroId}?_nocache=${new Date().getTime()}`, formData, {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            });
          } catch (err1) {
            console.warn("Falha no primeiro endpoint de upload, tentando alternativa:", err1);
            
            try {
              await api.post(`/imagens/carro/${carroId}?_nocache=${new Date().getTime()}`, formData, {
                headers: {
                  "Content-Type": "multipart/form-data",
                },
              });
            } catch (err2) {
              console.warn("Falha no segundo endpoint, tentando terceira alternativa:", err2);
              
              await api.post(`/imagens/${carroId}?_nocache=${new Date().getTime()}`, formData, {
                headers: {
                  "Content-Type": "multipart/form-data",
                },
              });
            }
          }

          console.log("Imagens enviadas com sucesso");
        } catch (imagemError) {
          console.error("Erro ao processar imagens:", imagemError);
          toast.warning(
            "Veículo salvo, mas houve um erro ao processar as imagens"
          );
        }
      }

      toast.success("Veículo salvo com sucesso!");

      // MODIFICAÇÕES PARA GARANTIR QUE OS DADOS SEJAM ATUALIZADOS CORRETAMENTE
      try {
        // Limpar cache de forma mais agressiva
        clearCache();
        sessionStorage.clear(); // Limpar qualquer cache na sessão
        
        // Forçar revalidação de todas as rotas relevantes
        await Promise.all([
          invalidateCache('/carros'),
          invalidateCache('/estoque'),
          invalidateCache('/admin/dashboard'),
          invalidateCache('/api/carros'),
          invalidateCache('/api/veiculos'),
          invalidateCache('/api/estoque')
        ]);
        
        // Se estiver editando, recarregar os dados antes de navegar
        if (id) {
          await recarregarDados(id);
        }
        
        // Usar navegação direta do navegador para garantir recarregamento completo
        setTimeout(() => {
          window.location.href = '/admin/estoque';
        }, 1500);
        
      } catch (cacheError) {
        console.error("Erro ao limpar cache:", cacheError);
        // Mesmo com erro, forçar recarga completa da página
        setTimeout(() => {
          window.location.href = '/admin/estoque';
        }, 1500);
      }
      
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
      const response = await api.get(`/carros/${carroId}?_nocache=${new Date().getTime()}`, {
        headers: { 'Cache-Control': 'no-cache' }
      });

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
          ativo: response.data.ativo !== false,
        });

        // Processamento de imagens aqui também
        if (response.data.imagens) {
          let imagens = response.data.imagens;
          
          if (typeof imagens === 'string') {
            imagens = [imagens];
          } else if (!Array.isArray(imagens) && imagens !== null) {
            imagens = Object.values(imagens).filter(img => img);
          }
          
          setImagensAtuais(imagens || []);
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
                          onError={(e) => {
                            console.warn(`Erro ao carregar imagem: ${src}`);
                            e.target.src = 'https://via.placeholder.com/150?text=Sem+imagem';
                          }}
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