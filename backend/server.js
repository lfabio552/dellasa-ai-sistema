// Substitua a linha que contém app.use(cors(...)) por isso:
const cors = require('cors');

// Configure os domínios permitidos
const allowedOrigins = [
    'http://localhost:3000', // Para desenvolvimento local
    'https://dellasa-ai-sistema.vercel.app', // SUA URL DO VERCEL - ATUALIZE AQUI!
    'https://dellasa-ai-sistema-*.vercel.app' // Permite todas as sub-URLs do Vercel
];

app.use(cors({
    origin: function (origin, callback) {
        // Permite requisições sem 'origin' (como apps mobile ou curl)
        if (!origin) return callback(null, true);
        if (allowedOrigins.some(allowedUrl => origin.startsWith(allowedUrl.replace('*', '')))) {
            callback(null, true);
        } else {
            callback(new Error('Não permitido por CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
