const express = require('express');
const path = require('path');
const router = express.Router();
const Pedido = require(path.join(__dirname, '..', 'models', 'Pedido'));

// GET: Listar todos os pedidos
router.get('/', (req, res) => {
  Pedido.buscarTodos((err, pedidos) => {
    if (err) {
      res.status(500).json({ erro: 'Erro ao buscar pedidos' });
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

// GET: Pedidos por status
router.get('/status/:status', (req, res) => {
  Pedido.buscarPorStatus(req.params.status, (err, pedidos) => {
    if (err) {
      res.status(500).json({ erro: 'Erro ao buscar pedidos' });
    } else {
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
  
  // Validação simples
  if (!novoPedido.cliente_nome || !novoPedido.itens || !novoPedido.valor_total) {
    return res.status(400).json({ erro: 'Dados incompletos' });
  }
  
  Pedido.criar(novoPedido, (err, resultado) => {
    if (err) {
      res.status(500).json({ erro: 'Erro ao criar pedido' });
    } else {
      res.json({ 
        mensagem: 'Pedido criado com sucesso!', 
        pedido: resultado 
      });
    }
  });
});

// PUT: Atualizar status
router.put('/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  const statusPermitidos = ['novo', 'producao', 'pronto', 'entregue', 'cancelado'];
  
  if (!statusPermitidos.includes(status)) {
    return res.status(400).json({ erro: 'Status inválido' });
  }
  
  Pedido.atualizarStatus(id, status, (err) => {
    if (err) {
      res.status(500).json({ erro: 'Erro ao atualizar status' });
    } else {
      res.json({ mensagem: `Status atualizado para: ${status}` });
    }
  });
});

// DELETE: Remover pedido
router.delete('/:id', (req, res) => {
  Pedido.deletar(req.params.id, (err) => {
    if (err) {
      res.status(500).json({ erro: 'Erro ao deletar pedido' });
    } else {
      res.json({ mensagem: 'Pedido deletado com sucesso' });
    }
  });
});

// GET: Relatório diário
router.get('/relatorio/diario', (req, res) => {
  const data = req.query.data || new Date().toISOString().split('T')[0];
  
  Pedido.relatorioDiario(data, (err, resultado) => {
    if (err) {
      res.status(500).json({ erro: 'Erro ao gerar relatório' });
    } else {
      res.json({ data: data, relatorio: resultado });
    }
  });
});

module.exports = router;