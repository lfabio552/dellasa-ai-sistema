import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

// URL da API
const API_URL = 'https://delasa-ai-sistema.onrender.com/api';

// Componente Card de Pedido
const PedidoCard = ({ pedido, onStatusChange }) => {
  const getStatusColor = (status) => {
    switch(status) {
      case 'novo': return '#FF6B6B';
      case 'producao': return '#FFD166';
      case 'pronto': return '#06D6A0';
      case 'entregue': return '#118AB2';
      default: return '#999';
    }
  };

  const formatarData = (dataString) => {
    const data = new Date(dataString);
    return data.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  return (
    <div className="pedido-card">
      <div className="pedido-header">
        <div className="pedido-numero">
          <i className="fas fa-hashtag"></i> {pedido.numero_pedido}
        </div>
        <div className="pedido-status" style={{ backgroundColor: getStatusColor(pedido.status) }}>
          {pedido.status.toUpperCase()}
        </div>
      </div>
      
      <div className="pedido-cliente">
        <i className="fas fa-user"></i> {pedido.cliente_nome}
        {pedido.cliente_telefone && (
          <span className="pedido-telefone">
            <i className="fas fa-phone"></i> {pedido.cliente_telefone}
          </span>
        )}
      </div>
      
      <div className="pedido-itens">
        <strong>Itens:</strong>
        <ul>
          {pedido.itens && pedido.itens.map((item, index) => (
            <li key={index}>
              {item.nome} 
              <span className="item-preco">R$ {parseFloat(item.preco).toFixed(2)}</span>
            </li>
          ))}
        </ul>
      </div>
      
      <div className="pedido-footer">
        <div className="pedido-valor">
          <i className="fas fa-money-bill-wave"></i> R$ {parseFloat(pedido.valor_total).toFixed(2)}
        </div>
        <div className="pedido-pagamento">
          <i className="fas fa-credit-card"></i> {pedido.forma_pagamento}
        </div>
        <div className="pedido-horario">
          <i className="fas fa-clock"></i> {formatarData(pedido.data_criacao)}
        </div>
      </div>
      
      <div className="pedido-acoes">
        {pedido.status === 'novo' && (
          <button 
            onClick={() => onStatusChange(pedido.id, 'producao')}
            className="btn-producao"
          >
            <i className="fas fa-play"></i> Produzir
          </button>
        )}
        
        {pedido.status === 'producao' && (
          <button 
            onClick={() => onStatusChange(pedido.id, 'pronto')}
            className="btn-pronto"
          >
            <i className="fas fa-check"></i> Pronto
          </button>
        )}
        
        {pedido.status === 'pronto' && (
          <button 
            onClick={() => onStatusChange(pedido.id, 'entregue')}
            className="btn-entregue"
          >
            <i className="fas fa-truck"></i> Entregue
          </button>
        )}
        
        {pedido.status !== 'entregue' && pedido.status !== 'cancelado' && (
          <button 
            onClick={() => onStatusChange(pedido.id, 'cancelado')}
            className="btn-cancelar"
          >
            <i className="fas fa-times"></i> Cancelar
          </button>
        )}
      </div>
      
      {pedido.observacoes && (
        <div className="pedido-observacoes">
          <i className="fas fa-sticky-note"></i> {pedido.observacoes}
        </div>
      )}
    </div>
  );
};

// Componente de Aba
const Aba = ({ titulo, status, pedidos, onStatusChange, icone, cor }) => {
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
            />
          ))
        )}
      </div>
    </div>
  );
};

// Componente de Novo Pedido
const NovoPedidoForm = ({ onNovoPedido }) => {
  const [mostrarForm, setMostrarForm] = useState(false);
  const [formData, setFormData] = useState({
    cliente_nome: '',
    cliente_telefone: '',
    itens: [{ nome: 'Açaí Médio', preco: 15.00 }],
    valor_total: 15.00,
    forma_pagamento: 'dinheiro',
    observacoes: ''
  });

  const handleChange = (e) => {
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

    try {
      await onNovoPedido(formData);
      setFormData({
        cliente_nome: '',
        cliente_telefone: '',
        itens: [{ nome: 'Açaí Médio', preco: 15.00 }],
        valor_total: 15.00,
        forma_pagamento: 'dinheiro',
        observacoes: ''
      });
      setMostrarForm(false);
      alert('✅ Pedido criado com sucesso!');
    } catch (erro) {
      alert('❌ Erro ao criar pedido: ' + erro.message);
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
              <button 
                onClick={() => setMostrarForm(false)}
                className="btn-fechar"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label><i className="fas fa-user"></i> Nome do Cliente *</label>
                <input
                  type="text"
                  name="cliente_nome"
                  value={formData.cliente_nome}
                  onChange={handleChange}
                  required
                  placeholder="Ex: João Silva"
                />
              </div>
              
              <div className="form-group">
                <label><i className="fas fa-phone"></i> Telefone</label>
                <input
                  type="text"
                  name="cliente_telefone"
                  value={formData.cliente_telefone}
                  onChange={handleChange}
                  placeholder="(11) 99999-9999"
                />
              </div>
              
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
                    <button 
                      type="button" 
                      onClick={() => removerItem(index)}
                      className="btn-remover-item"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                ))}
                <button 
                  type="button" 
                  onClick={adicionarItem}
                  className="btn-add-item"
                >
                  <i className="fas fa-plus"></i> Adicionar Item
                </button>
              </div>
              
              <div className="form-group">
                <label><i className="fas fa-money-bill-wave"></i> Pagamento</label>
                <select 
                  name="forma_pagamento" 
                  value={formData.forma_pagamento}
                  onChange={handleChange}
                >
                  <option value="dinheiro">Dinheiro</option>
                  <option value="pix">PIX</option>
                  <option value="cartao_credito">Cartão Crédito</option>
                  <option value="cartao_debito">Cartão Débito</option>
                </select>
              </div>
              
              <div className="form-group">
                <label><i className="fas fa-sticky-note"></i> Observações</label>
                <textarea
                  name="observacoes"
                  value={formData.observacoes}
                  onChange={handleChange}
                  placeholder="Ex: Sem granola, com banana extra..."
                  rows="3"
                />
              </div>
              
              <div className="form-total">
                <strong>TOTAL: R$ {formData.valor_total.toFixed(2)}</strong>
              </div>
              
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

// Componente Principal
function App() {
  const [pedidos, setPedidos] = useState([]);
  const [carregando, setCarregando] = useState(true);

  // Carregar pedidos
  const carregarPedidos = async () => {
    try {
      setCarregando(true);
      const response = await axios.get(`${API_URL}/pedidos`);
      setPedidos(response.data);
    } catch (erro) {
      console.error('Erro ao carregar pedidos:', erro);
    } finally {
      setCarregando(false);
    }
  };

  // Mudar status do pedido
  const mudarStatus = async (id, novoStatus) => {
    try {
      await axios.put(`${API_URL}/pedidos/${id}/status`, { status: novoStatus });
      carregarPedidos(); // Recarregar lista
    } catch (erro) {
      console.error('Erro ao mudar status:', erro);
      alert('Erro ao atualizar pedido');
    }
  };

  // Criar novo pedido
  const criarNovoPedido = async (dadosPedido) => {
    try {
      await axios.post(`${API_URL}/pedidos/novo`, dadosPedido);
      carregarPedidos();
    } catch (erro) {
      console.error('Erro ao criar pedido:', erro);
      throw erro;
    }
  };

  // Carregar pedidos ao iniciar
  useEffect(() => {
    carregarPedidos();
    
    // Atualizar a cada 30 segundos
    const intervalo = setInterval(carregarPedidos, 30000);
    return () => clearInterval(intervalo);
  }, []);

  // Calcular totais
  const pedidosHoje = pedidos.filter(p => {
    const hoje = new Date().toDateString();
    const dataPedido = new Date(p.data_criacao).toDateString();
    return hoje === dataPedido;
  });

  const totalHoje = pedidosHoje.reduce((soma, p) => soma + parseFloat(p.valor_total), 0);
  const entreguesHoje = pedidosHoje.filter(p => p.status === 'entregue').length;

  return (
    <div className="App">
      {/* Cabeçalho */}
      <header className="app-header">
        <div className="header-content">
          <h1><i className="fas fa-blender acai-icon"></i> Sistema de Pedidos - Açaí</h1>
          <p>Gerencie seus pedidos de WhatsApp/Telefone</p>
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
        </div>
      </header>

      <main className="app-main">
        {/* Botão Novo Pedido */}
        <NovoPedidoForm onNovoPedido={criarNovoPedido} />

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
                onStatusChange={mudarStatus}
                icone="fas fa-bell"
                cor="#FF6B6B"
              />
              
              <Aba 
                titulo="Em Produção" 
                status="producao" 
                pedidos={pedidos}
                onStatusChange={mudarStatus}
                icone="fas fa-blender"
                cor="#FFD166"
              />
              
              <Aba 
                titulo="Prontos" 
                status="pronto" 
                pedidos={pedidos}
                onStatusChange={mudarStatus}
                icone="fas fa-check-circle"
                cor="#06D6A0"
              />
              
              <Aba 
                titulo="Entregues" 
                status="entregue" 
                pedidos={pedidos}
                onStatusChange={mudarStatus}
                icone="fas fa-truck"
                cor="#118AB2"
              />
            </div>
          )}
        </section>

        {/* Resumo do Dia */}
        <section className="resumo-section">
          <h3><i className="fas fa-chart-bar"></i> Resumo do Dia</h3>
          <div className="resumo-grid">
            <div className="resumo-card">
              <div className="resumo-titulo">Total de Pedidos</div>
              <div className="resumo-valor">{pedidosHoje.length}</div>
            </div>
            <div className="resumo-card">
              <div className="resumo-titulo">Valor Total</div>
              <div className="resumo-valor">R$ {totalHoje.toFixed(2)}</div>
            </div>
            <div className="resumo-card">
              <div className="resumo-titulo">Em Produção</div>
              <div className="resumo-valor">
                {pedidos.filter(p => p.status === 'producao').length}
              </div>
            </div>
            <div className="resumo-card">
              <div className="resumo-titulo">Aguardando</div>
              <div className="resumo-valor">
                {pedidos.filter(p => p.status === 'pronto').length}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Rodapé */}
      <footer className="app-footer">
        <p>Sistema desenvolvido para controle de pedidos de açaí | Backend: localhost:3001</p>
      </footer>
    </div>
  );
}

export default App;
