const { Pool } = require('pg');

// Configuração do Supabase
const pool = new Pool({
  user: 'postgres',
  password: '@Grnda123', // Coloque sua senha aqui
  host: 'https://hompukyesfdheteifbme.supabase.co', // Seu host do Supabase
  port: 5432,
  database: 'postgres',
  ssl: {
    rejectUnauthorized: false // Necessário para Supabase
  }
});

// Testar conexão
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Erro ao conectar ao Supabase:', err);
  } else {
    console.log('✅ Conectado ao Supabase PostgreSQL:', res.rows[0]);
  }
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};
