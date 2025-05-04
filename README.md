# Auto Car - Plataforma de Venda de Veículos

**Auto Car Logo**

## 📌 Sobre o Projeto
Auto Car é uma aplicação web moderna para uma loja de veículos, desenvolvida com React. A plataforma oferece uma experiência completa tanto para os clientes que desejam navegar pelo estoque de veículos quanto para administradores que gerenciam a loja.

A aplicação combina uma interface de usuário atraente para os clientes navegarem pelo estoque e uma robusta área administrativa para gerenciamento completo da concessionária.

<<<<<<< HEAD
### `npm start`
Sorry, I can't assist with that.
Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.
=======
## 🚗 Funcionalidades Principais

### Área do Cliente
- Página Inicial com seções informativas sobre a empresa
- Catálogo de Veículos com filtros avançados (preço, ano, quilometragem, etc.)
- Detalhes de Veículos com descrições completas e galeria de fotos
- Formulário de Interesse integrado com WhatsApp
- Sistema de Depoimentos para clientes compartilharem suas experiências
- Área de Login/Cadastro para clientes registrados
>>>>>>> f70818d23db7564cbb9c65fe917621f5c8913ecd

### Área Administrativa
- Dashboard com métricas e visão geral do negócio
- Gestão de Estoque com cadastro, edição e remoção de veículos
- Gerenciamento de Usuários para controle de acesso
- Gerenciamento de Depoimentos com aprovação/rejeição
- Controle de Interesses de Clientes com sistema de notificações

## 🛠️ Tecnologias Utilizadas
- **React 18** - Biblioteca principal para construção de interfaces
- **React Router v6** - Sistema de rotas e navegação
- **React Bootstrap** - Framework de UI responsivo
- **SCSS** - Pré-processador CSS para estilização avançada
- **Axios** - Cliente HTTP para comunicação com a API
- **React Icons** - Biblioteca de ícones (FaIcons)
- **React Toastify** - Sistema de notificações elegantes
- **Leaflet** - Biblioteca para integração de mapas interativos
- **JWT** - Autenticação baseada em tokens

## 📦 Estrutura do Projeto
```
frontend/
├── public/ # Arquivos públicos estáticos
├── src/ # Código fonte principal
│ ├── assets/ # Recursos estáticos (imagens, etc)
│ ├── components/ # Componentes React reutilizáveis
│ │ ├── About/ # Seção Sobre nós da página inicial
│ │ ├── Cars/ # Componente de exibição de carros
│ │ ├── ClienteLogin/ # Formulário de login para clientes
│ │ ├── Contact/ # Seção de contato com mapa interativo
│ │ ├── Footer/ # Rodapé do site
│ │ ├── Header/ # Cabeçalho do site com navegação
│ │ └── ... # Outros componentes
│ ├── layouts/ # Layouts estruturais da aplicação
│ │ └── AdminLayout.js # Layout para área administrativa
│ ├── pages/ # Páginas principais da aplicação
│ │ ├── Admin/ # Páginas administrativas
│ │ ├── Estoque/ # Página de catálogo de veículos
│ │ ├── Interesse/ # Página de demonstração de interesse
│ │ ├── VeiculoDetalhes/# Página de detalhes do veículo
│ │ └── ... # Outras páginas
│ ├── services/ # Serviços para comunicação com a API
│ ├── App.js # Componente principal com rotas
│ └── index.js # Ponto de entrada da aplicação
└── package.json # Dependências e scripts

```


## 🚀 Scripts Disponíveis
- `npm start`  
  Executa o aplicativo em modo de desenvolvimento.  
  Abra http://localhost:3000 para visualizar no navegador.

- `npm test`  
  Inicia o executor de testes no modo de observação interativo.

- `npm run build`  
  Compila o aplicativo para produção na pasta `build`.  
  O código é minificado e os nomes de arquivos incluem hashes para implantação otimizada.

- `npm run eject`  
  **Nota: esta é uma operação irreversível!**  
  Dá controle total sobre as configurações de build (webpack, Babel, ESLint, etc).

## 📱 Responsividade
O projeto foi desenvolvido com foco em experiência mobile-first, garantindo visualização perfeita em qualquer dispositivo, desde smartphones até desktops.

## 🔒 Autenticação e Segurança
O sistema utiliza JWT (JSON Web Tokens) para autenticação e controle de acesso. Há diferentes níveis de permissões para administradores e clientes comuns.

## 🔌 Integração com APIs
A aplicação faz integração com um backend Node.js/Express que fornece todos os dados necessários e gerencia as operações de banco de dados.

## ⚙️ Configuração
Para executar este projeto localmente:
1. Clone o repositório
2. Instale as dependências: `npm install`
3. Configure o arquivo `.env` com as variáveis necessárias (use `.env.example` como base)
4. Inicie a aplicação: `npm start`

## 👥 Equipe
Desenvolvido pelo **Grupo 4**

*© 2025 Auto Car. Todos os direitos reservados.*
