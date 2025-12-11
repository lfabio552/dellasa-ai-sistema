// frontend/src/components/NovoPedidoForm.js
import React, { useState } from 'react';
import axios from 'axios';

const API_URL = 'https://dellasa-ai-sistema.onrender.com/api';

const NovoPedidoForm = ({ onNovoPedido }) => {
  const [mostrarForm, setMostrarForm] = useState(false);
  const [formData, setFormData] = useState({
    cliente_nome: '',
    cliente_telefone: '',
    itens: [{ nome: 'Açaí 500ml', preco: 20.00 }],
    valor_total: 20.00,
    forma_pagamento: 'dinheiro',
    observacoes: ''
  });
  const [carregando, setCarregando] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (index, field, value) => {
    const novosItens = [...formData.itens];
    novosItens[index] = { ...novosItens[index], [field]: value };
    
    const novoTotal = novosItens.reduce((soma, item) => soma + parseFloat(item.preco || 0), 0);
    
    setFormData(prev => ({ 
      ...prev, 
      itens: novosItens,
      valor_total: novoTotal
    }));
  };

  const adicionarItem = () => {
    setFormData(prev => ({
      ...prev,
      itens: [...prev.itens, { nome: '', preco: 0 }]
    }));
  };

  const removerItem = (index) => {
    if (formData.itens.length > 1) {
      const novosItens = formData.itens.filter((_, i) => i !== index);
      const novoTotal = novosItens.reduce((soma, item) => soma + parseFloat(item.preco || 0), 0);
      
      setFormData(prev => ({ 
        ...prev, 
        itens: novosItens,
        valor_total: novoTotal
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.cliente_nome.trim()) {
      alert('Digite o nome do cliente');
      return;
    }

    setCarregando(true);

    try {
      await onNovoPedido(formData);
      
      // Reset do formulário
      setFormData({
        cliente_nome: '',
        cliente_telefone: '',
        itens: [{ nome: 'Açaí 500ml', preco: 20.00 }],
        valor_total: 20.00,
        forma_pagamento: 'dinheiro',
        observacoes: ''
      });
      
      setMostrarForm(false);
      alert('✅ Pedido criado com sucesso!');
    } catch (erro) {
      console.error('Erro ao criar pedido:', erro);
      alert('❌ Erro ao criar pedido.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="novo-pedido-container">
      <button 
        onClick={() => setMostrarForm(true)}
        className="btn-novo-pedido"
        style={{
          background: 'linear-gradient(135deg, #8A2BE2, #4B0082)',
          color: 'white',
          border: 'none',
          padding: '18px 35px',
          fontSize: '1.2em',
          fontWeight: 'bold',
          borderRadius: '50px',
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '12px',
          boxShadow: '0 6px 20px rgba(138, 43, 226, 0.3)',
          transition: 'all 0.3s ease',
          marginBottom: '30px'
        }}
      >
        <i className="fas fa-plus"></i> NOVO PEDIDO
      </button>
      
      {mostrarForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3><i className="fas fa-shopping-cart"></i> Novo Pedido</h3>
              <button onClick={() => setMostrarForm(false)} className="btn-fechar">
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              {/* Dados do Cliente */}
              <div className="form-group">
                <label><i className="fas fa-user"></i> Nome do Cliente *</label>
                <input
                  type="text"
                  name="cliente_nome"
                  value={formData.cliente_nome}
                  onChange={handleInputChange}
                  required
                  placeholder="Ex: João Silva"
                  disabled={carregando}
                />
              </div>
              
              <div className="form-group">
                <label><i className="fas fa-phone"></i> Telefone (WhatsApp)</label>
                <input
                  type="text"
                  name="cliente_telefone"
                  value={formData.cliente_telefone}
                  onChange={handleInputChange}
                  placeholder="(11) 99999-9999"
                  disabled={carregando}
                />
              </div>
              
              {/* Itens do Pedido */}
              <div className="form-group">
                <label><i className="fas fa-utensils"></i> Itens do Pedido</label>
                {formData.itens.map((item, index) => (
                  <div key={index} className="item-row">
                    <input
                      type="text"
                      value={item.nome}
                      onChange={(e) => handleItemChange(index, 'nome', e.target.value)}
                      placeholder="Nome do item"
                      className="item-nome"
                      disabled={carregando}
                      style={{ flex: '3', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
                    />
                    <input
                      type="number"
                      step="0.01"
                      value={item.preco}
                      onChange={(e) => handleItemChange(index, 'preco', parseFloat(e.target.value))}
                      placeholder="Preço"
                      className="item-preco"
                      disabled={carregando}
                      style={{ flex: '1', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', margin: '0 10px' }}
                    />
                    {formData.itens.length > 1 && (
                      <button 
                        type="button" 
                        onClick={() => removerItem(index)}
                        className="btn-remover-item"
                        disabled={carregando}
                        style={{
                          background: '#ff6b6b',
                          color: 'white',
                          border: 'none',
                          borderRadius: '5px',
                          padding: '10px',
                          cursor: 'pointer'
                        }}
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    )}
                  </div>
                ))}
                <button 
                  type="button" 
                  onClick={adicionarItem} 
                  className="btn-add-item"
                  disabled={carregando}
                  style={{
                    background: '#4CAF50',
                    color: 'white',
                    border: 'none',
                    padding: '10px 15px',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    marginTop: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                >
                  <i className="fas fa-plus"></i> Adicionar Item
                </button>
              </div>
              
              {/* Forma de Pagamento */}
              <div className="form-group">
                <label><i className="fas fa-money-bill-wave"></i> Forma de Pagamento</label>
                <select 
                  name="forma_pagamento" 
                  value={formData.forma_pagamento}
                  onChange={handleInputChange}
                  disabled={carregando}
                >
                  <option value="dinheiro">💵 Dinheiro (Recebido hoje)</option>
                  <option value="pix">🏦 PIX (Recebido hoje)</option>
                  <option value="cartao_debito">💳 Cartão Débito (1-2 dias)</option>
                  <option value="cartao_credito">💳 Cartão Crédito (Recebe em 30 dias)</option>
                  <option value="alelo_vr">🎫 Alelo/VR/VA (Recebe próximo mês)</option>
                </select>
              </div>
              
              {/* Observações */}
              <div className="form-group">
                <label><i className="fas fa-sticky-note"></i> Observações</label>
                <textarea
                  name="observacoes"
                  value={formData.observacoes}
                  onChange={handleInputChange}
                  placeholder="Ex: Sem granola, com banana extra, para viagem..."
                  rows="3"
                  disabled={carregando}
                />
              </div>
              
              {/* Total */}
              <div className="form-total">
                <strong>TOTAL: R$ {formData.valor_total.toFixed(2)}</strong>
              </div>
              
              {/* Botões */}
              <div className="form-botoes">
                <button 
                  type="button" 
                  onClick={() => setMostrarForm(false)}
                  className="btn-cancelar"
                  disabled={carregando}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-salvar" disabled={carregando}>
                  {carregando ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i> Salvando...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-check"></i> Salvar Pedido
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NovoPedidoForm;
