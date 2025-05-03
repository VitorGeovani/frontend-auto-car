import React from "react";
import "./Testimonials.scss";
import { FaQuoteLeft } from "react-icons/fa";

const testimonials = [
  {
    nome: "Ana Clara",
    depoimento:
      "Fui muito bem atendida na Auto Car. Encontrei o carro perfeito para minha família e com ótimo custo-benefício!",
    cidade: "Jd. Ângela - SP",
  },
  {
    nome: "Carlos Eduardo",
    depoimento:
      "Ótima experiência! A equipe foi super prestativa e me ajudou em todo o processo de financiamento.",
    cidade: "Capão Redondo - SP",
  },
  {
    nome: "Juliana Rocha",
    depoimento:
      "Comprei meu primeiro carro com ele e só tenho elogios. Recomendo de olhos fechados!",
    cidade: "Campo Limpo - SP",
  },
];

const Testimonials = () => {
  return (
    <section className="testimonials" id="testimonials">
      <div className="testimonials-container">
        <h2>Depoimentos de Clientes</h2>
        <p>Veja o que nossos clientes dizem sobre sua experiência conosco</p>
        <div className="testimonials-grid">
          {testimonials.map((item, index) => (
            <div className="testimonial-card" key={index}>
              <FaQuoteLeft className="quote-icon" />
              <p className="depoimento">"{item.depoimento}"</p>
              <h4>{item.nome}</h4>
              <span>{item.cidade}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
