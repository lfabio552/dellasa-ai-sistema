const express = require('express');
const cors = require('cors');
const app = express();

// CORS liberado para o frontend
app.use(cors({
    origin: ['https://dellasa-ai-sistema.vercel.app', 'http://localhost:3000']
}));

app.use(express.json());

// ROTA RAIZ - Para testar se está online
app.get('/', (req, res) => {
    res.json({ 
        mensagem: 'Backend SIMPLES do Açaí Online!',
        status: 'OK' 
    });
});

// ROTA DE PEDIDOS (FAKE) - Para o frontend não quebrar
app.get('/api/pedidos', (req, res) => {
    console.log('📭 Retornando lista de pedidos fake');
    res.json([
        { 
            id: 1, 
            numero_pedido: 'TEST001', 
            cliente_nome: 'Cliente Teste',
            itens: [{ nome: 'Açaí 500ml', preco: 20 }],
            valor_total: 20,
            status: 'novo',
            forma_pagamento: 'dinheiro'
        }
    ]);
});

// ROTA PARA CRIAR PEDIDO (FAKE) - COM LOGS DETALHADOS
app.post('/api/pedidos/novo', (req, res) => {
    console.log('✅ ROTA POST /api/pedidos/novo ACESSADA');
    console.log('📦 Corpo da requisição (req.body):', req.body);
    console.log('🔍 Método da requisição (req.method):', req.method);
    console.log('🌐 URL original (req.originalUrl):', req.originalUrl);
    
    // Simula um processamento bem-sucedido
    res.json({ 
        success: true,
        mensagem: 'Pedido criado com sucesso (modo teste)!', 
        pedido: { 
            id: Date.now(), 
            numero_pedido: 'AÇ' + Date.now().toString().slice(-6),
            cliente_nome: req.body?.cliente_nome || 'Cliente',
            itens: req.body?.itens || []
        } 
    });
});

// ROTA EXTRA PARA DIAGNÓSTICO: Captura TODAS as requisições para /api/pedidos/*
app.all('/api/pedidos/*', (req, res) => {
    console.log('⚠️ ROTA NÃO MAPEADA ACESSADA:');
    console.log('   Método:', req.method);
    console.log('   URL:', req.originalUrl);
    console.log('   Corpo:', req.body);
    res.status(404).json({ 
        error: 'Rota não encontrada',
        received: {
            method: req.method,
            url: req.originalUrl
        }
    });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`✅ Backend SIMPLES rodando na porta ${PORT}`);
    console.log(`🌐 Frontend permitido: https://dellasa-ai-sistema.vercel.app`);
});
