import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import GerenciarClientes from './components/GerenciarClientes';

// URL da API - ATUALIZE COM SEU BACKEND DO RENDER
const API_URL = 'https://dellasa-ai-sistema.onrender.com/api';
const [mostrarModalClientes, setMostrarModalClientes] = useState(false);
const [mostrarCadastroCliente, setMostrarCadastroCliente] = useState(false);
const [mostrarGerenciarClientes, setMostrarGerenciarClientes] = useState(false);

// ==========================================
// COMPONENTE: Card de Pedido
// ==========================================
const PedidoCard = ({ pedido, onStatusChange, onVerFicha }) => {
  const getStatusColor = (status) => {
    const colors = {
      'novo': '#FF6B6B',
      'producao': '#FFD166', 
      'pronto': '#06D6A0',
      'entregue': '#118AB2',
      'cancelado': '#6C757D'
    };
    return colors[status] || '#999';
  };

  const getStatusText = (status) => {
    const textos = {
      'novo': 'NOVO',
      'producao': 'EM PRODUÇÃO',
      'pronto': 'PRONTO',
      'entregue': 'ENTREGUE',
      'cancelado': 'CANCELADO'
    };
    return textos[status] || status.toUpperCase();
  };

  const getPagamentoIcon = (forma) => {
    const icons = {
      'dinheiro': '💵',
      'pix': '🏦',
      'cartao_debito': '💳',
      'cartao_credito': '💳',
      'alelo_vr': '🎫',
      'a_prazo': '📝'
    };
    return icons[forma] || '💰';
  };

  const getPagamentoText = (forma) => {
    const textos = {
      'dinheiro': 'Dinheiro',
      'pix': 'PIX',
      'cartao_debito': 'Cartão Débito',
      'cartao_credito': 'Cartão Crédito (30 dias)',
      'alelo_vr': 'Alelo/VR (Próximo mês)',
      'a_prazo': 'A Prazo'
    };
    return textos[forma] || forma;
  };

  const formatarData = (dataString) => {
    try {
      const data = new Date(dataString);
      return data.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit'
      });
    } catch {
      return '--:--';
    }
  };

  return (
    <div className="pedido-card" style={{ borderLeft: `5px solid ${getStatusColor(pedido.status)}` }}>
      {/* Cabeçalho do Pedido */}
      <div className="pedido-header">
        <div className="pedido-numero">
          <i className="fas fa-hashtag"></i> {pedido.numero_pedido}
          <span className="pedido-pagamento-icon">
            {getPagamentoIcon(pedido.forma_pagamento)}
          </span>
        </div>
        <div className="pedido-status" style={{ backgroundColor: getStatusColor(pedido.status) }}>
          {getStatusText(pedido.status)}
        </div>
      </div>
      
      {/* Cliente */}
      <div className="pedido-cliente">
        <i className="fas fa-user"></i> {pedido.cliente_nome}
        {pedido.cliente_telefone && (
          <span className="pedido-telefone">
            <i className="fas fa-phone"></i> {pedido.cliente_telefone}
          </span>
        )}
        {pedido.forma_pagamento === 'a_prazo' && pedido.cliente_fiel_id && (
          <button 
            onClick={() => onVerFicha(pedido.cliente_fiel_id)}
            className="btn-ficha"
          >
            <i className="fas fa-address-card"></i> Ver Ficha
          </button>
        )}
      </div>
      
      {/* Itens */}
      <div className="pedido-itens">
        <strong>Itens:</strong>
        <ul>
          {pedido.itens && pedido.itens.map((item, index) => (
            <li key={index}>
              {item.nome} 
              <span className="item-preco">R$ {parseFloat(item.preco || 0).toFixed(2)}</span>
            </li>
          ))}
        </ul>
      </div>
      
      {/* Rodapé */}
      <div className="pedido-footer">
        <div className="pedido-valor">
          <i className="fas fa-money-bill-wave"></i> R$ {parseFloat(pedido.valor_total || 0).toFixed(2)}
        </div>
        <div className="pedido-pagamento">
          {getPagamentoIcon(pedido.forma_pagamento)} {getPagamentoText(pedido.forma_pagamento)}
        </div>
        <div className="pedido-horario">
          <i className="fas fa-clock"></i> {formatarData(pedido.data_criacao)}
        </div>
      </div>
      
      {/* Ações */}
      <div className="pedido-acoes">
        {pedido.status === 'novo' && (
          <button onClick={() => onStatusChange(pedido.id, 'producao')} className="btn-producao">
            <i className="fas fa-play"></i> Produzir
          </button>
        )}
        
        {pedido.status === 'producao' && (
          <button onClick={() => onStatusChange(pedido.id, 'pronto')} className="btn-pronto">
            <i className="fas fa-check"></i> Pronto
          </button>
        )}
        
        {pedido.status === 'pronto' && (
          <button onClick={() => onStatusChange(pedido.id, 'entregue')} className="btn-entregue">
            <i className="fas fa-truck"></i> Entregue
          </button>
        )}
        
        {(pedido.status === 'novo' || pedido.status === 'producao') && (
          <button onClick={() => onStatusChange(pedido.id, 'cancelado')} className="btn-cancelar">
            <i className="fas fa-times"></i> Cancelar
          </button>
        )}
      </div>
      
      {/* Observações */}
      {pedido.observacoes && (
        <div className="pedido-observacoes">
          <i className="fas fa-sticky-note"></i> {pedido.observacoes}
        </div>
      )}
      
      {/* Endereço de Entrega */}
      {pedido.endereco_entrega && (
        <div className="pedido-endereco">
          <i className="fas fa-map-marker-alt"></i> {pedido.endereco_entrega}
        </div>
      )}
    </div>
  );
};

// ==========================================
// COMPONENTE: Aba de Pedidos
// ==========================================
const Aba = ({ titulo, status, pedidos, onStatusChange, onVerFicha, icone, cor }) => {
  const pedidosFiltrados = pedidos.filter(p => p.status === status);
  
  return (
    <div className="aba">
      <div className="aba-header" style={{ backgroundColor: cor }}>
        <i className={icone}></i>
        <h3>{titulo}</h3>
        <span className="contador">{pedidosFiltrados.length}</span>
      </div>
      
      <div className="aba-conteudo">
        {pedidosFiltrados.length === 0 ? (
          <div className="sem-pedidos">
            <i className="fas fa-clipboard-list"></i>
            <p>Nenhum pedido</p>
          </div>
        ) : (
          pedidosFiltrados.map(pedido => (
            <PedidoCard 
              key={pedido.id} 
              pedido={pedido} 
              onStatusChange={onStatusChange}
              onVerFicha={onVerFicha}
            />
          ))
        )}
      </div>
    </div>
  );
};

// ==========================================
// COMPONENTE: Modal de Ficha do Cliente
// ==========================================
const ModalFichaCliente = ({ cliente, onClose, onPagar }) => {
  const [mostrarFormPagamento, setMostrarFormPagamento] = useState(false);
  const [valorPagamento, setValorPagamento] = useState('');
  const [formaPagamento, setFormaPagamento] = useState('dinheiro');
  
  if (!cliente) return null;
  
  const handlePagar = () => {
    if (!valorPagamento || parseFloat(valorPagamento) <= 0) {
      alert('Digite um valor válido para o pagamento');
      return;
    }
    
    if (parseFloat(valorPagamento) > cliente.saldo_atual) {
      alert(`O valor (R$ ${valorPagamento}) é maior que o saldo devido (R$ ${cliente.saldo_atual})`);
      return;
    }
    
    onPagar(cliente.id, parseFloat(valorPagamento), formaPagamento);
    setMostrarFormPagamento(false);
    setValorPagamento('');
  };
  
  return (
    <div className="modal-overlay">
      <div className="modal-ficha">
        <div className="modal-header">
          <h3><i className="fas fa-address-card"></i> Ficha do Cliente</h3>
          <button onClick={onClose} className="btn-fechar">
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <div className="ficha-conteudo">
          <div className="ficha-info">
            <h4>{cliente.nome}</h4>
            {cliente.telefone && <p><i className="fas fa-phone"></i> {cliente.telefone}</p>}
            <p><i className="fas fa-calendar-alt"></i> Cadastrado em: {new Date(cliente.data_cadastro).toLocaleDateString('pt-BR')}</p>
            
            {cliente.observacoes && (
              <p><i className="fas fa-sticky-note"></i> {cliente.observacoes}</p>
            )}
          </div>
          
          <div className="ficha-saldo">
            <div className={`saldo-valor ${cliente.saldo_atual > 0 ? 'saldo-negativo' : 'saldo-positivo'}`}>
              R$ {Math.abs(cliente.saldo_atual).toFixed(2)}
            </div>
            <div className="saldo-label">
              {cliente.saldo_atual > 0 ? 'VALOR DEVIDO' : 'SEM DÍVIDAS'}
            </div>
            
            <div className="ficha-limite">
              <small>Limite de crédito: R$ {cliente.limite_credito.toFixed(2)}</small>
            </div>
          </div>
          
          {cliente.saldo_atual > 0 && (
            <div className="ficha-acoes">
              {!mostrarFormPagamento ? (
                <button 
                  onClick={() => setMostrarFormPagamento(true)}
                  className="btn-pagar"
                >
                  <i className="fas fa-money-bill-wave"></i> Registrar Pagamento
                </button>
              ) : (
                <div className="form-pagamento">
                  <h5>Registrar Pagamento</h5>
                  <div className="form-group">
                    <label>Valor (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={valorPagamento}
                      onChange={(e) => setValorPagamento(e.target.value)}
                      placeholder={`Máximo: ${cliente.saldo_atual.toFixed(2)}`}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Forma de Pagamento</label>
                    <select 
                      value={formaPagamento}
                      onChange={(e) => setFormaPagamento(e.target.value)}
                    >
                      <option value="dinheiro">Dinheiro</option>
                      <option value="pix">PIX</option>
                      <option value="cartao_debito">Cartão Débito</option>
                    </select>
                  </div>
                  
                  <div className="form-botoes">
                    <button 
                      onClick={() => setMostrarFormPagamento(false)}
                      className="btn-cancelar"
                    >
                      Cancelar
                    </button>
                    <button onClick={handlePagar} className="btn-confirmar">
                      <i className="fas fa-check"></i> Confirmar Pagamento
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
          
          <div className="ficha-historico">
            <h5><i className="fas fa-history"></i> Histórico Recente</h5>
            <p className="texto-suave">(Em desenvolvimento - em breve)</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// COMPONENTE: Formulário de Novo Pedido
// ==========================================
const NovoPedidoForm = ({ onNovoPedido, clientesFieis }) => {
  const [mostrarForm, setMostrarForm] = useState(false);
  const [formData, setFormData] = useState({
    cliente_nome: '',
    cliente_telefone: '',
    itens: [{ nome: 'Açaí 500ml', preco: 20.00 }],
    valor_total: 20.00,
    forma_pagamento: 'dinheiro',
    cliente_fiel_id: '',
    observacoes: '',
    endereco_entrega: ''
  });
  const [mostrarClientes, setMostrarClientes] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Se selecionou um cliente fiel, preenche automaticamente
    if (name === 'cliente_fiel_id' && value) {
      const cliente = clientesFieis.find(c => c.id == value);
      if (cliente) {
        setFormData(prev => ({
          ...prev,
          cliente_nome: cliente.nome,
          cliente_telefone: cliente.telefone || '',
          forma_pagamento: 'a_prazo'
        }));
      }
    }
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
    
    // Validação para "A Prazo"
    if (formData.forma_pagamento === 'a_prazo' && !formData.cliente_fiel_id) {
      alert('Para pedidos "A Prazo", selecione um cliente fiel da lista');
      return;
    }

    try {
      await onNovoPedido(formData);
      
      // Reset do formulário
      setFormData({
        cliente_nome: '',
        cliente_telefone: '',
        itens: [{ nome: 'Açaí 500ml', preco: 20.00 }],
        valor_total: 20.00,
        forma_pagamento: 'dinheiro',
        cliente_fiel_id: '',
        observacoes: '',
        endereco_entrega: ''
      });
      
      setMostrarForm(false);
      alert('✅ Pedido criado com sucesso!');
    } catch (erro) {
      console.error('Erro ao criar pedido:', erro);
      alert('❌ Erro ao criar pedido. Verifique o console (F12) para detalhes.');
    }
  };

  return (
    <div className="novo-pedido-container">
      <button 
        onClick={() => setMostrarForm(true)}
        className="btn-novo-pedido"
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
              {/* Seção Cliente Fiel */}
              <div className="form-group">
                <label>
                  <i className="fas fa-star"></i> Cliente Fiel (opcional)
                  <button 
                    type="button"
                    onClick={() => setMostrarClientes(!mostrarClientes)}
                    className="btn-toggle-clientes"
                  >
                    {mostrarClientes ? 'Ocultar' : 'Mostrar'} lista
                  </button>
                </label>
                
                {mostrarClientes && clientesFieis.length > 0 ? (
                  <select 
                    name="cliente_fiel_id"
                    value={formData.cliente_fiel_id}
                    onChange={handleInputChange}
                    className="select-clientes"
                  >
                    <option value="">-- Selecione um cliente fiel --</option>
                    {clientesFieis.map(cliente => (
                      <option key={cliente.id} value={cliente.id}>
                        {cliente.nome} {cliente.telefone ? `(${cliente.telefone})` : ''} 
                        {cliente.saldo_atual > 0 ? ` - Deve: R$ ${cliente.saldo_atual.toFixed(2)}` : ''}
                      </option>
                    ))}
                  </select>
                ) : mostrarClientes ? (
                  <p className="texto-suave">Nenhum cliente fiel cadastrado ainda.</p>
                ) : null}
              </div>
              
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
                />
              </div>
              
              <div className="form-group">
                <label><i className="fas fa-map-marker-alt"></i> Endereço (opcional)</label>
                <input
                  type="text"
                  name="endereco_entrega"
                  value={formData.endereco_entrega}
                  onChange={handleInputChange}
                  placeholder="Para entregas"
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
                    />
                    <input
                      type="number"
                      step="0.01"
                      value={item.preco}
                      onChange={(e) => handleItemChange(index, 'preco', parseFloat(e.target.value))}
                      placeholder="Preço"
                      className="item-preco"
                    />
                    {formData.itens.length > 1 && (
                      <button 
                        type="button" 
                        onClick={() => removerItem(index)}
                        className="btn-remover-item"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={adicionarItem} className="btn-add-item">
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
                >
                  <option value="dinheiro">💵 Dinheiro (Recebido hoje)</option>
                  <option value="pix">🏦 PIX (Recebido hoje)</option>
                  <option value="cartao_debito">💳 Cartão Débito (1-2 dias)</option>
                  <option value="cartao_credito">💳 Cartão Crédito (Recebe em 30 dias)</option>
                  <option value="alelo_vr">🎫 Alelo/VR/VA (Recebe próximo mês)</option>
                  <option value="a_prazo" disabled={!formData.cliente_fiel_id}>
                    📝 A Prazo (Cliente Fiel) {!formData.cliente_fiel_id && '(Selecione cliente acima)'}
                  </option>
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
                />
              </div>
              
              {/* Total */}
              <div className="form-total">
                <strong>TOTAL: R$ {formData.valor_total.toFixed(2)}</strong>
                {formData.forma_pagamento === 'a_prazo' && formData.cliente_fiel_id && (
                  <div className="aviso-prazo">
                    <i className="fas fa-exclamation-circle"></i> Este valor será adicionado à ficha do cliente.
                  </div>
                )}
              </div>
              
              {/* Botões */}
              <div className="form-botoes">
                <button 
                  type="button" 
                  onClick={() => setMostrarForm(false)}
                  className="btn-cancelar"
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-salvar">
                  <i className="fas fa-check"></i> Salvar Pedido
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// COMPONENTE PRINCIPAL: App
// ==========================================
function App() {
  const [pedidos, setPedidos] = useState([]);
  const [clientesFieis, setClientesFieis] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [carregandoClientes, setCarregandoClientes] = useState(false);
  const [clienteFicha, setClienteFicha] = useState(null);
  const [mostrarModalFicha, setMostrarModalFicha] = useState(false);

  // ==========================================
  // FUNÇÃO: Carregar Pedidos
  // ==========================================
  const carregarPedidos = async () => {
    try {
      setCarregando(true);
      console.log('🔍 Buscando pedidos da API:', `${API_URL}/pedidos`);
      
      const response = await axios.get(`${API_URL}/pedidos`);
      console.log('✅ Resposta da API recebida:', response.data);
      
      // Proteção: Garante que os dados sejam um ARRAY
      let dadosRecebidos = response.data;
      
      if (!Array.isArray(dadosRecebidos)) {
        console.error('⚠️ ERRO: API não retornou um array. Dados recebidos:', dadosRecebidos);
        dadosRecebidos = [];
      }
      
      // Processa os pedidos
      const pedidosProcessados = dadosRecebidos.map(pedido => {
        const pedidoProcessado = { ...pedido };
        
        try {
          if (pedidoProcessado.itens && typeof pedidoProcessado.itens === 'string') {
            pedidoProcessado.itens = JSON.parse(pedidoProcessado.itens);
          }
          if (!pedidoProcessado.itens || !Array.isArray(pedidoProcessado.itens)) {
            pedidoProcessado.itens = [];
          }
        } catch (erroParse) {
          console.warn(`⚠️ Erro ao processar itens do pedido ${pedidoProcessado.id}:`, erroParse);
          pedidoProcessado.itens = [];
        }
        
        return pedidoProcessado;
      });
      
      console.log(`📦 ${pedidosProcessados.length} pedidos processados com sucesso`);
      setPedidos(pedidosProcessados);
      
    } catch (erro) {
      console.error('❌ Erro ao carregar pedidos:', erro);
      console.error('Detalhes do erro:', erro.response?.data || erro.message);
      
      setPedidos([]);
      alert('Não foi possível carregar os pedidos. O sistema continuará funcionando.');
    } finally {
      setCarregando(false);
    }
  };

  // ==========================================
  // FUNÇÃO: Carregar Clientes Fiéis
  // ==========================================
  const carregarClientesFieis = async () => {
    try {
      setCarregandoClientes(true);
      const response = await axios.get(`${API_URL}/clientes-fieis`);
      
      if (Array.isArray(response.data)) {
        setClientesFieis(response.data);
        console.log(`👥 ${response.data.length} clientes fiéis carregados`);
      } else {
        setClientesFieis([]);
      }
    } catch (erro) {
      console.error('Erro ao carregar clientes fiéis:', erro);
      setClientesFieis([]);
    } finally {
      setCarregandoClientes(false);
    }
  };

  // ==========================================
  // FUNÇÃO: Mudar Status do Pedido
  // ==========================================
  const mudarStatusPedido = async (id, novoStatus) => {
    try {
      await axios.put(`${API_URL}/pedidos/${id}/status`, { status: novoStatus });
      carregarPedidos(); // Recarrega a lista
      alert(`✅ Status atualizado para: ${novoStatus}`);
    } catch (erro) {
      console.error('Erro ao mudar status:', erro);
      alert('❌ Erro ao atualizar pedido');
    }
  };

  // ==========================================
  // FUNÇÃO: Criar Novo Pedido
  // ==========================================
  const criarNovoPedido = async (dadosPedido) => {
    try {
      console.log('📤 Enviando novo pedido:', dadosPedido);
      const response = await axios.post(`${API_URL}/pedidos/novo`, dadosPedido);
      
      // Recarrega tudo
      carregarPedidos();
      carregarClientesFieis();
      
      return response.data;
    } catch (erro) {
      console.error('❌ Erro ao criar pedido:', erro.response?.data || erro.message);
      throw erro;
    }
  };

  // ==========================================
  // FUNÇÃO: Ver Ficha do Cliente
  // ==========================================
  const verFichaCliente = async (clienteId) => {
    try {
      const response = await axios.get(`${API_URL}/clientes-fieis/${clienteId}`);
      setClienteFicha(response.data);
      setMostrarModalFicha(true);
    } catch (erro) {
      console.error('Erro ao carregar ficha:', erro);
      alert('Não foi possível carregar a ficha do cliente.');
    }
  };

  // ==========================================
  // FUNÇÃO: Registrar Pagamento
  // ==========================================
  const registrarPagamento = async (clienteId, valor, formaPagamento) => {
    try {
      await axios.post(`${API_URL}/clientes-fieis/${clienteId}/pagar`, {
        valor: valor,
        forma_pagamento: formaPagamento
      });
      
      alert(`✅ Pagamento de R$ ${valor.toFixed(2)} registrado com sucesso!`);
      
      // Atualiza as listas
      carregarClientesFieis();
      if (clienteFicha?.id === clienteId) {
        verFichaCliente(clienteId); // Recarrega a ficha atual
      }
      
    } catch (erro) {
      console.error('Erro ao registrar pagamento:', erro);
      alert('❌ Erro ao registrar pagamento');
    }
  };

  // ==========================================
  // EFEITOS (useEffect)
  // ==========================================
  useEffect(() => {
    carregarPedidos();
    carregarClientesFieis();
    
    // Atualiza a cada 30 segundos
    const intervalo = setInterval(() => {
      carregarPedidos();
    }, 30000);
    
    return () => clearInterval(intervalo);
  }, []);

  // ==========================================
  // CÁLCULOS PARA O RESUMO
  // ==========================================
  // Pedidos de hoje
  const pedidosHoje = pedidos.filter(p => {
    try {
      const hoje = new Date().toDateString();
      const dataPedido = new Date(p.data_criacao).toDateString();
      return hoje === dataPedido;
    } catch {
      return false;
    }
  });

  // Cálculos financeiros
  const totalHoje = pedidosHoje.reduce((soma, p) => soma + parseFloat(p.valor_total || 0), 0);
  const entreguesHoje = pedidosHoje.filter(p => p.status === 'entregue').length;
  
  // Por forma de pagamento
  const caixaHoje = pedidosHoje
    .filter(p => ['dinheiro', 'pix', 'cartao_debito'].includes(p.forma_pagamento))
    .reduce((soma, p) => soma + parseFloat(p.valor_total || 0), 0);
  
  const aReceber30Dias = pedidosHoje
    .filter(p => ['cartao_credito', 'alelo_vr'].includes(p.forma_pagamento))
    .reduce((soma, p) => soma + parseFloat(p.valor_total || 0), 0);
  
  const aPrazoHoje = pedidosHoje
    .filter(p => p.forma_pagamento === 'a_prazo')
    .reduce((soma, p) => soma + parseFloat(p.valor_total || 0), 0);

  // ==========================================
  // RENDERIZAÇÃO PRINCIPAL
  // ==========================================
  return (
    <div className="App">
      {/* Cabeçalho */}
      <header className="app-header">
        <div className="header-content">
          <h1><i className="fas fa-blender acai-icon"></i> Sistema de Pedidos - Açaí</h1>
          <p>Gestão completa de pedidos e financeiro</p>
        </div>
        
        <div className="header-stats">
          <div className="stat-item">
            <div className="stat-value">{pedidosHoje.length}</div>
            <div className="stat-label">Pedidos Hoje</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">R$ {totalHoje.toFixed(2)}</div>
            <div className="stat-label">Valor Total</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{entreguesHoje}</div>
            <div className="stat-label">Entregues</div>
          </div>
          <div className="stat-item stat-clientes">
            <div className="stat-value">{clientesFieis.length}</div>
            <div className="stat-label">Clientes Fiéis</div>
          </div>
          <div className="header-actions">
  <button 
    onClick={() => setMostrarModalClientes(true)}
    className="btn-gerenciar-clientes"
  >
    <i className="fas fa-users"></i> Gerenciar Clientes
  </button>
</div>
        </div>
      <div className="header-actions">
  <button 
    onClick={() => setMostrarGerenciarClientes(true)}
    className="btn-gerenciar-clientes"
  >
    <i className="fas fa-users"></i> Gerenciar Clientes
  </button>
</div>
      </header>

      <main className="app-main">
        {/* Botão Novo Pedido */}
        <NovoPedidoForm
      <div className="botoes-principais">
        <NovoPedidoForm 
        onNovoPedido={criarNovoPedido} 
        clientesFieis={clientesFieis}
  />
  
  <GerenciarClientesFieis 
    clientesFieis={clientesFieis}
    onAtualizarLista={carregarClientesFieis}
  />
</div>
          onNovoPedido={criarNovoPedido} 
          clientesFieis={clientesFieis}
        />

        {/* Seção de Abas */}
        <section className="abas-section">
          {carregando ? (
            <div className="carregando">
              <i className="fas fa-spinner fa-spin"></i> Carregando pedidos...
            </div>
          ) : (
            <div className="abas-container">
              <Aba 
                titulo="Novos Pedidos" 
                status="novo" 
                pedidos={pedidos}
                onStatusChange={mudarStatusPedido}
                onVerFicha={verFichaCliente}
                icone="fas fa-bell"
                cor="#FF6B6B"
              />
              
              <Aba 
                titulo="Em Produção" 
                status="producao" 
                pedidos={pedidos}
                onStatusChange={mudarStatusPedido}
                onVerFicha={verFichaCliente}
                icone="fas fa-blender"
                cor="#FFD166"
              />
              
              <Aba 
                titulo="Prontos" 
                status="pronto" 
                pedidos={pedidos}
                onStatusChange={mudarStatusPedido}
                onVerFicha={verFichaCliente}
                icone="fas fa-check-circle"
                cor="#06D6A0"
              />
              
              <Aba 
                titulo="Entregues" 
                status="entregue" 
                pedidos={pedidos}
                onStatusChange={mudarStatusPedido}
                onVerFicha={verFichaCliente}
                icone="fas fa-truck"
                cor="#118AB2"
              />
            </div>
          )}
        </section>

        {/* Resumo Financeiro */}
        <section className="resumo-section">
          <h3><i className="fas fa-chart-pie"></i> Resumo Financeiro do Dia</h3>
          <div className="resumo-grid">
            <div className="resumo-card">
              <div className="resumo-titulo">💵 Caixa Hoje</div>
              <div className="resumo-valor">R$ {caixaHoje.toFixed(2)}</div>
              <div className="resumo-desc">(Dinheiro, PIX, Débito)</div>
            </div>
            
            <div className="resumo-card">
              <div className="resumo-titulo">📅 A Receber (30 dias)</div>
              <div className="resumo-valor">R$ {aReceber30Dias.toFixed(2)}</div>
              <div className="resumo-desc">(Cartão Crédito, Alelo)</div>
            </div>
            
            <div className="resumo-card">
              <div className="resumo-titulo">📝 A Prazo</div>
              <div className="resumo-valor">R$ {aPrazoHoje.toFixed(2)}</div>
              <div className="resumo-desc">(Clientes Fiéis)</div>
            </div>
            
            <div className="resumo-card">
              <div className="resumo-titulo">👥 Total Devido</div>
              <div className="resumo-valor">
                R$ {clientesFieis.reduce((soma, c) => soma + (c.saldo_atual > 0 ? c.saldo_atual : 0), 0).toFixed(2)}
              </div>
              <div className="resumo-desc">Por todos clientes</div>
            </div>
          </div>
        </section>

        {/* Lista de Clientes Fiéis (resumo) */}
        {clientesFieis.length > 0 && (
          <section className="clientes-section">
            <h3><i className="fas fa-users"></i> Clientes Fiéis</h3>
            <div className="clientes-grid">
              {clientesFieis.slice(0, 5).map(cliente => (
                <div key={cliente.id} className="cliente-card">
                  <div className="cliente-nome">{cliente.nome}</div>
                  <div className={`cliente-saldo ${cliente.saldo_atual > 0 ? 'negativo' : 'positivo'}`}>
                    R$ {Math.abs(cliente.saldo_atual).toFixed(2)}
                  </div>
                  <button 
                    onClick={() => verFichaCliente(cliente.id)}
                    className="btn-ver-ficha"
                  >
                    Ver Ficha
                  </button>
                </div>
              ))}
              
              {clientesFieis.length > 5 && (
                <div className="cliente-card mais-clientes">
                  <div className="cliente-nome">+ {clientesFieis.length - 5} outros</div>
                  <div className="cliente-desc">Clientes cadastrados</div>
                </div>
              )}
            </div>
          </section>
        )}
      </main>

      {/* Modal da Ficha do Cliente */}
      {mostrarModalFicha && clienteFicha && (
        <ModalFichaCliente 
          cliente={clienteFicha}
          onClose={() => setMostrarModalFicha(false)}
          onPagar={registrarPagamento}
        />
      )}

      {/* Rodapé */}
      <footer className="app-footer">
        <p>Sistema Dellas Açaí | Backend: Render | Frontend: Vercel | {new Date().getFullYear()}</p>

        {mostrarGerenciarClientes && (
  <GerenciarClientes 
    onClose={() => setMostrarGerenciarClientes(false)}
    onClienteSelecionado={(cliente) => {
      // Preenche automaticamente no formulário de pedido
      setFormData?.({
        ...formData,
        cliente_fiel_id: cliente.id,
        cliente_nome: cliente.nome,
        cliente_telefone: cliente.telefone,
        forma_pagamento: 'a_prazo'
      });
    }}
  />
)}
      </footer>
    </div>
  );
}

export default App;
