import axios from 'axios';
import { toast } from 'react-toastify';

const api = axios.create({
  baseURL: 'http://localhost:3001',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000
});

// Função aprimorada para limpar cache preservando tokens de autenticação
const clearApiCache = () => {
  console.log('Limpando cache da API e aplicação...');
  
  // IMPORTANTE: Salvar tokens antes de limpar cache
  const adminToken = localStorage.getItem('adminToken');
  const adminData = localStorage.getItem('adminData');
  const userToken = localStorage.getItem('userToken');
  const userData = localStorage.getItem('userData');
  
  // Lista de chaves padrão para limpeza
  const cacheKeys = [
    'carros_cache', 'estoque_cache', 'veiculos_cache', 
    'dashboard_cache', 'categorias_cache', 'depoimentos_cache',
    'carros_data', 'estoque_data', 'veiculos_data',
    'dashboard_data', 'categorias_data', 'depoimentos_data'
  ];
  
  // Limpar todas as chaves conhecidas
  cacheKeys.forEach(key => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });
  
  // Limpar chaves que sigam padrões comuns de cache
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.includes('_cache') || key.includes('_data') || 
        key.includes('api_') || key.includes('cached_')) && 
        key !== 'adminToken' && key !== 'adminData' && 
        key !== 'userToken' && key !== 'userData') {
      localStorage.removeItem(key);
    }
  }
  
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (key && (key.includes('_cache') || key.includes('_data') || 
        key.includes('api_') || key.includes('cached_')) && 
        key !== 'adminToken' && key !== 'adminData' && 
        key !== 'userToken' && key !== 'userData') {
      sessionStorage.removeItem(key);
    }
  }
  
  // IMPORTANTE: Restaurar tokens após limpeza
  if (adminToken) localStorage.setItem('adminToken', adminToken);
  if (adminData) localStorage.setItem('adminData', adminData);
  if (userToken) localStorage.setItem('userToken', userToken);
  if (userData) localStorage.setItem('userData', userData);
  
  console.log('Cache limpo com sucesso (tokens preservados)');
  
  // Limpar também cache do serviço worker se existir
  if ('caches' in window) {
    caches.keys().then(cacheNames => {
      cacheNames.forEach(cacheName => {
        if (cacheName.includes('api-cache')) {
          caches.delete(cacheName);
          console.log(`Cache do service worker '${cacheName}' removido`);
        }
      });
    });
  }
};

// Interceptador para incluir o token de autenticação
api.interceptors.request.use(
  config => {
    const adminToken = localStorage.getItem('adminToken');
    const userToken = localStorage.getItem('userToken');
    
    // Verificar se é uma rota administrativa ou de depoimentos admin
    const isAdminRoute = 
      config.url.includes('/admin') || 
      config.url.includes('/auth/admin') || 
      config.url.includes('/api/interesses') ||
      (config.url.includes('/depoimentos') && 
       (config.url.includes('/admin') || config.method !== 'get'));
    
    // Usar token adequado baseado no tipo de rota
    if (adminToken && isAdminRoute) {
      config.headers.Authorization = `Bearer ${adminToken}`;
    } else if (userToken && !isAdminRoute) {
      config.headers.Authorization = `Bearer ${userToken}`;
    }
    
    // Melhorar anti-cache para todas as rotas de dados - especialmente para operações de modificação
    const noCacheRoutes = ['/carros', '/estoque', '/admin', '/api', '/veiculos', '/uploads', '/depoimentos'];
    
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
        clearApiCache(); // Agora preserva tokens
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
      clearApiCache(); // Agora preserva tokens
      
      // Para modificações em carros ou estoque, revalidar dados relacionados
      if (response.config.url.includes('/carros') || response.config.url.includes('/estoque')) {
        console.log('Operação de veículo detectada - atualizando cache');
        
        // Forçar recarregamento de dados relacionados
        setTimeout(() => {
          // Recarregar listagens principais
          api.get('/carros?_nocache=' + new Date().getTime())
            .catch(e => console.warn('Falha ao revalidar lista de carros:', e));
            
          api.get('/estoque?_nocache=' + new Date().getTime())
            .catch(e => console.warn('Falha ao revalidar estoque:', e));
        }, 500);
      }
      
      // Para operações de depoimentos, revalidar dados
      if (response.config.url.includes('/depoimentos')) {
        console.log('Operação de depoimentos detectada - atualizando cache');
        
        // Forçar recarregamento de dados relacionados
        setTimeout(() => {
          // Recarregar depoimentos públicos para atualização da página inicial
          api.get('/depoimentos?_nocache=' + new Date().getTime())
            .catch(e => console.warn('Falha ao revalidar lista de depoimentos:', e));
            
          // Se for uma rota admin, atualizar também os depoimentos do admin
          if (response.config.url.includes('/admin') || 
              localStorage.getItem('adminToken')) {
            api.get('/depoimentos/admin?_nocache=' + new Date().getTime())
              .catch(e => console.warn('Falha ao revalidar lista de depoimentos admin:', e));
          }
        }, 500);
      }
    }
    
    return response;
  },
  error => {
    console.error('Erro na requisição API:', error);
    
    // Verificar se é erro de autenticação e a rota
    if (error.response && error.response.status === 401) {
      console.log('Token expirado ou inválido');
      
      const isAdminRoute = 
        error.config.url.includes('/admin') || 
        error.config.url.includes('/api/interesses') ||
        (error.config.url.includes('/depoimentos') && error.config.url.includes('/admin'));
      
      if (isAdminRoute) {
        // Não fazer redirecionamento automático para login de admin
        // Apenas limpar o token para que componentes possam decidir o que fazer
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminData');
        
        // Mostrar um toast, mas não redirecionar automaticamente
        toast.error('Sua sessão administrativa expirou. Por favor, faça login novamente.');
      } else {
        localStorage.removeItem('userToken');
        localStorage.removeItem('userData');
        
        // Se não for rota admin, pode redirecionar para login de cliente
        if (!window.location.pathname.includes('/admin')) {
          window.location.href = '/cliente-login';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

// Exportar função de limpar cache para uso em componentes
export const clearCache = clearApiCache;

export default api;