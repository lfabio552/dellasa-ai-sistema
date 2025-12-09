const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

// ==========================================
// CONFIGURAÇÃO CORS (CRÍTICA PARA O FRONTEND)
// ==========================================
const allowedOrigins = [
    'http://localhost:3000', // Para desenvolvimento local
    'https://dellasa-ai-sistema.vercel.app' // SUA URL DO VERCEL
];

app.use(cors({
    origin: function (origin, callback) {
        // Permite requisições sem 'origin' (como mobile apps)
        if (!origin) return callback(null, true);
        
        // Verifica se a origem está na lista de permitidas
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            // Se quiser ser mais permissivo durante testes, use isto:
            // callback(null, true); // ⚠️ CUIDADO: Isso permite TODAS as origens
            // Para produção, mantenha o erro abaixo:
            callback(new Error('Não permitido por CORS - Origem: ' + origin));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

// ==========================================
// MIDDLEWARES
// ==========================================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==========================================
// ROTAS DA API
// ==========================================
const pedidosRoutes = require('./src/routes/Pedidos.js'); // ✅ CORRIGIDO: adicionado .js
app.use('/api/pedidos', pedidosRoutes);

// ==========================================
// ROTA DE SAÚDE/STATUS
// ==========================================
app.get('/', (req, res) => {
    res.json({ 
        mensagem: 'Sistema de Açaí - Backend Online!',
        status: 'operacional',
        versao: '1.0.0',
        ambiente: process.env.NODE_ENV || 'desenvolvimento',
        cors_origins_permitidas: allowedOrigins,
        timestamp: new Date().toISOString()
    });
});

// ==========================================
// ROTA DE FALLBACK (404)
// ==========================================
app.use((req, res) => {
    res.status(404).json({ 
        erro: 'Rota não encontrada',
        path: req.path,
        metodo: req.method 
    });
});

// ==========================================
// INICIALIZAÇÃO DO SERVIDOR
// ==========================================
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`📡 Ambiente: ${process.env.NODE_ENV || 'desenvolvimento'}`);
    console.log(`🌐 Origins permitidas: ${allowedOrigins.join(', ')}`);
    console.log(`⏰ Iniciado em: ${new Date().toLocaleString('pt-BR')}`);
});
