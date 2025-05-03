import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { 
  FaChartBar, 
  FaCarAlt, 
  FaUsers, 
  FaComments, 
  FaBars, 
  FaSignOutAlt, 
  FaTimes,
  FaBell  // Importando o ícone de sino para interesses
} from 'react-icons/fa';
import './AdminLayout.scss';

const AdminLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className={`admin-layout ${sidebarCollapsed ? 'collapsed' : ''}`}>
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1>Auto Car Admin</h1>
          <button className="toggle-btn" onClick={toggleSidebar}>
            {sidebarCollapsed ? <FaBars /> : <FaTimes />}
          </button>
        </div>
        
        <nav className="sidebar-nav">
          <ul>
            <li>
              <NavLink to="/admin" end className="nav-item">
                <FaChartBar /> <span>Dashboard</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/estoque" className="nav-item">
                <FaCarAlt /> <span>Estoque</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/usuarios" className="nav-item">
                <FaUsers /> <span>Usuários</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/depoimentos" className="nav-item">
                <FaComments /> <span>Depoimentos</span>
              </NavLink>
            </li>
            {/* Novo item de menu para Interesses */}
            <li>
              <NavLink to="/admin/interesses" className="nav-item">
                <FaBell /> <span>Interesses</span>
              </NavLink>
            </li>
          </ul>
        </nav>
        
        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <FaSignOutAlt /> <span>Sair</span>
          </button>
        </div>
      </aside>
      
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;