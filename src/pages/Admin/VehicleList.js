// 1. VehicleList.js
import React, { useEffect, useState } from 'react';
import './VehicleList.scss';
import axios from 'axios';

const VehicleList = () => {
  const [vehicles, setVehicles] = useState([]);

  useEffect(() => {
    axios.get('/api/vehicles')
      .then(res => setVehicles(res.data))
      .catch(err => console.error(err));
  }, []);

  const handleDelete = (id) => {
    axios.delete(`/api/vehicles/${id}`)
      .then(() => setVehicles(vehicles.filter(v => v.id !== id)));
  };

  return (
    <div className="vehicle-list">
      <h2>Lista de Veículos</h2>
      {vehicles.map(vehicle => (
        <div key={vehicle.id} className="vehicle-item">
          <img src={vehicle.image} alt={vehicle.modelo} />
          <p>{vehicle.modelo} - {vehicle.marca}</p>
          <button onClick={() => handleDelete(vehicle.id)}>Excluir</button>
        </div>
      ))}
    </div>
  );
};

export default VehicleList;