const db = require('../config/database.js');
const path = require('path');

// ==========================================
// CONEXÃO COM BANCO DE DADOS SQLite
// ==========================================
// Em produção (Render), usa banco em memória.
// Em desenvolvimento, usa arquivo físico.
const db = new sqlite3.Database(
  process.env.NODE_ENV === 'production' ? ':memory:' : path.join(__dirname, '../../acai_pedidos.db'),
  (err) => {
    if (err) {
      console.error('❌ Erro ao conectar ao banco de dados:', err.message);
    } else {
      console.log('✅ Conectado ao banco de dados SQLite.');
      criarTabelaPedidos();
      criarTabelaClientesFieis();
      criarTabelaPagamentos();
    }
  }
);

// ==========================================
// CRIAÇÃO DAS TABELAS
// ==========================================
function criarTabelaPedidos() {
  const sql = `
    CREATE TABLE IF NOT EXISTS pedidos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      numero_pedido TEXT UNIQUE NOT NULL,
      cliente_nome TEXT NOT NULL,
      cliente_telefone TEXT,
      cliente_fiel_id INTEGER,
      itens TEXT NOT NULL,
      valor_total REAL NOT NULL,
      forma_pagamento TEXT DEFAULT 'dinheiro',
      status TEXT DEFAULT 'novo',
      observacoes TEXT,
      data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
      data_entregue DATETIME,
      tempo_preparo INTEGER,
      endereco_entrega TEXT,
      FOREIGN KEY (cliente_fiel_id) REFERENCES clientes_fieis(id)
    )
  `;

  db.run(sql, (err) => {
    if (err) {
      console.error('❌ Erro ao criar tabela "pedidos":', err.message);
    } else {
      console.log('✅ Tabela "pedidos" verificada/criada.');
    }
  });
}

function criarTabelaClientesFieis() {
  const sql = `
    CREATE TABLE IF NOT EXISTS clientes_fieis (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      telefone TEXT UNIQUE,
      limite_credito REAL DEFAULT 200.00,
      saldo_atual REAL DEFAULT 0.00,
      data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP,
      observacoes TEXT,
      total_compras REAL DEFAULT 0.00,
      ultima_compra DATETIME
    )
  `;
  
  db.run(sql, (err) => {
    if (err) {
      console.error('❌ Erro ao criar tabela "clientes_fieis":', err.message);
    } else {
      console.log('✅ Tabela "clientes_fieis" verificada/criada.');
    }
  });
}

function criarTabelaPagamentos() {
  const sql = `
    CREATE TABLE IF NOT EXISTS pagamentos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cliente_fiel_id INTEGER NOT NULL,
      valor REAL NOT NULL,
      forma_pagamento TEXT DEFAULT 'dinheiro',
      data_pagamento DATETIME DEFAULT CURRENT_TIMESTAMP,
      mes_referencia TEXT,
      observacoes TEXT,
      FOREIGN KEY (cliente_fiel_id) REFERENCES clientes_fieis(id)
    )
  `;
  
  db.run(sql, (err) => {
    if (err) {
      console.error('❌ Erro ao criar tabela "pagamentos":', err.message);
    } else {
      console.log('✅ Tabela "pagamentos" verificada/criada.');
    }
  });
}

// ==========================================
// FUNÇÃO AUXILIAR: GERAR NÚMERO DO PEDIDO
// ==========================================
function gerarNumeroPedido() {
  const data = new Date();
  const dia = String(data.getDate()).padStart(2, '0');
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const sequencia = Math.floor(Math.random() * 999).toString().padStart(3, '0');
  return `AÇ${dia}${mes}${sequencia}`;
}

// ==========================================
// DEFINIÇÃO DO OBJETO "Pedido" (PEDIDOS)
// ==========================================
const Pedido = {
  // ========================================
  // FUNÇÕES PARA PEDIDOS
  // ========================================
  
  // Criar novo pedido
  criar: function (pedidoData, callback) {
    const numeroPedido = gerarNumeroPedido();
    const sql = `
      INSERT INTO pedidos 
      (numero_pedido, cliente_nome, cliente_telefone, cliente_fiel_id, itens, valor_total, 
       forma_pagamento, status, observacoes, endereco_entrega)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      numeroPedido,
      pedidoData.cliente_nome,
      pedidoData.cliente_telefone || '',
      pedidoData.cliente_fiel_id || null,
      JSON.stringify(pedidoData.itens),
      pedidoData.valor_total,
      pedidoData.forma_pagamento || 'dinheiro',
      pedidoData.status || 'novo',
      pedidoData.observacoes || '',
      pedidoData.endereco_entrega || ''
    ];

    db.run(sql, params, function (err) {
      if (err) {
        console.error('❌ Erro na função Pedido.criar:', err.message);
        callback(err, null);
      } else {
        const pedidoId = this.lastID;
        
        // Se for pedido A PRAZO, atualiza saldo do cliente
        if (pedidoData.forma_pagamento === 'a_prazo' && pedidoData.cliente_fiel_id) {
          atualizarSaldoCliente(pedidoData.cliente_fiel_id, pedidoData.valor_total, 'adicionar', (errSaldo) => {
            if (errSaldo) {
              console.error('⚠️ Erro ao atualizar saldo do cliente:', errSaldo.message);
            }
            // Retorna o pedido mesmo com erro no saldo
            callback(null, {
              id: pedidoId,
              numero_pedido: numeroPedido
            });
          });
        } else {
          callback(null, {
            id: pedidoId,
            numero_pedido: numeroPedido
          });
        }
      }
    });
  },

  // Buscar todos os pedidos
  buscarTodos: function (callback) {
    const sql = 'SELECT * FROM pedidos ORDER BY data_criacao DESC';
    db.all(sql, (err, rows) => {
      if (err) {
        console.error('❌ Erro na função Pedido.buscarTodos:', err.message);
        callback(err, null);
      } else {
        // Converte a string JSON de 'itens' de volta para objeto
        const pedidosProcessados = rows.map(pedido => {
          try {
            pedido.itens = JSON.parse(pedido.itens);
          } catch (e) {
            pedido.itens = [];
          }
          return pedido;
        });
        callback(null, pedidosProcessados);
      }
    });
  },

  // Buscar pedidos por status
  buscarPorStatus: function (status, callback) {
    const sql = 'SELECT * FROM pedidos WHERE status = ? ORDER BY data_criacao';
    db.all(sql, [status], (err, rows) => {
      if (err) {
        console.error('❌ Erro na função Pedido.buscarPorStatus:', err.message);
        callback(err, null);
      } else {
        const pedidosProcessados = rows.map(pedido => {
          try {
            pedido.itens = JSON.parse(pedido.itens);
          } catch (e) {
            pedido.itens = [];
          }
          return pedido;
        });
        callback(null, pedidosProcessados);
      }
    });
  },

  // Atualizar status de um pedido
  atualizarStatus: function (id, novoStatus, callback) {
    let sql = 'UPDATE pedidos SET status = ? WHERE id = ?';
    const params = [novoStatus, id];

    if (novoStatus === 'entregue') {
      sql = 'UPDATE pedidos SET status = ?, data_entregue = CURRENT_TIMESTAMP WHERE id = ?';
    }

    db.run(sql, params, function (err) {
      if (err) {
        console.error('❌ Erro na função Pedido.atualizarStatus:', err.message);
        callback(err);
      } else {
        callback(null);
      }
    });
  },

  // Deletar um pedido
  deletar: function (id, callback) {
    const sql = 'DELETE FROM pedidos WHERE id = ?';
    db.run(sql, [id], function (err) {
      if (err) {
        console.error('❌ Erro na função Pedido.deletar:', err.message);
        callback(err);
      } else {
        callback(null);
      }
    });
  },

  // Relatório diário
  relatorioDiario: function (data, callback) {
    const sql = `
      SELECT 
        COUNT(*) as total_pedidos,
        SUM(valor_total) as valor_total,
        forma_pagamento,
        COUNT(*) as quantidade
      FROM pedidos 
      WHERE DATE(data_criacao) = DATE(?)
      GROUP BY forma_pagamento
    `;
    db.all(sql, [data], (err, rows) => {
      if (err) {
        console.error('❌ Erro na função Pedido.relatorioDiario:', err.message);
        callback(err, null);
      } else {
        callback(null, rows);
      }
    });
  },

  // Buscar pedido por ID
  buscarPorId: function (id, callback) {
    const sql = 'SELECT * FROM pedidos WHERE id = ?';
    db.get(sql, [id], (err, row) => {
      if (err) {
        console.error('❌ Erro na função Pedido.buscarPorId:', err.message);
        callback(err, null);
      } else if (row) {
        try {
          row.itens = JSON.parse(row.itens);
        } catch (e) {
          row.itens = [];
        }
        callback(null, row);
      } else {
        callback(null, null);
      }
    });
  },

  // ========================================
  // FUNÇÕES PARA CLIENTES FIÉIS
  // ========================================
  
  // Criar cliente fiel
  criarClienteFiel: function (clienteData, callback) {
    const sql = `
      INSERT INTO clientes_fieis 
      (nome, telefone, limite_credito, observacoes)
      VALUES (?, ?, ?, ?)
    `;

    const params = [
      clienteData.nome,
      clienteData.telefone || '',
      clienteData.limite_credito || 200.00,
      clienteData.observacoes || ''
    ];

    db.run(sql, params, function (err) {
      if (err) {
        console.error('❌ Erro na função criarClienteFiel:', err.message);
        callback(err, null);
      } else {
        callback(null, {
          id: this.lastID,
          nome: clienteData.nome
        });
      }
    });
  },

  // Buscar todos os clientes fiéis
  buscarClientesFieis: function (callback) {
    const sql = 'SELECT * FROM clientes_fieis ORDER BY nome';
    db.all(sql, (err, rows) => {
      if (err) {
        console.error('❌ Erro na função buscarClientesFieis:', err.message);
        callback(err, null);
      } else {
        callback(null, rows);
      }
    });
  },

  // Buscar cliente fiel por ID
  buscarClienteFielPorId: function (id, callback) {
    const sql = 'SELECT * FROM clientes_fieis WHERE id = ?';
    db.get(sql, [id], (err, row) => {
      if (err) {
        console.error('❌ Erro na função buscarClienteFielPorId:', err.message);
        callback(err, null);
      } else {
        callback(null, row);
      }
    });
  },

  // Atualizar saldo do cliente (função interna)
  atualizarSaldoCliente: function (clienteId, valor, operacao, callback) {
    const sinal = operacao === 'adicionar' ? '+' : '-';
    const sql = `
      UPDATE clientes_fieis 
      SET saldo_atual = saldo_atual ${sinal} ?, 
          total_compras = total_compras + ?,
          ultima_compra = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    
    const valorAbsoluto = Math.abs(valor);
    
    db.run(sql, [valorAbsoluto, operacao === 'adicionar' ? valorAbsoluto : 0, clienteId], function (err) {
      if (err) {
        console.error('❌ Erro na função atualizarSaldoCliente:', err.message);
        callback(err);
      } else {
        callback(null);
      }
    });
  },

  // Registrar pagamento do cliente
  registrarPagamentoCliente: function (clienteId, pagamentoData, callback) {
    // 1. Insere o registro de pagamento
    const sqlPagamento = `
      INSERT INTO pagamentos 
      (cliente_fiel_id, valor, forma_pagamento, mes_referencia, observacoes)
      VALUES (?, ?, ?, ?, ?)
    `;
    
    const mesAtual = new Date().toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
    
    const paramsPagamento = [
      clienteId,
      pagamentoData.valor,
      pagamentoData.forma_pagamento || 'dinheiro',
      pagamentoData.mes_referencia || mesAtual,
      pagamentoData.observacoes || ''
    ];
    
    db.run(sqlPagamento, paramsPagamento, function (err) {
      if (err) {
        console.error('❌ Erro ao registrar pagamento:', err.message);
        callback(err);
        return;
      }
      
      // 2. Atualiza o saldo do cliente (subtrai o valor pago)
      const sqlAtualizarSaldo = `
        UPDATE clientes_fieis 
        SET saldo_atual = saldo_atual - ?
        WHERE id = ?
      `;
      
      db.run(sqlAtualizarSaldo, [pagamentoData.valor, clienteId], function (err) {
        if (err) {
          console.error('❌ Erro ao atualizar saldo após pagamento:', err.message);
          callback(err);
        } else {
          callback(null);
        }
      });
    });
  },

  // Buscar histórico de pagamentos do cliente
  buscarPagamentosCliente: function (clienteId, callback) {
    const sql = 'SELECT * FROM pagamentos WHERE cliente_fiel_id = ? ORDER BY data_pagamento DESC';
    db.all(sql, [clienteId], (err, rows) => {
      if (err) {
        console.error('❌ Erro na função buscarPagamentosCliente:', err.message);
        callback(err, null);
      } else {
        callback(null, rows);
      }
    });
  },

  // Atualizar cliente fiel
  atualizarClienteFiel: function (id, clienteData, callback) {
    const sql = `
      UPDATE clientes_fieis 
      SET nome = ?, telefone = ?, limite_credito = ?, observacoes = ?
      WHERE id = ?
    `;
    
    const params = [
      clienteData.nome,
      clienteData.telefone || '',
      clienteData.limite_credito || 200.00,
      clienteData.observacoes || '',
      id
    ];
    
    db.run(sql, params, function (err) {
      if (err) {
        console.error('❌ Erro na função atualizarClienteFiel:', err.message);
        callback(err);
      } else {
        callback(null);
      }
    });
  },

  // Deletar cliente fiel
  deletarClienteFiel: function (id, callback) {
    // Primeiro verifica se o cliente tem saldo
    const sqlVerificar = 'SELECT saldo_atual FROM clientes_fieis WHERE id = ?';
    
    db.get(sqlVerificar, [id], (err, row) => {
      if (err) {
        console.error('❌ Erro ao verificar cliente:', err.message);
        callback(err);
        return;
      }
      
      if (row && row.saldo_atual > 0) {
        callback(new Error('Não é possível deletar cliente com saldo pendente.'));
        return;
      }
      
      // Se não tem saldo, deleta
      const sqlDeletar = 'DELETE FROM clientes_fieis WHERE id = ?';
      db.run(sqlDeletar, [id], function (err) {
        if (err) {
          console.error('❌ Erro na função deletarClienteFiel:', err.message);
          callback(err);
        } else {
          callback(null);
        }
      });
    });
  },

  // Buscar clientes com saldo pendente
  buscarClientesComSaldo: function (callback) {
    const sql = 'SELECT * FROM clientes_fieis WHERE saldo_atual > 0 ORDER BY saldo_atual DESC';
    db.all(sql, (err, rows) => {
      if (err) {
        console.error('❌ Erro na função buscarClientesComSaldo:', err.message);
        callback(err, null);
      } else {
        callback(null, rows);
      }
    });
  },

  // ========================================
  // FUNÇÕES PARA IMPORTAR VENDAS PASSADAS
  // ========================================
  
  // Importar pedidos em lote
  importarPedidosEmLote: function (pedidosArray, callback) {
    let importados = 0;
    let erros = 0;
    const resultados = [];
    
    // Função para processar cada pedido
    const processarPedido = (index) => {
      if (index >= pedidosArray.length) {
        // Todos processados
        callback(null, {
          total: pedidosArray.length,
          importados: importados,
          erros: erros,
          resultados: resultados
        });
        return;
      }
      
      const pedido = pedidosArray[index];
      const numeroPedido = `IMP${String(index + 1).padStart(4, '0')}`;
      
      const sql = `
        INSERT INTO pedidos 
        (numero_pedido, cliente_nome, cliente_telefone, itens, valor_total, 
         forma_pagamento, status, observacoes, data_criacao)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      // Converte data se fornecida, senão usa data atual
      let dataCriacao = pedido.data_criacao || new Date().toISOString();
      
      const params = [
        numeroPedido,
        pedido.cliente_nome || 'Cliente Importado',
        pedido.cliente_telefone || '',
        JSON.stringify(pedido.itens || [{ nome: 'Importado', preco: 0 }]),
        pedido.valor_total || 0,
        pedido.forma_pagamento || 'dinheiro',
        pedido.status || 'entregue',
        pedido.observacoes || 'Importado',
        dataCriacao
      ];
      
      db.run(sql, params, function (err) {
        if (err) {
          console.error(`❌ Erro ao importar pedido ${index + 1}:`, err.message);
          erros++;
          resultados.push({ index: index, success: false, error: err.message });
        } else {
          importados++;
          resultados.push({ index: index, success: true, id: this.lastID });
        }
        
        // Processa próximo pedido
        processarPedido(index + 1);
      });
    };
    
    // Inicia o processamento
    processarPedido(0);
  },

  // Buscar pedidos por período
  buscarPedidosPorPeriodo: function (dataInicio, dataFim, callback) {
    const sql = `
      SELECT * FROM pedidos 
      WHERE DATE(data_criacao) BETWEEN DATE(?) AND DATE(?)
      ORDER BY data_criacao DESC
    `;
    
    db.all(sql, [dataInicio, dataFim], (err, rows) => {
      if (err) {
        console.error('❌ Erro na função buscarPedidosPorPeriodo:', err.message);
        callback(err, null);
      } else {
        const pedidosProcessados = rows.map(pedido => {
          try {
            pedido.itens = JSON.parse(pedido.itens);
          } catch (e) {
            pedido.itens = [];
          }
          return pedido;
        });
        callback(null, pedidosProcessados);
      }
    });
  }
};

// Função auxiliar para atualizar saldo (usada internamente)
function atualizarSaldoCliente(clienteId, valor, operacao, callback) {
  Pedido.atualizarSaldoCliente(clienteId, valor, operacao, callback);
}

// ==========================================
// EXPORTAÇÃO DO MÓDULO (OBRIGATÓRIA)
// ==========================================
module.exports = Pedido;
