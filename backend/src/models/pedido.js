const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// CONEXÃO CONDICIONAL (produção vs desenvolvimento)
let db;
if (process.env.NODE_ENV === 'production') {
  // Em produção, usa banco em memória (POR ENQUANTO)
  db = new sqlite3.Database(':memory:');
  console.log('⚠️ Banco em memória (produção) - Dados resetam ao reiniciar');
} else {
  // Em desenvolvimento, usa arquivo local
  const dbPath = path.join(__dirname, '../../acai_pedidos.db');
  db = new sqlite3.Database(dbPath);
  console.log('✅ Banco local:', dbPath);
}

// Criar tabela de pedidos (se não existir)
const createTable = () => {
  db.run(`
    CREATE TABLE IF NOT EXISTS pedidos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      numero_pedido TEXT UNIQUE,
      cliente_nome TEXT NOT NULL,
      cliente_telefone TEXT,
      itens TEXT NOT NULL,
      valor_total REAL NOT NULL,
      forma_pagamento TEXT DEFAULT 'dinheiro',
      status TEXT DEFAULT 'novo',
      observacoes TEXT,
      data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
      data_entregue DATETIME,
      tempo_preparo INTEGER,
      endereco_entrega TEXT
    )
  `, (err) => {
    if (err) {
      console.error('❌ Erro ao criar tabela:', err.message);
    } else {
      console.log('✅ Tabela "pedidos" pronta!');
    }
  });
};

// Executar criação da tabela
createTable();

// Gerar número do pedido (ex: AÇ0412101)
function gerarNumeroPedido() {
  const data = new Date();
  const dia = String(data.getDate()).padStart(2, '0');
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const sequencia = Math.floor(Math.random() * 999).toString().padStart(3, '0');
  return `AÇ${dia}${mes}${sequencia}`;
}

// Funções do modelo
const Pedido = {
  // Criar novo pedido
  criar: (pedido, callback) => {
    const numero = gerarNumeroPedido();
    const sql = `
      INSERT INTO pedidos 
      (numero_pedido, cliente_nome, cliente_telefone, itens, valor_total, 
       forma_pagamento, status, observacoes, endereco_entrega)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const params = [
      numero,
      pedido.cliente_nome,
      pedido.cliente_telefone || '',
      JSON.stringify(pedido.itens),
      pedido.valor_total,
      pedido.forma_pagamento || 'dinheiro',
      pedido.status || 'novo',
      pedido.observacoes || '',
      pedido.endereco_entrega || ''
    ];
    
    db.run(sql, params, function(err) {
      if (err) {
        console.error('❌ Erro ao criar pedido:', err.message);
        callback(err, null);
      } else {
        callback(null, { id: this.lastID, numero_pedido: numero });
      }
    });
  },

  // Buscar todos os pedidos
  buscarTodos: (callback) => {
    db.all('SELECT * FROM pedidos ORDER BY data_criacao DESC', (err, rows) => {
      if (err) {
        console.error('❌ Erro ao buscar pedidos:', err.message);
        callback(err, null);
      } else {
        callback(null, rows);
      }
    });
  },

  // Buscar por status
  buscarPorStatus: (status, callback) => {
    db.all('SELECT * FROM pedidos WHERE status = ? ORDER BY data_criacao', status, (err, rows) => {
      if (err) {
        console.error('❌ Erro ao buscar por status:', err.message);
        callback(err, null);
      } else {
        callback(null, rows);
      }
    });
  },

  // Atualizar status
  atualizarStatus: (id, novoStatus, callback) => {
    let sql = 'UPDATE pedidos SET status = ? WHERE id = ?';
    let params = [novoStatus, id];
    
    // Se for "entregue", marca a data de entrega
    if (novoStatus === 'entregue') {
      sql = 'UPDATE pedidos SET status = ?, data_entregue = CURRENT_TIMESTAMP WHERE id = ?';
    }
    
    db.run(sql, params, function(err) {
      if (err) {
        console.error('❌ Erro ao atualizar status:', err.message);
        callback(err);
      } else {
        callback(null);
      }
    });
  },

  // Deletar pedido
  deletar: (id, callback) => {
    db.run('DELETE FROM pedidos WHERE id = ?', id, function(err) {
      if (err) {
        console.error('❌ Erro ao deletar pedido:', err.message);
        callback(err);
      } else {
        callback(null);
      }
    });
  },

  // Relatório diário
  relatorioDiario: (data, callback) => {
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
        console.error('❌ Erro no relatório:', err.message);
        callback(err, null);
      } else {
        callback(null, rows);
      }
    });
  },

  // Buscar pedido por ID
  buscarPorId: (id, callback) => {
    db.get('SELECT * FROM pedidos WHERE id = ?', id, (err, row) => {
      if (err) {
        console.error('❌ Erro ao buscar pedido:', err.message);
        callback(err, null);
      } else {
        callback(null, row);
      }
    });
  }
};

module.exports = Pedido;