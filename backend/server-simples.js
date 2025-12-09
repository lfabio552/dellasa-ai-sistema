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

// ROTA PARA CRIAR PEDIDO (FAKE)
app.post('/api/pedidos/novo', (req, res) => {
    console.log('📝 Recebido pedido fake:', req.body);
    res.json({ 
        mensagem: 'Pedido criado (modo teste)!', 
        pedido: { 
            id: Date.now(), 
            numero_pedido: 'TEST' + Date.now().toString().slice(-6)
        } 
    });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`✅ Backend SIMPLES rodando na porta ${PORT}`);
    console.log(`🌐 Frontend permitido: https://dellasa-ai-sistema.vercel.app`);
});
