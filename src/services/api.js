import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000
});

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
    
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Interceptador para tratar respostas e erros
api.interceptors.response.use(
  response => {
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

export default api;