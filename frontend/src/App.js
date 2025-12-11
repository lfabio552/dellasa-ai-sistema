import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ModalCliente from './components/ModalCliente';
import './App.css';

// URL da API - ATUALIZE COM SEU BACKEND DO RENDER
const API_URL = 'https://dellasa-ai-sistema.onrender.com/api';

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
            style={{
              background: '#4B0082',
              color: 'white',
              border: 'none',
              padding: '5px 10px',
              borderRadius: '5px',
              fontSize: '0.8em'
            }}
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
// COMPONENTE PRINCIPAL: App
// ==========================================
function App() {
  const [pedidos, setPedidos] = useState([]);
  const [clientesFieis, setClientesFieis] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [carregandoClientes, setCarregandoClientes] = useState(false);
  const [mostrarModalCliente, setMostrarModalCliente] = useState(false);

  // ==========================================
  // FUNÇÃO: Carregar Pedidos
  // ==========================================
  const carregarPedidos = async () => {
    try {
      setCarregando(true);
      const response = await axios.get(`${API_URL}/pedidos`);
      
      // Proteção: Garante que os dados sejam um ARRAY
      let dadosRecebidos = response.data;
      
      if (!Array.isArray(dadosRecebidos)) {
        console.error('⚠️ ERRO: API não retornou um array.');
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
          console.warn(`⚠️ Erro ao processar itens do pedido:`, erroParse);
          pedidoProcessado.itens = [];
        }
        
        return pedidoProcessado;
      });
      
      setPedidos(pedidosProcessados);
      
    } catch (erro) {
      console.error('❌ Erro ao carregar pedidos:', erro);
      setPedidos([]);
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
  // FUNÇÃO: Ver Ficha do Cliente
  // ==========================================
  const verFichaCliente = async (clienteId) => {
    try {
      alert(`Ficha do cliente ${clienteId} (funcionalidade em desenvolvimento)`);
      // Implementação futura
    } catch (erro) {
      console.error('Erro ao carregar ficha:', erro);
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
        </div>
        
        {/* Botão para cadastrar clientes */}
        <div style={{ marginTop: '20px' }}>
          <button 
            onClick={() => setMostrarModalCliente(true)}
            className="btn-gerenciar-clientes"
          >
            <i className="fas fa-user-plus"></i> Cadastrar Cliente Fiel
          </button>
        </div>
      </header>

      <main className="app-main">
        {/* Aviso sobre clientes cadastrados */}
        {clientesFieis.length > 0 && (
          <div style={{
            background: '#e7f5ff',
            padding: '15px',
            borderRadius: '10px',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            <p>
              <i className="fas fa-users"></i> 
              <strong> {clientesFieis.length} cliente(s) fiel(is) cadastrado(s)</strong>
            </p>
          </div>
        )}

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
      </main>

      {/* Modal de Cadastro de Cliente */}
      {mostrarModalCliente && (
        <ModalCliente 
          onClose={() => setMostrarModalCliente(false)}
          onClienteCadastrado={() => {
            // Recarrega a lista de clientes
            carregarClientesFieis();
          }}
        />
      )}

      {/* Rodapé */}
      <footer className="app-footer">
        <p>Sistema Dellas Açaí | Backend: Render | Frontend: Vercel | {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}

export default App;
