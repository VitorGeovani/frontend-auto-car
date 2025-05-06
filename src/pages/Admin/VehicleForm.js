import React, { useState, useEffect, useCallback } from "react";
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
    localizacao: "Matriz",
  });

  // Função melhorada para formatação de URLs de imagens
  const formatImageUrl = (url) => {
    if (!url) return 'https://via.placeholder.com/150?text=Sem+imagem';
    
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

  // Função para limpar caches preservando tokens de autenticação
  const limparCaches = useCallback(() => {
    console.log('Limpando caches da aplicação...');
    
    // IMPORTANTE: Salvar todos os tokens antes de limpar
    const adminToken = localStorage.getItem('adminToken');
    const adminData = localStorage.getItem('adminData');
    const userToken = localStorage.getItem('userToken');
    const userData = localStorage.getItem('userData');
    
    // Usar a função importada do serviço API
    clearCache();
    
    // Remover manualmente chaves específicas mais abrangentes
    const keysToRemove = [
      'carros_cache', 'estoque_cache', 'veiculos_cache',
      'carros_data', 'estoque_data', 'veiculos_data',
      'cache_timestamp', 'last_carros_data', 'last_update',
      'carros_lista', 'ultimas_consultas'
    ];
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
      
      // Tentar também variações com prefixo/sufixo
      localStorage.removeItem(`${key}_list`);
      sessionStorage.removeItem(`${key}_list`);
      localStorage.removeItem(`${key}_data`);
      sessionStorage.removeItem(`${key}_data`);
    });
    
    // Limpar também itens relacionados ao veículo específico sendo editado
    if (id) {
      localStorage.removeItem(`carro_${id}`);
      sessionStorage.removeItem(`carro_${id}`);
      localStorage.removeItem(`veiculo_${id}`);
      sessionStorage.removeItem(`veiculo_${id}`);
    }
    
    // IMPORTANTE: Restaurar todos os tokens após limpeza
    if (adminToken) localStorage.setItem('adminToken', adminToken);
    if (adminData) localStorage.setItem('adminData', adminData);
    if (userToken) localStorage.setItem('userToken', userToken);
    if (userData) localStorage.setItem('userData', userData);
    
    console.log("Caches limpos com sucesso (tokens preservados)");
  }, [id]);

  // Função para forçar atualização de uma rota específica
  const forceRouteRefresh = useCallback(async (route, param = null) => {
    try {
      const timestamp = new Date().getTime();
      const url = param ? `${route}/${param}?_t=${timestamp}` : `${route}?_t=${timestamp}`;
      
      await api.get(url, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      console.log(`Rota ${url} atualizada com sucesso`);
      return true;
    } catch (error) {
      console.warn(`Erro ao atualizar rota ${route}:`, error);
      return false;
    }
  }, []);

  // Buscar categorias e dados iniciais ao montar o componente
  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        setLoadingCategorias(true);
        const response = await api.get("/categorias");
        
        if (Array.isArray(response.data)) {
          setCategorias(response.data);
          setCategoriasError(null);
        } else {
          console.error("Resposta de categorias não é um array:", response.data);
          setCategorias([]);
          setCategoriasError("Formato de resposta inválido para categorias");
        }
      } catch (error) {
        console.error("Erro ao buscar categorias:", error);
        setCategorias([]);
        setCategoriasError("Não foi possível carregar as categorias");
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
          const response = await api.get(`/carros/${id}?_nocache=${new Date().getTime()}`);
          console.log("Dados do veículo recebidos:", response.data);

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

            // Processamento de imagens aprimorado
            if (response.data.imagens) {
              let imagens = response.data.imagens;
              
              // Garantir que temos um array
              if (typeof imagens === 'string') {
                imagens = [imagens];
              } else if (!Array.isArray(imagens)) {
                imagens = Object.values(imagens || {}).filter(img => img);
              }
              
              console.log("Imagens processadas:", imagens);
              setImagensAtuais(imagens || []);
            } else {
              console.log("Sem imagens disponíveis");
              setImagensAtuais([]);
            }
          } else {
            toast.error("Dados do veículo não encontrados");
          }

          // Buscar dados de estoque - VERSÃO MELHORADA
          try {
            // Primeiro, tentar buscar diretamente pelo ID do carro (endpoint mais seguro)
            const estoqueDirectResponse = await api.get(`/estoque/carro/${id}?_nocache=${new Date().getTime()}`);
            
            if (estoqueDirectResponse.data) {
              console.log("Dados de estoque encontrados (busca direta):", estoqueDirectResponse.data);
              setEstoqueData({
                quantidade: estoqueDirectResponse.data.quantidade || 1,
                localizacao: estoqueDirectResponse.data.localizacao || "Matriz",
              });
            } else {
              // Método alternativo - buscar lista e filtrar
              const estoqueResponse = await api.get(`/estoque?_nocache=${new Date().getTime()}`);
              
              if (Array.isArray(estoqueResponse.data)) {
                const estoqueItem = estoqueResponse.data.find(
                  (item) => item.carro_id === parseInt(id)
                );

                if (estoqueItem) {
                  console.log("Dados de estoque encontrados (lista):", estoqueItem);
                  setEstoqueData({
                    quantidade: estoqueItem.quantidade || 1,
                    localizacao: estoqueItem.localizacao || "Matriz",
                  });
                } else {
                  console.log("Nenhum registro de estoque encontrado para este veículo");
                  // Valores padrão
                  setEstoqueData({
                    quantidade: 1,
                    localizacao: "Matriz",
                  });
                }
              } else {
                console.warn("Resposta do estoque não é um array");
                setEstoqueData({
                  quantidade: 1,
                  localizacao: "Matriz",
                });
              }
            }
          } catch (estoqueError) {
            console.error("Erro ao buscar dados do estoque:", estoqueError);
            setEstoqueData({
              quantidade: 1,
              localizacao: "Matriz",
            });
          }
        } catch (error) {
          console.error("Erro ao buscar dados do veículo:", error);
          toast.error("Erro ao carregar dados do veículo");
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
      
      // Verificar tamanho das imagens (max 5MB cada)
      const validFiles = files.filter(file => file.size <= 5 * 1024 * 1024);
      
      if (validFiles.length !== files.length) {
        toast.warning("Algumas imagens foram ignoradas por excederem 5MB");
      }
      
      setImagens(validFiles);

      // Criar previews das imagens
      const previews = validFiles.map((file) => URL.createObjectURL(file));
      setImagensPreview(previews);
    } else {
      setImagens([]);
      setImagensPreview([]);
    }
  };

  // Função para remover imagem
  const removerImagem = async (src, index) => {
    try {
      console.log('Removendo imagem:', src);
      
      let nomeArquivo;
      
      // Extrair o nome do arquivo ou ID
      if (src.includes('/uploads/carros/')) {
        nomeArquivo = src.split('/').pop();
        
        try {
          await api.delete(`/imagens/arquivo/${encodeURIComponent(nomeArquivo)}`);
          toast.success('Imagem removida com sucesso!');
        } catch (error) {
          console.warn('Erro ao remover imagem:', error);
          
          if (id) {
            try {
              await api.delete(`/imagens/carro/${id}/${encodeURIComponent(nomeArquivo)}`);
              toast.success('Imagem removida com sucesso (método alternativo)!');
            } catch (err) {
              console.error('Falha ao remover imagem:', err);
              toast.warning('A imagem foi removida da visualização, mas pode não ter sido excluída do servidor.');
            }
          }
        }
      } else {
        // Para outros formatos, tentar deduzir o ID ou nome
        const idMatch = src.match(/\/imagens\/(\d+)/);
        if (idMatch && idMatch[1]) {
          await api.delete(`/imagens/${idMatch[1]}`);
          toast.success('Imagem removida com sucesso!');
        } else {
          nomeArquivo = src.split('/').pop();
          try {
            await api.delete(`/imagens/arquivo/${encodeURIComponent(nomeArquivo)}`);
            toast.success('Imagem removida com sucesso!');
          } catch (error) {
            console.warn('Erro ao remover imagem:', error);
            toast.warning('A imagem foi removida da visualização, mas pode não ter sido excluída do servidor.');
          }
        }
      }
      
      // Atualizar o estado local sempre
      const novasImagensAtuais = [...imagensAtuais];
      novasImagensAtuais.splice(index, 1);
      setImagensAtuais(novasImagensAtuais);
      
    } catch (error) {
      console.error('Erro ao processar remoção de imagem:', error);
      
      // Ainda atualizar o estado local mesmo com erro
      const novasImagensAtuais = [...imagensAtuais];
      novasImagensAtuais.splice(index, 1);
      setImagensAtuais(novasImagensAtuais);
      
      toast.warning('A imagem foi removida da visualização, mas pode não ter sido excluída do servidor.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.clear();
    console.group("Submissão do formulário de veículo");
    console.log("Modo:", id ? "EDIÇÃO" : "CRIAÇÃO");
    console.log("ID do veículo (se edição):", id);
    console.log("Dados do formulário:", formData);
    console.log("Dados de estoque:", estoqueData);
    console.log("Novas imagens:", imagens.length);
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

      // ETAPA 1: Limpar caches antes da operação
      limparCaches();
      
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
        categoria_id: formData.categoria_id ? parseInt(formData.categoria_id) : null,
      };

      let carroId;
      const timestamp = new Date().getTime();

      // ETAPA 2: Criar ou atualizar o veículo principal - VERSÃO OTIMIZADA
      if (id) {
        // MODO EDIÇÃO - MODIFICADO PARA RESOLVER O PROBLEMA
        console.log("Atualizando veículo ID:", id);
        
        try {
          // IMPORTANTE: Separar a atualização - primeiro apenas o carro sem dados de estoque
          const response = await api.put(`/carros/${id}`, carroData, {
            headers: {
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Content-Type': 'application/json',
              'Pragma': 'no-cache',
              'Expires': '0'
            },
            params: { _t: timestamp }
          });
          
          console.log("Resposta da atualização do carro:", response.data);
          carroId = id;
          
          // Pausa estratégica para o banco processar
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (updateError) {
          console.error("Erro crítico na atualização do veículo:", updateError);
          throw updateError;
        }
      } else {
        // MODO CRIAÇÃO
        console.log("Criando novo veículo");
        
        const response = await api.post(`/carros`, carroData, {
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Content-Type': 'application/json',
            'Pragma': 'no-cache',
            'Expires': '0'
          },
          params: { _t: timestamp }
        });
        
        console.log("Resposta da criação:", response.data);
        
        if (!response.data || !response.data.id) {
          throw new Error("ID do veículo não retornado pelo servidor");
        }
        
        carroId = response.data.id;
      }

      // ETAPA 3: Atualizar estoque SEPARADAMENTE - VERSÃO CORRIGIDA
      if (carroId) {
        try {
          console.log("Atualizando estoque para carro ID:", carroId);
          
          // Verificar primeiro se existe registro de estoque
          const estoqueCheck = await api.get(`/estoque/carro/${carroId}?_nocache=${new Date().getTime()}`);
          
          if (estoqueCheck.data && estoqueCheck.data.id) {
            // Existe registro - Fazer update
            console.log("Registro de estoque existente encontrado:", estoqueCheck.data);
            
            await api.put(`/estoque/${estoqueCheck.data.id}`, {
              quantidade: parseInt(estoqueData.quantidade) || 1,
              localizacao: estoqueData.localizacao || "Matriz"
            }, {
              headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Content-Type': 'application/json',
                'Pragma': 'no-cache',
                'Expires': '0'
              }
            });
            console.log("Estoque atualizado com sucesso");
          } else {
            // Não existe registro - Criar novo
            console.log("Nenhum registro de estoque encontrado. Criando novo...");
            
            await api.post(`/estoque`, {
              carro_id: parseInt(carroId),
              quantidade: parseInt(estoqueData.quantidade) || 1,
              localizacao: estoqueData.localizacao || "Matriz"
            }, {
              headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Content-Type': 'application/json',
                'Pragma': 'no-cache',
                'Expires': '0'
              }
            });
            console.log("Novo registro de estoque criado com sucesso");
          }
          
          // Pausa estratégica após atualização de estoque
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Verificação adicional para confirmar atualização
          const verificacaoFinal = await api.get(`/estoque/carro/${carroId}?_nocache=${new Date().getTime()}`);
          console.log("Verificação final do estoque:", verificacaoFinal.data);
          
        } catch (estoqueError) {
          console.error("Erro ao atualizar estoque:", estoqueError);
          toast.warning("Veículo salvo, mas houve problema ao atualizar o estoque. Tentando alternativa...");
          
          // Método alternativo para garantir a atualização do estoque
          try {
            await api.post(`/estoque/atualizar`, {
              carro_id: parseInt(carroId),
              quantidade: parseInt(estoqueData.quantidade) || 1,
              localizacao: estoqueData.localizacao || "Matriz"
            }, {
              headers: {
                'Cache-Control': 'no-cache',
                'Content-Type': 'application/json'
              }
            });
            console.log("Estoque atualizado com método alternativo");
          } catch (estoqueAltError) {
            console.error("Falha também no método alternativo:", estoqueAltError);
          }
        }
      }

      // ETAPA 4: Processar novas imagens
      if (imagens.length > 0 && carroId) {
        console.log("Enviando", imagens.length, "novas imagens para o veículo");
        
        const formDataImagens = new FormData();
        imagens.forEach((img) => {
          formDataImagens.append("imagens", img);
        });
        
        try {
          await api.post(`/imagens/carro/${carroId}`, formDataImagens, {
            headers: { 
              "Content-Type": "multipart/form-data",
              'Cache-Control': 'no-cache'
            }
          });
          console.log("Upload de imagens realizado com sucesso");
        } catch (uploadError) {
          console.warn("Primeiro método falhou, tentando alternativa:", uploadError);
          
          try {
            await api.post(`/upload/carros/${carroId}`, formDataImagens, {
              headers: { 
                "Content-Type": "multipart/form-data",
                'Cache-Control': 'no-cache'
              }
            });
            console.log("Upload alternativo de imagens realizado com sucesso");
          } catch (uploadError2) {
            console.error("Falha também no upload alternativo:", uploadError2);
            toast.warning("Veículo salvo, mas houve problemas com o upload de imagens");
          }
        }
      }

      // ETAPA 5: Forçar atualização de dados em todas as rotas importantes
      console.log("Forçando atualização de todas as rotas importantes...");
      
      await Promise.all([
        forceRouteRefresh('/carros'),
        forceRouteRefresh('/estoque'),
        forceRouteRefresh('/veiculos'),
        carroId ? forceRouteRefresh('/carros', carroId) : null,
        carroId ? forceRouteRefresh(`/veiculos/${carroId}`) : null
      ].filter(Boolean));
      
      // ETAPA 6: Limpar caches novamente para garantir dados atualizados
      limparCaches();
      
      toast.success("Veículo salvo com sucesso!");
      console.log("✅ OPERAÇÃO CONCLUÍDA COM SUCESSO");
      
      // ETAPA 7: Redirecionar para a página de estoque com atraso
      setTimeout(() => {
        console.log("Redirecionando para página de estoque...");
        
        // Forçar recarga completa da página para garantir dados atualizados
        sessionStorage.setItem('forceRefresh', 'true');
        
        // Usar window.location com query param de timestamp para forçar recarga
        const refreshTimestamp = new Date().getTime();
        window.location.href = `/admin/estoque?_refresh=${refreshTimestamp}`;
      }, 2000);
      
    } catch (error) {
      console.error("ERRO DURANTE O PROCESSAMENTO:", error);

      const errorMessage = 
        error.response?.data?.mensagem || 
        error.response?.data?.erro ||
        "Ocorreu um erro ao salvar o veículo. Por favor, tente novamente.";

      toast.error(errorMessage);
    } finally {
      setLoading(false);
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
                  Selecione uma ou mais imagens para o veículo (máx. 5MB cada).
                </Form.Text>
              </Form.Group>

              {imagensPreview.length > 0 && (
                <div className="mt-3 image-preview">
                  <h6>Novas imagens:</h6>
                  <div className="d-flex flex-wrap">
                    {imagensPreview.map((src, index) => (
                      <div key={`new-${index}`} className="m-2">
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
                      <div key={`current-${index}`} className="m-2 image-item">
                        <Image
                          src={formatImageUrl(src)}
                          alt={`Imagem ${index + 1}`}
                          thumbnail
                          width={150}
                          onError={(e) => {
                            console.warn(`Erro ao carregar imagem: ${src}`);
                            e.target.src = 'https://via.placeholder.com/150?text=Erro';
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