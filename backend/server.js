const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

// Configurações
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rotas
const pedidosRoutes = require(path.join(__dirname, 'src', 'routes', 'pedidos'));
app.use('/api/pedidos', pedidosRoutes);

// Rota inicial
app.get('/', (req, res) => {
  res.json({ 
    mensagem: 'Sistema de Açaí - Backend Online!',
    status: 'operacional',
    versao: '1.0.0',
    ambiente: process.env.NODE_ENV || 'desenvolvimento'
  });
});

// Iniciar servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📱 Ambiente: ${process.env.NODE_ENV || 'desenvolvimento'}`);
});