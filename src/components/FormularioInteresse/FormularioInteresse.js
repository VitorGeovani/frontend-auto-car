import React, { useState, useEffect } from "react";
import { Form, Button, Alert, Card } from "react-bootstrap";
import {
  FaWhatsapp,
  FaCheckCircle,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaCommentAlt,
  FaPaperPlane,
  FaExclamationTriangle,
  FaLock,
} from "react-icons/fa";
import { enviarInteresse } from "../../services/interesseService";
import "./FormularioInteresse.scss";

const FormularioInteresse = ({ veiculo }) => {
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    mensagem: `Olá, estou interessado(a) no veículo ${veiculo.marca} ${veiculo.modelo} (${veiculo.ano}). Por favor, entre em contato comigo.`,
  });

  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState(null);
  const [usuarioLogado, setUsuarioLogado] = useState(false);

  // Efeito para preencher automaticamente os dados do usuário logado
  useEffect(() => {
    try {
      const userDataString = localStorage.getItem("userData");
      if (userDataString) {
        const userData = JSON.parse(userDataString);

        // Verifica se temos os dados do usuário e preenche o formulário
        if (userData) {
          setFormData((prevData) => ({
            ...prevData,
            nome: userData.nome || prevData.nome,
            email: userData.email || prevData.email,
            telefone: userData.telefone || prevData.telefone,
          }));

          // Indica que encontramos um usuário logado para feedback visual
          setUsuarioLogado(true);
        }
      }
    } catch (error) {
      console.error("Erro ao carregar dados do usuário:", error);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEnviando(true);
    setErro(null);

    try {
      await enviarInteresse({
        nome: formData.nome,
        email: formData.email,
        telefone: formData.telefone,
        mensagem: formData.mensagem,
        carroId: veiculo.id,
      });

      setEnviado(true);
      // Reset form
      setFormData({
        nome: "",
        email: "",
        telefone: "",
        mensagem: `Olá, estou interessado(a) no veículo ${veiculo.marca} ${veiculo.modelo} (${veiculo.ano}). Por favor, entre em contato comigo.`,
      });
    } catch (error) {
      console.error("Erro ao enviar formulário de interesse:", error);
      setErro(
        "Ocorreu um erro ao enviar sua mensagem. Por favor, tente novamente."
      );
    } finally {
      setEnviando(false);
    }
  };

  const handleWhatsApp = () => {
    const message = encodeURIComponent(
      `Olá, estou interessado(a) no veículo ${veiculo.marca} ${veiculo.modelo} (${veiculo.ano}) anunciado no site da AutoCar.`
    );
    const whatsappNumber = "5511967696744";
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, "_blank");
  };

  if (enviado) {
    return (
      <Card className="interesse-card success-card">
        <Card.Body className="texto-confirmacao">
          <FaCheckCircle className="confirmacao-icon" />
          <h3>Mensagem enviada!</h3>
          <p>
            Recebemos seu interesse no veículo. Nossa equipe entrará em contato
            em breve!
          </p>
          <Button
            variant="success"
            className="btn-sm w-100 mt-2"
            onClick={() => setEnviado(false)}
          >
            <FaPaperPlane className="me-1" /> Enviar nova mensagem
          </Button>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="interesse-card">
      <Card.Header>
        <h3>
          <FaPaperPlane className="me-2" /> Tenho interesse neste veículo
          {usuarioLogado && (
            <span className="ms-2 badge bg-success">
              <FaLock className="me-1" /> Conta conectada
            </span>
          )}
        </h3>
      </Card.Header>
      <Card.Body>
        {erro && (
          <Alert variant="danger" className="alert-compact">
            <FaExclamationTriangle className="me-2" /> {erro}
          </Alert>
        )}

        {usuarioLogado && (
          <Alert variant="info" className="alert-compact">
            <FaUser className="me-2" /> Seus dados foram preenchidos
            automaticamente!
          </Alert>
        )}

        <Form onSubmit={handleSubmit} className="form-compact">
          <Form.Group className="form-group">
            <Form.Label>
              <FaUser className="icon-label" /> Nome*
            </Form.Label>
            <Form.Control
              type="text"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              required
              placeholder="Seu nome completo"
            />
          </Form.Group>

          <Form.Group className="form-group">
            <Form.Label>
              <FaEnvelope className="icon-label" /> E-mail*
            </Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="seu.email@exemplo.com"
            />
          </Form.Group>

          <Form.Group className="form-group">
            <Form.Label>
              <FaPhone className="icon-label" /> Telefone*
            </Form.Label>
            <Form.Control
              type="tel"
              name="telefone"
              value={formData.telefone}
              onChange={handleChange}
              required
              placeholder="(11) 99999-9999"
            />
          </Form.Group>

          <Form.Group className="form-group">
            <Form.Label>
              <FaCommentAlt className="icon-label" /> Mensagem
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={6}
              name="mensagem"
              value={formData.mensagem}
              onChange={handleChange}
              placeholder="Digite sua mensagem..."
            />
          </Form.Group>

          <div className="btn-actions">
            <Button type="submit" className="btn-enviar" disabled={enviando}>
              {enviando ? (
                <>Enviando...</>
              ) : (
                <>
                  <FaPaperPlane className="me-1" /> Enviar mensagem
                </>
              )}
            </Button>

            <Button
              variant="success"
              className="whatsapp-btn"
              onClick={handleWhatsApp}
            >
              <FaWhatsapp /> Contato via WhatsApp
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default FormularioInteresse;
