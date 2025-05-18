import api from "./api";

// Enviar interesse em um veículo
export const enviarInteresse = async (dadosInteresse) => {
  try {
    const response = await api.post("/api/interesses", dadosInteresse);
    return response.data;
  } catch (error) {
    console.error("Erro ao enviar interesse:", error);
    throw error;
  }
};

// Listar todos os interesses (para admins)
export const listarInteresses = async () => {
  try {
    const response = await api.get("/api/interesses");
    return response.data;
  } catch (error) {
    console.error("Erro ao listar interesses:", error);
    throw error;
  }
};

// Obter um interesse específico
export const obterInteressePorId = async (id) => {
  try {
    const response = await api.get(`/api/interesses/${id}`);
    return response.data;
  } catch (error) {
    console.error("Erro ao obter interesse:", error);
    throw error;
  }
};

// Marcar interesse como lido
export const marcarComoLido = async (id) => {
  try {
    const response = await api.put(`/api/interesses/${id}/lido`);
    return response.data;
  } catch (error) {
    console.error("Erro ao marcar interesse como lido:", error);
    throw error;
  }
};

// Excluir interesse
export const excluirInteresse = async (id) => {
  try {
    const response = await api.delete(`/api/interesses/${id}`);
    return response.data;
  } catch (error) {
    console.error("Erro ao excluir interesse:", error);
    throw error;
  }
};
