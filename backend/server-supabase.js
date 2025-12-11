const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();

// CORS
app.use(cors({
  origin: ['https://dellasa-ai-sistema.vercel.app', 'http://localhost:3000']
}));

app.use(express.json());

// Configurar Supabase
const supabaseUrl = process.env.SUPABASE_URL || 'https://seu-projeto.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'sua-chave-anon';
const supabase = createClient(supabaseUrl, supabaseKey);

// ==================== ROTAS DE PEDIDOS ====================

// GET: Listar todos os pedidos
app.get('/api/pedidos', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('pedidos')
      .select('*')
      .order('data_criacao', { ascending: false });
    
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('Erro ao buscar pedidos:', err);
    res.status(500).json({ error: 'Erro ao buscar pedidos' });
  }
});

// POST: Criar novo pedido
app.post('/api/pedidos/novo', async (req, res) => {
  try {
    const pedido = req.body;
    
    // Gerar número do pedido
    const data = new Date();
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const sequencia = Math.floor(Math.random() * 999).toString().padStart(3, '0');
    pedido.numero_pedido = `AÇ${dia}${mes}${sequencia}`;
    
    const { data: novoPedido, error } = await supabase
      .from('pedidos')
      .insert([pedido])
      .select()
      .single();
    
    if (error) throw error;
    
    // Se for pedido A PRAZO, atualiza saldo do cliente
    if (pedido.forma_pagamento === 'a_prazo' && pedido.cliente_fiel_id) {
      await supabase.rpc('incrementar_saldo', {
        cliente_id: pedido.cliente_fiel_id,
        valor: pedido.valor_total
      });
    }
    
    res.json({ 
      success: true, 
      mensagem: 'Pedido criado com sucesso!',
      pedido: novoPedido
    });
  } catch (err) {
    console.error('Erro ao criar pedido:', err);
    res.status(500).json({ error: 'Erro ao criar pedido' });
  }
});

// PUT: Atualizar status do pedido
app.put('/api/pedidos/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const updates = { status };
    if (status === 'entregue') {
      updates.data_entregue = new Date().toISOString();
    }
    
    const { error } = await supabase
      .from('pedidos')
      .update(updates)
      .eq('id', id);
    
    if (error) throw error;
    res.json({ mensagem: `Status atualizado para: ${status}` });
  } catch (err) {
    console.error('Erro ao atualizar status:', err);
    res.status(500).json({ error: 'Erro ao atualizar status' });
  }
});

// ==================== ROTAS DE CLIENTES ====================

// GET: Listar clientes fiéis
app.get('/api/clientes-fieis', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('clientes_fieis')
      .select('*')
      .order('nome');
    
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('Erro ao buscar clientes:', err);
    res.status(500).json({ error: 'Erro ao buscar clientes' });
  }
});

// POST: Criar cliente fiel
app.post('/api/clientes-fieis/novo', async (req, res) => {
  try {
    const cliente = req.body;
    
    const { data: novoCliente, error } = await supabase
      .from('clientes_fieis')
      .insert([cliente])
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({ 
      success: true,
      mensagem: 'Cliente criado com sucesso!',
      cliente: novoCliente
    });
  } catch (err) {
    console.error('Erro ao criar cliente:', err);
    res.status(500).json({ error: 'Erro ao criar cliente' });
  }
});

// ==================== ROTA DE TESTE ====================
app.get('/', (req, res) => {
  res.json({ 
    mensagem: 'Backend com Supabase Online!',
    status: 'operacional',
    banco: 'PostgreSQL (Supabase)',
    timestamp: new Date().toISOString()
  });
});

// ==================== INICIAR SERVIDOR ====================
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor com Supabase rodando na porta ${PORT}`);
  console.log(`📊 Banco: PostgreSQL no Supabase`);
});
