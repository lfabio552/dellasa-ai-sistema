const sqlite3 = require('sqlite3').verbose();

// Banco SIMPLES em memória
const db = new sqlite3.Database(':memory:', (err) => {
  if (err) console.error('Erro DB:', err);
  else {
    db.run(`CREATE TABLE IF NOT EXISTS pedidos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      numero_pedido TEXT,
      cliente_nome TEXT,
      status TEXT DEFAULT 'novo'
    )`);
    console.log('✅ Banco pronto');
  }
});

const Pedido = {
  criar: (pedido, callback) => {
    const numero = `AÇ${Date.now().toString().slice(-6)}`;
    db.run(
      'INSERT INTO pedidos (numero_pedido, cliente_nome, status) VALUES (?, ?, ?)',
      [numero, pedido.cliente_nome || 'Cliente', 'novo'],
      function(err) {
        callback(err, { id: this.lastID, numero_pedido: numero });
      }
    );
  },
  buscarTodos: (callback) => {
    db.all('SELECT * FROM pedidos ORDER BY id DESC', callback);
  },
  buscarPorStatus: (status, callback) => {
    db.all('SELECT * FROM pedidos WHERE status = ?', status, callback);
  },
  atualizarStatus: (id, novoStatus, callback) => {
    db.run('UPDATE pedidos SET status = ? WHERE id = ?', [novoStatus, id], callback);
  }
};

module.exports = Pedido;
