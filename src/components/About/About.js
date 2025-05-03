import React from 'react';
import './About.scss';
import aboutImage from '../../assets/images/about.gif';

const About = () => {
  return (
    <section className="about" id="about">
      <div className="about__content">
        <div className="about__text">
          <h4 className="tag">Sobre Nós</h4>
          <h2>Conectando você ao carro dos seus sonhos</h2>
          <p>
            Na <strong>Auto Car</strong>, temos o compromisso de oferecer veículos de qualidade e um atendimento excepcional. 
            Com anos de experiência no mercado, somos especializados em tornar a compra do seu próximo carro uma experiência 
            agradável e sem complicações.
          </p>
          <a href="#contact" className="btn">Ver Mais</a>
        </div>
        <div className="about__image">
          <img src={aboutImage} alt="Sobre a Auto Car" />
        </div>
      </div>
    </section>
  );
};

export default About;
