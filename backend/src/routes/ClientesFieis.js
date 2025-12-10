// backend/src/routes/ClientesFieis.js
const express = require('express');
const path = require('path');
const router = express.Router();
const Pedido = require(path.join(__dirname, '..', 'models', 'Pedido.js'));

// GET: Listar todos os clientes fiéis
router.get('/', (req, res) => {
    Pedido.buscarClientesFieis((err, clientes) => {
        if (err) {
            res.status(500).json({ erro: 'Erro ao buscar clientes' });
        } else {
            res.json(clientes);
        }
    });
});

// GET: Buscar cliente por ID
router.get('/:id', (req, res) => {
    Pedido.buscarClienteFielPorId(req.params.id, (err, cliente) => {
        if (err) {
            res.status(500).json({ erro: 'Erro ao buscar cliente' });
        } else if (!cliente) {
            res.status(404).json({ erro: 'Cliente não encontrado' });
        } else {
            res.json(cliente);
        }
    });
});

// POST: Criar cliente fiel
router.post('/novo', (req, res) => {
    const clienteData = req.body;
    
    if (!clienteData.nome) {
        return res.status(400).json({ erro: 'Nome do cliente é obrigatório' });
    }
    
    Pedido.criarClienteFiel(clienteData, (err, resultado) => {
        if (err) {
            res.status(500).json({ erro: 'Erro ao criar cliente' });
        } else {
            res.json({ 
                mensagem: 'Cliente criado com sucesso!', 
                cliente: resultado 
            });
        }
    });
});

// PUT: Atualizar cliente fiel
router.put('/:id', (req, res) => {
    const clienteData = req.body;
    
    Pedido.atualizarClienteFiel(req.params.id, clienteData, (err) => {
        if (err) {
            res.status(500).json({ erro: 'Erro ao atualizar cliente' });
        } else {
            res.json({ mensagem: 'Cliente atualizado com sucesso!' });
        }
    });
});

// POST: Registrar pagamento
router.post('/:id/pagar', (req, res) => {
    const pagamentoData = req.body;
    
    if (!pagamentoData.valor || pagamentoData.valor <= 0) {
        return res.status(400).json({ erro: 'Valor do pagamento inválido' });
    }
    
    Pedido.registrarPagamentoCliente(req.params.id, pagamentoData, (err) => {
        if (err) {
            res.status(500).json({ erro: 'Erro ao registrar pagamento' });
        } else {
            res.json({ mensagem: 'Pagamento registrado com sucesso!' });
        }
    });
});

// DELETE: Remover cliente fiel
router.delete('/:id', (req, res) => {
    Pedido.deletarClienteFiel(req.params.id, (err) => {
        if (err) {
            res.status(500).json({ erro: err.message || 'Erro ao deletar cliente' });
        } else {
            res.json({ mensagem: 'Cliente deletado com sucesso' });
        }
    });
});

// GET: Clientes com saldo pendente
router.get('/pendentes/saldo', (req, res) => {
    Pedido.buscarClientesComSaldo((err, clientes) => {
        if (err) {
            res.status(500).json({ erro: 'Erro ao buscar clientes' });
        } else {
            res.json(clientes);
        }
    });
});

module.exports = router;
