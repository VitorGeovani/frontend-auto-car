import React from 'react';
import './Services.scss';
import { FaCarSide, FaTools, FaHandshake } from 'react-icons/fa';

const Services = () => {
  return (
    <section className="services" id="services">
      <div className="services__container">
        <h4 className="tag">Nossos Serviços</h4>
        <h2>Facilitamos sua jornada automotiva</h2>
        <p className="subtitle">
          Oferecemos mais do que carros. Entregamos soluções completas para quem busca segurança e confiança na compra.
        </p>

        <div className="services__cards">
          <div className="service__card">
            <FaCarSide className="icon" />
            <h3>Venda de Veículos</h3>
            <p>
              Carros revisados, com procedência e garantia. Veículos para todos os estilos e necessidades.
            </p>
          </div>

          <div className="service__card">
            <FaTools className="icon" />
            <h3>Inspeção e Revisão</h3>
            <p>
              Realizamos uma análise minuciosa em cada veículo para garantir total segurança aos nossos clientes.
            </p>
          </div>

          <div className="service__card">
            <FaHandshake className="icon" />
            <h3>Atendimento Personalizado</h3>
            <p>
              Suporte dedicado para te ajudar na escolha do carro ideal. Atendimento presencial e online.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;
