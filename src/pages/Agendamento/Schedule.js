import React, { useState } from 'react';
import './Schedule.scss';
import axios from 'axios';

const Schedule = () => {
  const [data, setData] = useState({ nome: '', telefone: '', veiculoId: '', data: '' });

  const handleChange = e => setData({ ...data, [e.target.name]: e.target.value });
  const handleSubmit = e => {
    e.preventDefault();
    axios.post('/api/agendamentos', data).then(() => alert('Agendamento realizado!'));
  };

  return (
    <form className="schedule-form" onSubmit={handleSubmit}>
      <input name="nome" placeholder="Seu nome" onChange={handleChange} />
      <input name="telefone" placeholder="Telefone" onChange={handleChange} />
      <input name="veiculoId" placeholder="ID do veículo" onChange={handleChange} />
      <input name="data" type="datetime-local" onChange={handleChange} />
      <button type="submit">Agendar</button>
    </form>
  );
};

export default Schedule;