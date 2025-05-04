import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  FaChartBar, 
  FaCarAlt, 
  FaUsers, 
  FaComments, 
  FaBars, 
  FaSignOutAlt, 
  FaTimes,
  FaBell,
  FaUserCircle,
  FaCar
} from 'react-icons/fa';
import './AdminLayout.scss';

const AdminLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(window.innerWidth < 768);
  const [mobileView, setMobileView] = useState(window.innerWidth < 768);
  const [adminName, setAdminName] = useState('Admin');
  const navigate = useNavigate();
  const location = useLocation();

  // Efeito para verificar o tamanho da tela e ajustar o estado do sidebar
  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 768;
      setMobileView(isMobile);
      // No mobile, colapsar o sidebar por padrão
      if (isMobile && !sidebarCollapsed) {
        setSidebarCollapsed(true);
      }
    };

    // Obter nome do administrador do localStorage, se disponível
    const adminData = localStorage.getItem('adminData');
    if (adminData) {
      try {
        const data = JSON.parse(adminData);
        if (data && data.nome) {
          setAdminName(data.nome.split(' ')[0]); // Pegar apenas primeiro nome
        }
      } catch (error) {
        console.error('Erro ao processar dados do administrador:', error);
      }
    }

    // Adicionar listener para redimensionamento
    window.addEventListener('resize', handleResize);
    handleResize(); // Verificar tamanho inicial

    return () => window.removeEventListener('resize', handleResize);
  }, [sidebarCollapsed]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    navigate('/admin/login');
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Fechar sidebar ao clicar fora (apenas em dispositivos móveis)
  const handleOverlayClick = () => {
    if (mobileView && !sidebarCollapsed) {
      setSidebarCollapsed(true);
    }
  };

  return (
    <div className={`admin-layout ${sidebarCollapsed ? 'collapsed' : ''}`}>
      {/* Overlay para dispositivos móveis */}
      {mobileView && !sidebarCollapsed && (
        <div className="sidebar-overlay" onClick={handleOverlayClick}></div>
      )}
      
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo-container">
            <span className="logo">AC</span>
            {!sidebarCollapsed && <h1>Auto Car</h1>}
          </div>
          <button className="toggle-btn" onClick={toggleSidebar}>
            {sidebarCollapsed ? <FaBars /> : <FaTimes />}
          </button>
        </div>
        
        {!sidebarCollapsed && (
          <div className="admin-profile">
            <div className="profile-icon">
              <FaUserCircle />
            </div>
            <div className="profile-info">
              <p className="admin-name">{adminName}</p>
              <p className="admin-role">Administrador</p>
            </div>
          </div>
        )}
        
        <nav className="sidebar-nav">
          <ul>
            <li>
              <NavLink to="/admin" end className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
                <div className="icon-container">
                  <FaChartBar className="icon" />
                </div>
                {!sidebarCollapsed && <span>Dashboard</span>}
                {!sidebarCollapsed && location.pathname === '/admin' && <span className="active-indicator"></span>}
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/estoque" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
                <div className="icon-container">
                  <FaCarAlt className="icon" />
                </div>
                {!sidebarCollapsed && <span>Estoque</span>}
                {!sidebarCollapsed && location.pathname.includes('/admin/estoque') && <span className="active-indicator"></span>}
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/usuarios" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
                <div className="icon-container">
                  <FaUsers className="icon" />
                </div>
                {!sidebarCollapsed && <span>Usuários</span>}
                {!sidebarCollapsed && location.pathname.includes('/admin/usuarios') && <span className="active-indicator"></span>}
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/depoimentos" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
                <div className="icon-container">
                  <FaComments className="icon" />
                </div>
                {!sidebarCollapsed && <span>Depoimentos</span>}
                {!sidebarCollapsed && location.pathname.includes('/admin/depoimentos') && <span className="active-indicator"></span>}
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/interesses" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
                <div className="icon-container">
                  <FaBell className="icon" />
                </div>
                {!sidebarCollapsed && <span>Interesses</span>}
                {!sidebarCollapsed && location.pathname.includes('/admin/interesses') && <span className="active-indicator"></span>}
              </NavLink>
            </li>
          </ul>
        </nav>
        
        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <div className="icon-container">
              <FaSignOutAlt className="icon" />
            </div>
            {!sidebarCollapsed && <span>Sair</span>}
          </button>
        </div>
      </aside>
      
      <main className="content">
        <header className="content-header">
          <div className="mobile-header">
            {mobileView && (
              <button className="mobile-menu-btn" onClick={toggleSidebar}>
                <FaBars />
              </button>
            )}
            <h2 className="page-title">
              {location.pathname === '/admin' && 'Dashboard'}
              {location.pathname.includes('/admin/estoque') && 'Gestão de Estoque'}
              {location.pathname.includes('/admin/usuarios') && 'Gestão de Usuários'}
              {location.pathname.includes('/admin/depoimentos') && 'Gestão de Depoimentos'}
              {location.pathname.includes('/admin/interesses') && 'Interesses de Clientes'}
            </h2>
          </div>
        </header>
        <div className="content-wrapper">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;