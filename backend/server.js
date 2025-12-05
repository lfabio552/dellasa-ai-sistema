const express = require('express');
const cors = require('cors');
const app = express();
const pedidosRoutes = require('./src/routes/pedidos');

// Configurações
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rotas
app.use('/api/pedidos', pedidosRoutes);

// Rota inicial
app.get('/', (req, res) => {
  res.json({ mensagem: 'Sistema de Açaí - Backend Online!' });
});

// Iniciar servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📱 Acesse: http://localhost:${PORT}`);
});