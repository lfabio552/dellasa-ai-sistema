const express = require('express');
const path = require('path');
const router = express.Router();
const Pedido = require(path.join(__dirname, '..', 'models', 'Pedido.js'));

// GET: Listar todos os pedidos
router.get('/', (req, res) => {
  Pedido.buscarTodos((err, pedidos) => {
    if (err) {
      console.error('Erro no backend ao buscar pedidos:', err);
      res.status(500).json({ erro: 'Erro interno ao buscar pedidos' });
    } else {
      // Converter itens de string JSON para objeto
      pedidos.forEach(p => {
        try {
          p.itens = JSON.parse(p.itens);
        } catch (e) {
          p.itens = [];
        }
      });
      res.json(pedidos);
    }
  });
});

// POST: Criar novo pedido
router.post('/novo', (req, res) => {
  const novoPedido = req.body;
  
  if (!novoPedido.cliente_nome || !novoPedido.itens || !novoPedido.valor_total) {
    return res.status(400).json({ erro: 'Dados incompletos: nome, itens e valor são obrigatórios' });
  }
  
  Pedido.criar(novoPedido, (err, resultado) => {
    if (err) {
      console.error('Erro no backend ao criar pedido:', err);
      res.status(500).json({ erro: 'Erro interno ao criar pedido' });
    } else {
      res.json({ 
        mensagem: 'Pedido criado com sucesso!', 
        pedido: resultado 
      });
    }
  });
});

// Outras rotas (status, delete, relatório) podem vir aqui...

module.exports = router;
