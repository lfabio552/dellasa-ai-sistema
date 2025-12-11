import React, { useState } from 'react';
import axios from 'axios';

const API_URL = 'https://dellasa-ai-sistema.onrender.com/api';

const ModalCliente = ({ onClose, onClienteCadastrado }) => {
  const [formData, setFormData] = useState({
    nome: '',
    telefone: '',
    limite_credito: 200.00,
    observacoes: ''
  });
  
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

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
    setSucesso('');

    try {
      console.log('📤 Enviando dados:', formData);
      
      const response = await axios.post(`${API_URL}/clientes-fieis/novo`, formData);
      
      console.log('✅ Resposta da API:', response.data);
      
      setSucesso('Cliente cadastrado com sucesso!');
      
      if (onClienteCadastrado) {
        onClienteCadastrado(response.data.cliente);
      }
      
      // Limpa o formulário após 2 segundos
      setTimeout(() => {
        setFormData({
          nome: '',
          telefone: '',
          limite_credito: 200.00,
          observacoes: ''
        });
        setSucesso('');
        if (onClose) onClose();
      }, 2000);
      
    } catch (error) {
      console.error('❌ Erro completo:', error);
      console.error('❌ Resposta do erro:', error.response?.data);
      
      setErro(error.response?.data?.erro || 'Erro ao cadastrar cliente. Verifique o console (F12)');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: '500px' }}>
        <div className="modal-header">
          <h3><i className="fas fa-user-plus"></i> Cadastrar Cliente Fiel</h3>
          <button 
            onClick={onClose} 
            className="btn-fechar"
            disabled={carregando}
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="modal-conteudo" style={{ padding: '25px' }}>
            
            {erro && (
              <div className="mensagem-erro">
                <i className="fas fa-exclamation-triangle"></i> {erro}
              </div>
            )}
            
            {sucesso && (
              <div className="mensagem-sucesso">
                <i className="fas fa-check-circle"></i> {sucesso}
              </div>
            )}
            
            <div className="form-group">
              <label><i className="fas fa-user"></i> Nome Completo *</label>
              <input
                type="text"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                placeholder="Ex: João Silva"
                required
                disabled={carregando}
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
                disabled={carregando}
              />
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
                disabled={carregando}
              />
              <small style={{ color: '#666', fontSize: '0.85em' }}>
                Valor máximo que o cliente pode ficar devendo
              </small>
            </div>
            
            <div className="form-group">
              <label><i className="fas fa-sticky-note"></i> Observações</label>
              <textarea
                name="observacoes"
                value={formData.observacoes}
                onChange={handleChange}
                placeholder="Endereço, preferências, etc."
                rows="3"
                disabled={carregando}
              />
            </div>
          </div>
          
          <div className="modal-footer" style={{ 
            padding: '20px', 
            borderTop: '1px solid #eee',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px'
          }}>
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
                  <i className="fas fa-check"></i> Cadastrar
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalCliente;
