import React, { useState } from 'react';
import axios from 'axios';
import './Clientes.css';

const API_URL = 'https://dellasa-ai-sistema.onrender.com/api';

const CadastroClienteFiel = ({ onClienteCadastrado, onClose }) => {
  const [formData, setFormData] = useState({
    nome: '',
    telefone: '',
    limite_credito: 200.00,
    observacoes: ''
  });
  
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'limite_credito' ? parseFloat(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.nome.trim()) {
      setErro('Nome do cliente é obrigatório');
      return;
    }

    setCarregando(true);
    setErro('');

    try {
      const response = await axios.post(`${API_URL}/clientes-fieis/novo`, formData);
      
      // Sucesso
      if (onClienteCadastrado) {
        onClienteCadastrado(response.data.cliente);
      }
      
      // Fecha o modal
      if (onClose) {
        onClose();
      }
      
      // Reset do formulário
      setFormData({
        nome: '',
        telefone: '',
        limite_credito: 200.00,
        observacoes: ''
      });
      
      alert('✅ Cliente cadastrado com sucesso!');
      
    } catch (error) {
      console.error('Erro ao cadastrar cliente:', error);
      setErro(error.response?.data?.erro || 'Erro ao cadastrar cliente');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3><i className="fas fa-user-plus"></i> Cadastrar Cliente Fiel</h3>
          <button onClick={onClose} className="btn-fechar">
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label><i className="fas fa-user"></i> Nome Completo *</label>
            <input
              type="text"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              placeholder="Ex: João Silva"
              required
            />
          </div>
          
          <div className="form-group">
            <label><i className="fas fa-phone"></i> Telefone/WhatsApp</label>
            <input
              type="text"
              name="telefone"
              value={formData.telefone}
              onChange={handleChange}
              placeholder="(11) 99999-9999"
            />
            <small className="texto-suave">Para contato e lembretes</small>
          </div>
          
          <div className="form-group">
            <label><i className="fas fa-credit-card"></i> Limite de Crédito (R$)</label>
            <input
              type="number"
              name="limite_credito"
              step="0.01"
              min="0"
              value={formData.limite_credito}
              onChange={handleChange}
              placeholder="200.00"
            />
            <small className="texto-suave">Valor máximo que o cliente pode ficar devendo</small>
          </div>
          
          <div className="form-group">
            <label><i className="fas fa-sticky-note"></i> Observações</label>
            <textarea
              name="observacoes"
              value={formData.observacoes}
              onChange={handleChange}
              placeholder="Endereço, preferências, restrições alimentares..."
              rows="3"
            />
          </div>
          
          {erro && (
            <div className="mensagem-erro">
              <i className="fas fa-exclamation-circle"></i> {erro}
            </div>
          )}
          
          <div className="form-botoes">
            <button 
              type="button" 
              onClick={onClose}
              className="btn-cancelar"
              disabled={carregando}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="btn-salvar"
              disabled={carregando}
            >
              {carregando ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i> Cadastrando...
                </>
              ) : (
                <>
                  <i className="fas fa-check"></i> Cadastrar Cliente
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CadastroClienteFiel;
