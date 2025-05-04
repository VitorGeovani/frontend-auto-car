import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000
});

// Função para limpar o cache para garantir que dados atualizados sejam carregados
const clearApiCache = () => {
  // Lista de chaves possíveis no localStorage e sessionStorage
  const cacheKeys = [
    'carros_cache',
    'estoque_cache',
    'veiculos_cache',
    'dashboard_cache',
    'categorias_cache'
  ];
  
  // Limpar todas as chaves de cache conhecidas
  cacheKeys.forEach(key => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });
  
  console.log('Cache da API limpo');
};

// Interceptador para incluir o token de autenticação
api.interceptors.request.use(
  config => {
    const adminToken = localStorage.getItem('adminToken');
    const userToken = localStorage.getItem('userToken');
    
    // Modificado para incluir também rotas /api/ para token de admin
    if (adminToken && (config.url.includes('/admin') || config.url.includes('/auth/admin') || config.url.includes('/api/interesses'))) {
      config.headers.Authorization = `Bearer ${adminToken}`;
    } else if (userToken) {
      config.headers.Authorization = `Bearer ${userToken}`;
    }
    
    // Melhorar anti-cache para todas as rotas de dados - especialmente para operações de modificação
    const noCacheRoutes = ['/carros', '/estoque', '/admin', '/api', '/veiculos', '/uploads'];
    
    // Se for uma rota que precisa ignorar cache ou qualquer operação de modificação
    if (noCacheRoutes.some(route => config.url.includes(route)) || 
        config.method === 'put' || 
        config.method === 'post' || 
        config.method === 'delete') {
      
      // Adicionar headers anti-cache mais agressivos
      config.headers = {
        ...config.headers,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'If-Modified-Since': '0'
      };
      
      // Para operações de modificação, limpar cache global primeiro
      if (config.method === 'put' || config.method === 'post' || config.method === 'delete') {
        clearApiCache();
      }
      
      // Adicionar timestamp para garantir URLs únicas
      const separator = config.url.includes('?') ? '&' : '?';
      config.url = `${config.url}${separator}_nocache=${new Date().getTime()}`;
    }
    
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Interceptador para tratar respostas e erros
api.interceptors.response.use(
  response => {
    // Identificar respostas de operações que modificam dados
    const isDataModification = 
      response.config.method === 'put' || 
      response.config.method === 'post' || 
      response.config.method === 'delete';
    
    // Se for uma modificação de dados, limpar cache para garantir dados atualizados
    if (isDataModification) {
      clearApiCache();
      
      // Para operações de edição de recursos específicos como carros
      if (response.config.url.includes('/carros/')) {
        console.log('Operação de edição de carro detectada - atualizando cache');
        
        // Forçar recarregamento de dados relacionados para garantir consistência
        setTimeout(() => {
          api.get('/carros?_nocache=' + new Date().getTime()).catch(e => 
            console.warn('Falha ao revalidar lista de carros:', e));
          api.get('/estoque?_nocache=' + new Date().getTime()).catch(e => 
            console.warn('Falha ao revalidar estoque:', e));
        }, 500);
      }
    }
    
    return response;
  },
  error => {
    console.error('Erro na requisição API:', error);
    
    if (
      error.response && 
      error.response.status === 401 && 
      !error.config.url.includes('login')
    ) {
      console.log('Token expirado ou inválido');
      
      if (error.config.url.includes('/admin') || error.config.url.includes('/api/interesses')) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminData');
        
        if (window.location.pathname.includes('/admin')) {
          window.location.href = '/admin/login';
        }
      } else {
        localStorage.removeItem('userToken');
        localStorage.removeItem('userData');
        window.location.href = '/cliente-login';
      }
    }
    
    return Promise.reject(error);
  }
);

// Exportar função de limpar cache para uso em componentes
export const clearCache = clearApiCache;

export default api;