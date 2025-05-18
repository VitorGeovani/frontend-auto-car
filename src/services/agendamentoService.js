import api from "./api";

// Enviar interesse em um veículo
export const enviarInteresse = async (dadosInteresse) => {
  try {
    const response = await api.post("/agendamentos", dadosInteresse);
    return response.data;
  } catch (error) {
    console.error("Erro ao enviar interesse:", error);
    throw error;
  }
};

// Listar agendamentos/interesses do usuário
export const listarAgendamentosUsuario = async () => {
  try {
    const response = await api.get("/agendamentos/usuario");
    return response.data;
  } catch (error) {
    console.error("Erro ao listar agendamentos do usuário:", error);
    throw error;
  }
};

// Listar todos os agendamentos/interesses (admin)
export const listarTodosAgendamentos = async () => {
  try {
    const response = await api.get("/admin/agendamentos");
    return response.data;
  } catch (error) {
    console.error("Erro ao listar todos os agendamentos:", error);
    throw error;
  }
};
