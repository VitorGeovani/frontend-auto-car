import React from "react";
import { Routes, Route } from "react-router-dom";
import "./App.scss";

// Componentes principais do site
import Header from "./components/Header/Header";
import About from "./components/About/About";
import Services from "./components/Services/Services";
import Cars from "./components/Cars/Cars";
import Testimonials from "./components/Testimonials/Testimonials";
import Contact from "./components/Contact/Contact";
import Footer from "./components/Footer/Footer";

// Componentes de autenticação e cadastro
import LoginCadastro from "./pages/Login/LoginCadastro";
import ClienteLogin from "./components/ClienteLogin/ClienteLogin";
import ClienteRegister from "./components/ClienteRegister/ClienteRegister";
import FuncionarioLogin from "./components/FuncionarioLogin/FuncionarioLogin";

// Componentes administrativos
import AdminLogin from "./pages/Admin/AdminLogin";
import AdminLayout from "./layouts/AdminLayout";
import Dashboard from "./pages/Admin/Dashboard";
import EstoqueList from "./pages/Admin/EstoqueList";
import VehicleForm from "./pages/Admin/VehicleForm";
import UserList from "./pages/Admin/UserList";
import TestimonialList from "./pages/Admin/TestimonialList";
import PrivateRoute from "./components/PrivateRoute/PrivateRoute";

// Componentes de interesse
import AdminInteresses from "./pages/Admin/Interesses";
import DetalheInteresse from "./pages/Admin/Interesses/DetalheInteresse";

import VeiculoDetalhes from "./pages/VeiculoDetalhes/VeiculoDetalhes";
import Interesse from "./pages/Interesse/Interesse";
import Estoque from "./pages/Estoque/Estoque"; // Importando a página de Estoque

function App() {
  return (
    <div className="App">
      <Routes>
        {/* Página Inicial (Home) */}
        <Route
          path="/"
          element={
            <>
              <Header />
              <About />
              <Services />
              <Cars />
              <Testimonials />
              <Contact />
              <Footer />
            </>
          }
        />

        {/* Página de Estoque */}
        <Route
          path="/estoque"
          element={
            <>
              <Header />
              <Estoque />
              <Footer />
            </>
          }
        />

        {/* Páginas de detalhes de veículos e interesse */}
        <Route 
          path="/veiculo/:id" 
          element={
            <>
              <Header />
              <VeiculoDetalhes />
              <Footer />
            </>
          }
        />
        
        <Route 
          path="/interesse/:id" 
          element={
            <>
              <Header />
              <Interesse />
              <Footer />
            </>
          }
        />

        {/* Página de Login/Cadastro */}
        <Route path="/login-cadastro" element={<LoginCadastro />} />

        {/* Login Cliente */}
        <Route path="/cliente-login" element={<ClienteLogin />} />

        {/* Cadastro Cliente */}
        <Route path="/cliente-register" element={<ClienteRegister />} />

        {/* Login Admin - Funcionário */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Dashboard do Funcionário (após login) - Mantido para compatibilidade */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Rotas administrativas protegidas */}
        <Route
          path="/admin"
          element={
            <PrivateRoute>
              <AdminLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="estoque" element={<EstoqueList />} />
          <Route path="veiculos/novo" element={<VehicleForm />} />
          <Route path="veiculos/editar/:id" element={<VehicleForm />} />
          <Route path="usuarios" element={<UserList />} />
          <Route path="depoimentos" element={<TestimonialList />} />
          
          {/* Rotas de Interesses */}
          <Route path="interesses" element={<AdminInteresses />} />
          <Route path="interesses/:id" element={<DetalheInteresse />} />
          
          {/* Se você quiser estas páginas também dentro da área admin, use caminhos relativos */}
          <Route path="veiculo/:id" element={<VeiculoDetalhes />} />
          <Route path="interesse/:id" element={<Interesse />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;