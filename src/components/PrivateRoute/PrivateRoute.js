import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import api from "../../services/api";

const PrivateRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [loading, setLoading] = useState(true);
  const adminToken = localStorage.getItem("adminToken");

  useEffect(() => {
    const verifyToken = async () => {
      if (!adminToken) {
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      try {
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Token inválido:", error);
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminData");
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, [adminToken]);

  if (loading) {
    return <div className="loading-auth">Verificando autenticação...</div>;
  }

  return isAuthenticated ? children : <Navigate to="/admin/login" replace />;
};

export default PrivateRoute;
