const express = require('express');
const path = require('path');
const router = express.Router();
const Pedido = require(path.join(__dirname, '..', 'models', 'Pedido.js'));

// ==========================================
// ROTAS PARA PEDIDOS
// ==========================================

// GET: Listar todos os pedidos
router.get('/', (req, res) => {
  Pedido.buscarTodos((err, pedidos) => {
    if (err) {
      console.error('❌ Erro no backend ao buscar pedidos:', err.message);
      res.status(500).json({ 
        erro: 'Erro interno ao buscar pedidos',
        detalhes: err.message 
      });
    } else {
      res.json(pedidos);
    }
  });
});

// GET: Pedidos por status
router.get('/status/:status', (req, res) => {
  const { status } = req.params;
  const statusValidos = ['novo', 'producao', 'pronto', 'entregue', 'cancelado'];
  
  if (!statusValidos.includes(status)) {
    return res.status(400).json({ 
      erro: 'Status inválido',
      status_validos: statusValidos 
    });
  }
  
  Pedido.buscarPorStatus(status, (err, pedidos) => {
    if (err) {
      console.error(`❌ Erro ao buscar pedidos por status ${status}:`, err.message);
      res.status(500).json({ erro: 'Erro interno ao buscar pedidos' });
    } else {
      res.json(pedidos);
    }
  });
});

// POST: Criar novo pedido
router.post('/novo', (req, res) => {
  const novoPedido = req.body;
  
  // Validação básica
  if (!novoPedido.cliente_nome || !novoPedido.itens || !novoPedido.valor_total) {
    return res.status(400).json({ 
      erro: 'Dados incompletos',
      obrigatorios: ['cliente_nome', 'itens', 'valor_total']
    });
  }
  
  // Validação específica para "A Prazo"
  if (novoPedido.forma_pagamento === 'a_prazo' && !novoPedido.cliente_fiel_id) {
    return res.status(400).json({ 
      erro: 'Para pedidos "A Prazo", é necessário selecionar um cliente fiel'
    });
  }
  
  Pedido.criar(novoPedido, (err, resultado) => {
    if (err) {
      console.error('❌ Erro ao criar pedido:', err.message);
      res.status(500).json({ 
        erro: 'Erro interno ao criar pedido',
        detalhes: err.message 
      });
    } else {
      res.json({ 
        success: true,
        mensagem: 'Pedido criado com sucesso!', 
        pedido: resultado 
      });
    }
  });
});

// PUT: Atualizar status do pedido
router.put('/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  const statusPermitidos = ['novo', 'producao', 'pronto', 'entregue', 'cancelado'];
  
  if (!statusPermitidos.includes(status)) {
    return res.status(400).json({ 
      erro: 'Status inválido',
      status_permitidos: statusPermitidos 
    });
  }
  
  Pedido.atualizarStatus(id, status, (err) => {
    if (err) {
      console.error(`❌ Erro ao atualizar status do pedido ${id}:`, err.message);
      res.status(500).json({ erro: 'Erro interno ao atualizar status' });
    } else {
      res.json({ 
        success: true,
        mensagem: `Status atualizado para: ${status}` 
      });
    }
  });
});

// DELETE: Remover pedido
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  
  Pedido.deletar(id, (err) => {
    if (err) {
      console.error(`❌ Erro ao deletar pedido ${id}:`, err.message);
      res.status(500).json({ erro: 'Erro interno ao deletar pedido' });
    } else {
      res.json({ 
        success: true,
        mensagem: 'Pedido deletado com sucesso' 
      });
    }
  });
});

// GET: Relatório diário
router.get('/relatorio/diario', (req, res) => {
  const data = req.query.data || new Date().toISOString().split('T')[0];
  
  Pedido.relatorioDiario(data, (err, resultado) => {
    if (err) {
      console.error(`❌ Erro ao gerar relatório para data ${data}:`, err.message);
      res.status(500).json({ erro: 'Erro interno ao gerar relatório' });
    } else {
      res.json({ 
        data: data, 
        relatorio: resultado,
        success: true
      });
    }
  });
});

// GET: Buscar pedido por ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  
  Pedido.buscarPorId(id, (err, pedido) => {
    if (err) {
      console.error(`❌ Erro ao buscar pedido ${id}:`, err.message);
      res.status(500).json({ erro: 'Erro interno ao buscar pedido' });
    } else if (!pedido) {
      res.status(404).json({ 
        erro: 'Pedido não encontrado',
        id: id
      });
    } else {
      res.json(pedido);
    }
  });
});

// ==========================================
// ROTAS PARA CLIENTES FIÉIS
// ==========================================

// GET: Listar todos os clientes fiéis
router.get('/clientes-fieis/todos', (req, res) => {
  Pedido.buscarClientesFieis((err, clientes) => {
    if (err) {
      console.error('❌ Erro ao buscar clientes fiéis:', err.message);
      res.status(500).json({ erro: 'Erro interno ao buscar clientes' });
    } else {
      res.json(clientes);
    }
  });
});

// GET: Buscar cliente fiel por ID
router.get('/clientes-fieis/:id', (req, res) => {
  const { id } = req.params;
  
  Pedido.buscarClienteFielPorId(id, (err, cliente) => {
    if (err) {
      console.error(`❌ Erro ao buscar cliente fiel ${id}:`, err.message);
      res.status(500).json({ erro: 'Erro interno ao buscar cliente' });
    } else if (!cliente) {
      res.status(404).json({ 
        erro: 'Cliente fiel não encontrado',
        id: id
      });
    } else {
      res.json(cliente);
    }
  });
});

// POST: Criar novo cliente fiel
router.post('/clientes-fieis/novo', (req, res) => {
  const clienteData = req.body;
  
  if (!clienteData.nome) {
    return res.status(400).json({ 
      erro: 'Nome do cliente é obrigatório'
    });
  }
  
  Pedido.criarClienteFiel(clienteData, (err, resultado) => {
    if (err) {
      console.error('❌ Erro ao criar cliente fiel:', err.message);
      res.status(500).json({ 
        erro: 'Erro interno ao criar cliente',
        detalhes: err.message 
      });
    } else {
      res.json({ 
        success: true,
        mensagem: 'Cliente fiel cadastrado com sucesso!', 
        cliente: resultado 
      });
    }
  });
});

// PUT: Atualizar cliente fiel
router.put('/clientes-fieis/:id', (req, res) => {
  const { id } = req.params;
  const clienteData = req.body;
  
  if (!clienteData.nome) {
    return res.status(400).json({ erro: 'Nome do cliente é obrigatório' });
  }
  
  Pedido.atualizarClienteFiel(id, clienteData, (err) => {
    if (err) {
      console.error(`❌ Erro ao atualizar cliente fiel ${id}:`, err.message);
      res.status(500).json({ erro: 'Erro interno ao atualizar cliente' });
    } else {
      res.json({ 
        success: true,
        mensagem: 'Cliente fiel atualizado com sucesso!' 
      });
    }
  });
});

// DELETE: Deletar cliente fiel
router.delete('/clientes-fieis/:id', (req, res) => {
  const { id } = req.params;
  
  Pedido.deletarClienteFiel(id, (err) => {
    if (err) {
      console.error(`❌ Erro ao deletar cliente fiel ${id}:`, err.message);
      const statusCode = err.message.includes('saldo pendente') ? 400 : 500;
      res.status(statusCode).json({ 
        erro: err.message || 'Erro interno ao deletar cliente'
      });
    } else {
      res.json({ 
        success: true,
        mensagem: 'Cliente fiel deletado com sucesso' 
      });
    }
  });
});

// POST: Registrar pagamento do cliente
router.post('/clientes-fieis/:id/pagar', (req, res) => {
  const { id } = req.params;
  const pagamentoData = req.body;
  
  if (!pagamentoData.valor || pagamentoData.valor <= 0) {
    return res.status(400).json({ 
      erro: 'Valor do pagamento é obrigatório e deve ser maior que zero'
    });
  }
  
  // Primeiro verifica o saldo atual do cliente
  Pedido.buscarClienteFielPorId(id, (err, cliente) => {
    if (err) {
      console.error(`❌ Erro ao buscar cliente ${id} para pagamento:`, err.message);
      return res.status(500).json({ erro: 'Erro interno ao verificar cliente' });
    }
    
    if (!cliente) {
      return res.status(404).json({ erro: 'Cliente não encontrado' });
    }
    
    if (pagamentoData.valor > cliente.saldo_atual) {
      return res.status(400).json({ 
        erro: `Valor do pagamento (R$ ${pagamentoData.valor}) excede o saldo devido (R$ ${cliente.saldo_atual})`
      });
    }
    
    // Registra o pagamento
    Pedido.registrarPagamentoCliente(id, pagamentoData, (errPagamento) => {
      if (errPagamento) {
        console.error(`❌ Erro ao registrar pagamento para cliente ${id}:`, errPagamento.message);
        res.status(500).json({ 
          erro: 'Erro interno ao registrar pagamento',
          detalhes: errPagamento.message 
        });
      } else {
        res.json({ 
          success: true,
          mensagem: `Pagamento de R$ ${pagamentoData.valor} registrado com sucesso!`,
          saldo_anterior: cliente.saldo_atual,
          saldo_atual: cliente.saldo_atual - pagamentoData.valor
        });
      }
    });
  });
});

// GET: Buscar histórico de pagamentos do cliente
router.get('/clientes-fieis/:id/pagamentos', (req, res) => {
  const { id } = req.params;
  
  Pedido.buscarPagamentosCliente(id, (err, pagamentos) => {
    if (err) {
      console.error(`❌ Erro ao buscar pagamentos do cliente ${id}:`, err.message);
      res.status(500).json({ erro: 'Erro interno ao buscar pagamentos' });
    } else {
      res.json(pagamentos);
    }
  });
});

// GET: Buscar clientes com saldo pendente
router.get('/clientes-fieis/saldo/pendente', (req, res) => {
  Pedido.buscarClientesComSaldo((err, clientes) => {
    if (err) {
      console.error('❌ Erro ao buscar clientes com saldo:', err.message);
      res.status(500).json({ erro: 'Erro interno ao buscar clientes' });
    } else {
      res.json(clientes);
    }
  });
});

// ==========================================
// ROTAS PARA IMPORTAÇÃO E RELATÓRIOS
// ==========================================

// POST: Importar pedidos em lote (para vendas passadas)
router.post('/importar/lote', (req, res) => {
  const pedidosArray = req.body.pedidos;
  
  if (!Array.isArray(pedidosArray) || pedidosArray.length === 0) {
    return res.status(400).json({ 
      erro: 'É necessário enviar um array de pedidos para importação'
    });
  }
  
  if (pedidosArray.length > 100) {
    return res.status(400).json({ 
      erro: 'Limite de 100 pedidos por importação. Divida em lotes menores.'
    });
  }
  
  console.log(`📥 Iniciando importação de ${pedidosArray.length} pedidos...`);
  
  Pedido.importarPedidosEmLote(pedidosArray, (err, resultado) => {
    if (err) {
      console.error('❌ Erro na importação em lote:', err.message);
      res.status(500).json({ 
        erro: 'Erro interno na importação',
        detalhes: err.message 
      });
    } else {
      console.log(`✅ Importação concluída: ${resultado.importados} sucessos, ${resultado.erros} erros`);
      res.json({
        success: true,
        mensagem: `Importação concluída com ${resultado.importados} pedidos importados e ${resultado.erros} erros`,
        resultado: resultado
      });
    }
  });
});

// GET: Buscar pedidos por período
router.get('/periodo/:inicio/:fim', (req, res) => {
  const { inicio, fim } = req.params;
  
  // Validação básica de datas
  if (!inicio || !fim) {
    return res.status(400).json({ 
      erro: 'Datas de início e fim são obrigatórias'
    });
  }
  
  Pedido.buscarPedidosPorPeriodo(inicio, fim, (err, pedidos) => {
    if (err) {
      console.error(`❌ Erro ao buscar pedidos no período ${inicio} - ${fim}:`, err.message);
      res.status(500).json({ erro: 'Erro interno ao buscar pedidos' });
    } else {
      res.json({
        periodo: { inicio, fim },
        total: pedidos.length,
        valor_total: pedidos.reduce((sum, p) => sum + (p.valor_total || 0), 0),
        pedidos: pedidos
      });
    }
  });
});

// ==========================================
// ROTA DE TESTE/SAÚDE
// ==========================================

router.get('/teste/conexao', (req, res) => {
  res.json({
    success: true,
    mensagem: 'API de pedidos funcionando corretamente',
    timestamp: new Date().toISOString(),
    endpoints_disponiveis: [
      'GET /api/pedidos',
      'POST /api/pedidos/novo',
      'PUT /api/pedidos/:id/status',
      'GET /api/pedidos/clientes-fieis/todos',
      'POST /api/pedidos/clientes-fieis/novo',
      'POST /api/pedidos/importar/lote'
    ]
  });
});

// ==========================================
// ROTA DE FALLBACK PARA /api/pedidos
// ==========================================

router.all('*', (req, res) => {
  res.status(404).json({
    erro: 'Rota não encontrada na API de pedidos',
    metodo: req.method,
    url: req.originalUrl,
    endpoints_validos: {
      pedidos: [
        'GET /',
        'GET /status/:status',
        'POST /novo',
        'PUT /:id/status',
        'DELETE /:id',
        'GET /relatorio/diario',
        'GET /:id'
      ],
      clientes_fieis: [
        'GET /clientes-fieis/todos',
        'GET /clientes-fieis/:id',
        'POST /clientes-fieis/novo',
        'PUT /clientes-fieis/:id',
        'DELETE /clientes-fieis/:id',
        'POST /clientes-fieis/:id/pagar',
        'GET /clientes-fieis/:id/pagamentos',
        'GET /clientes-fieis/saldo/pendente'
      ],
      importacao: [
        'POST /importar/lote',
        'GET /periodo/:inicio/:fim'
      ]
    }
  });
});

module.exports = router;
