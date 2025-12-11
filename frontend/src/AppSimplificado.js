// AppSimplificado.js - Versão mínima para fazer deploy
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function AppSimplificado() {
  const [pedidos, setPedidos] = useState([]);
  
  // Carrega pedidos básicos
  useEffect(() => {
    const carregar = async () => {
      try {
        const res = await axios.get('https://dellasa-ai-sistema.onrender.com/api/pedidos');
        setPedidos(res.data || []);
      } catch (err) {
        console.error('Erro:', err);
      }
    };
    carregar();
  }, []);
  
  return (
    <div className="App">
      <header className="app-header">
        <h1>Sistema Açaí - Versão Simplificada</h1>
        <p>Gestão de pedidos</p>
      </header>
      
      <main>
        <h2>Pedidos: {pedidos.length}</h2>
        <div style={{padding: '20px', textAlign: 'center'}}>
          <p>Interface completa em breve...</p>
          <button onClick={() => window.location.reload()}>
            Atualizar
          </button>
        </div>
      </main>
    </div>
  );
}

export default AppSimplificado;
