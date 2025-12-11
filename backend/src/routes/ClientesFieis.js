const express = require('express');
const path = require('path');
const router = express.Router();
const Pedido = require(path.join(__dirname, '..', 'models', 'Pedido.js'));

// GET: Listar todos os clientes fiéis
router.get('/', (req, res) => {
    Pedido.buscarClientesFieis((err, clientes) => {
        if (err) {
            console.error('❌ Erro ao buscar clientes:', err);
            res.status(500).json({ erro: 'Erro ao buscar clientes' });
        } else {
            res.json(clientes);
        }
    });
});

// POST: Criar cliente fiel
router.post('/novo', (req, res) => {
    const clienteData = req.body;
    
    console.log('📝 Recebendo dados do cliente:', clienteData);
    
    if (!clienteData.nome) {
        return res.status(400).json({ erro: 'Nome do cliente é obrigatório' });
    }
    
    Pedido.criarClienteFiel(clienteData, (err, resultado) => {
        if (err) {
            console.error('❌ Erro ao criar cliente:', err);
            res.status(500).json({ erro: 'Erro ao criar cliente' });
        } else {
            console.log('✅ Cliente criado:', resultado);
            res.json({ 
                success: true,
                mensagem: 'Cliente criado com sucesso!', 
                cliente: resultado 
            });
        }
    });
});

// Rota de teste
router.get('/teste', (req, res) => {
    res.json({ 
        status: 'API Clientes Fiéis funcionando!',
        timestamp: new Date().toISOString()
    });
});

module.exports = router;
