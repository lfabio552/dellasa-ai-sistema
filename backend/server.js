const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

// ==========================================
// CONFIGURAÇÃO CORS (CRÍTICA PARA O FRONTEND)
// ==========================================
const allowedOrigins = [
    'http://localhost:3000',
    'https://dellasa-ai-sistema.vercel.app',
    'https://dellasa-ai-sistema-*.vercel.app'
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        
        // Verifica se a origem está na lista de permitidas
        const isAllowed = allowedOrigins.some(allowedUrl => {
            if (allowedUrl.includes('*')) {
                const baseUrl = allowedUrl.replace('*', '');
                return origin.startsWith(baseUrl);
            }
            return origin === allowedUrl;
        });
        
        if (isAllowed) {
            callback(null, true);
        } else {
            console.log('⚠️ Origem bloqueada por CORS:', origin);
            callback(new Error('Não permitido por CORS'));
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
const pedidosRoutes = require('./src/routes/Pedidos.js');
app.use('/api/pedidos', pedidosRoutes);

const clientesFieisRoutes = require('./src/routes/ClientesFieis.js');
app.use('/api/clientes-fieis', clientesFieisRoutes);

// ==========================================
// ROTAS PARA CLIENTES FIÉIS (alias para facilitar)
// ==========================================
// Estas rotas são apenas alias para facilitar o frontend
app.get('/api/clientes-fieis', (req, res) => {
    // Redireciona para a rota correta
    res.redirect(307, '/api/pedidos/clientes-fieis/todos');
});

app.get('/api/clientes-fieis/:id', (req, res) => {
    const { id } = req.params;
    res.redirect(307, `/api/pedidos/clientes-fieis/${id}`);
});

app.post('/api/clientes-fieis/:id/pagar', (req, res) => {
    const { id } = req.params;
    res.redirect(307, `/api/pedidos/clientes-fieis/${id}/pagar`);
});

// ==========================================
// ROTA DE SAÚDE/STATUS
// ==========================================
app.get('/', (req, res) => {
    res.json({ 
        sistema: 'Dellas Açaí - Backend',
        status: 'operacional',
        versao: '2.0.0',
        funcionalidades: [
            'Gestão de pedidos',
            'Clientes fiéis com fichas',
            'Controle financeiro detalhado',
            'Formas de pagamento: dinheiro, PIX, cartão, alelo, a prazo',
            'Importação de vendas passadas'
        ],
        ambiente: process.env.NODE_ENV || 'desenvolvimento',
        cors_origins_permitidas: allowedOrigins,
        timestamp: new Date().toISOString(),
        endpoints_principais: {
            pedidos: '/api/pedidos',
            clientes_fieis: '/api/clientes-fieis',
            teste: '/api/pedidos/teste/conexao'
        }
    });
});

// ==========================================
// ROTA DE TESTE RÁPIDO
// ==========================================
app.get('/teste', (req, res) => {
    res.json({ 
        mensagem: 'Backend do Açaí funcionando!',
        data: new Date().toLocaleString('pt-BR')
    });
});

// ==========================================
// ROTA DE FALLBACK (404)
// ==========================================
app.use((req, res) => {
    res.status(404).json({ 
        erro: 'Rota não encontrada',
        sistema: 'Dellas Açaí - Backend',
        sugestao: 'Verifique a rota ou consulte a documentação em /',
        path: req.path,
        metodo: req.method,
        timestamp: new Date().toISOString()
    });
});

// ==========================================
// MANIPULADOR DE ERROS GLOBAL
// ==========================================
app.use((err, req, res, next) => {
    console.error('❌ Erro global:', err.message);
    console.error('Stack:', err.stack);
    
    res.status(err.status || 500).json({
        erro: 'Erro interno do servidor',
        mensagem: process.env.NODE_ENV === 'production' ? 'Erro interno' : err.message,
        tipo: err.name || 'UnknownError',
        timestamp: new Date().toISOString()
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
    console.log(`🔗 URL: http://localhost:${PORT}`);
    console.log(`🎯 Funcionalidades carregadas:`);
    console.log(`   • Gestão completa de pedidos`);
    console.log(`   • Sistema de clientes fiéis`);
    console.log(`   • Controle financeiro detalhado`);
    console.log(`   • 6 formas de pagamento`);
    console.log(`   • Importação de vendas passadas`);
});
