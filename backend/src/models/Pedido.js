const sqlite3 = require('sqlite3').verbose();
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
      criarTabelaSeNaoExistir();
    }
  }
);

// ==========================================
// CRIAÇÃO DA TABELA
// ==========================================
function criarTabelaSeNaoExistir() {
  const sql = `
    CREATE TABLE IF NOT EXISTS pedidos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      numero_pedido TEXT UNIQUE NOT NULL,
      cliente_nome TEXT NOT NULL,
      cliente_telefone TEXT,
      itens TEXT NOT NULL, -- JSON string dos itens
      valor_total REAL NOT NULL,
      forma_pagamento TEXT DEFAULT 'dinheiro',
      status TEXT DEFAULT 'novo',
      observacoes TEXT,
      data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
      data_entregue DATETIME,
      tempo_preparo INTEGER,
      endereco_entrega TEXT
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
// DEFINIÇÃO DO OBJETO "Pedido" COM TODAS AS FUNÇÕES
// ==========================================
const Pedido = {
  // Criar novo pedido
  criar: function (pedidoData, callback) {
    const numeroPedido = gerarNumeroPedido();
    const sql = `
      INSERT INTO pedidos 
      (numero_pedido, cliente_nome, cliente_telefone, itens, valor_total, forma_pagamento, status, observacoes, endereco_entrega)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      numeroPedido,
      pedidoData.cliente_nome,
      pedidoData.cliente_telefone || '',
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
        callback(null, {
          id: this.lastID,
          numero_pedido: numeroPedido
        });
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
  }
};

// ==========================================
// EXPORTAÇÃO DO MÓDULO (OBRIGATÓRIA)
// ==========================================
module.exports = Pedido;
