import api from "./api";

export const listarCarrosEstoque = async () => {
  try {
    // Primeiro busca todos os carros
    const carrosResponse = await api.get("/carros");

    // Depois busca o estoque para saber quais carros estão disponíveis
    const estoqueResponse = await api.get("/estoque");

    // Filtra apenas os carros que estão em estoque e com quantidade > 0
    const carrosEmEstoque = carrosResponse.data.filter((carro) => {
      const itemEstoque = estoqueResponse.data.find(
        (item) => item.carro_id === carro.id
      );
      return itemEstoque && itemEstoque.quantidade > 0;
    });

    return carrosEmEstoque;
  } catch (error) {
    console.error("Erro ao listar carros em estoque:", error);
    throw error;
  }
};

export const buscarCarroPorId = async (id) => {
  try {
    const response = await api.get(`/carros/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Erro ao buscar carro ${id}:`, error);
    throw error;
  }
};

// Obter um carro específico por ID
export const obterCarroPorId = async (id) => {
  try {
    const response = await api.get(`/carros/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Erro ao obter carro com ID ${id}:`, error);
    throw error;
  }
};
