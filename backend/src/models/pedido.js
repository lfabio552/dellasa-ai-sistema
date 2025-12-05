const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Conectar ao banco de dados SQLite
const dbPath = path.join(__dirname, '../../acai_pedidos.db');
const db = new sqlite3.Database(dbPath);

// Criar tabela de pedidos (se não existir)
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
  if (err) console.error('Erro ao criar tabela:', err);
  else console.log('✅ Tabela "pedidos" pronta!');
});

// Gerar número do pedido (ex: AÇ001)
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
      callback(err, { id: this.lastID, numero_pedido: numero });
    });
  },

  // Buscar todos os pedidos
  buscarTodos: (callback) => {
    db.all('SELECT * FROM pedidos ORDER BY data_criacao DESC', callback);
  },

  // Buscar por status
  buscarPorStatus: (status, callback) => {
    db.all('SELECT * FROM pedidos WHERE status = ? ORDER BY data_criacao', status, callback);
  },

  // Atualizar status
  atualizarStatus: (id, novoStatus, callback) => {
    let sql = 'UPDATE pedidos SET status = ? WHERE id = ?';
    let params = [novoStatus, id];
    
    // Se for "entregue", marca a data de entrega
    if (novoStatus === 'entregue') {
      sql = 'UPDATE pedidos SET status = ?, data_entregue = CURRENT_TIMESTAMP WHERE id = ?';
    }
    
    db.run(sql, params, callback);
  },

  // Deletar pedido
  deletar: (id, callback) => {
    db.run('DELETE FROM pedidos WHERE id = ?', id, callback);
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
    db.all(sql, [data], callback);
  }
};

module.exports = Pedido;