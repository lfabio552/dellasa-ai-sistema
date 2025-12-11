import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CadastroClienteFiel from './CadastroClienteFiel';

const API_URL = 'https://dellasa-ai-sistema.onrender.com/api';

const GerenciarClientes = ({ onClose, onClienteSelecionado }) => {
  const [clientes, setClientes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [mostrarCadastro, setMostrarCadastro] = useState(false);
  const [clienteEditando, setClienteEditando] = useState(null);

  const carregarClientes = async () => {
    try {
      setCarregando(true);
      const response = await axios.get(`${API_URL}/clientes-fieis`);
      setClientes(response.data || []);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
      setClientes([]);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarClientes();
  }, []);

  const handleExcluirCliente = async (id, nome) => {
    if (!window.confirm(`Tem certeza que deseja excluir o cliente "${nome}"?`)) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/clientes-fieis/${id}`);
      alert('Cliente excluído com sucesso!');
      carregarClientes(); // Recarrega a lista
    } catch (error) {
      console.error('Erro ao excluir cliente:', error);
      alert(error.response?.data?.erro || 'Erro ao excluir cliente');
    }
  };

  const handleClienteCadastrado = (novoCliente) => {
    carregarClientes(); // Recarrega a lista
    setMostrarCadastro(false);
    setClienteEditando(null);
  };

  const formatarSaldo = (saldo) => {
    return saldo > 0 ? `🔴 Deve: R$ ${saldo.toFixed(2)}` : `✅ Em dia`;
  };

  if (mostrarCadastro) {
    return (
      <CadastroClienteFiel
        onClienteCadastrado={handleClienteCadastrado}
        onClose={() => {
          setMostrarCadastro(false);
          setClienteEditando(null);
        }}
      />
    );
  }

  return (
    <div className="modal-overlay">
      <div className="modal modal-grande">
        <div className="modal-header">
          <h3><i className="fas fa-users"></i> Gerenciar Clientes Fiéis</h3>
          <button onClick={onClose} className="btn-fechar">
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <div className="modal-conteudo">
          <div className="modal-acoes">
            <button 
              onClick={() => setMostrarCadastro(true)}
              className="btn-novo-cliente"
            >
              <i className="fas fa-user-plus"></i> Novo Cliente Fiel
            </button>
            
            <button 
              onClick={carregarClientes}
              className="btn-atualizar"
              disabled={carregando}
            >
              <i className="fas fa-sync"></i> Atualizar
            </button>
          </div>
          
          {carregando ? (
            <div className="carregando-lista">
              <i className="fas fa-spinner fa-spin"></i> Carregando clientes...
            </div>
          ) : clientes.length === 0 ? (
            <div className="sem-clientes">
              <i className="fas fa-user-slash"></i>
              <h4>Nenhum cliente fiel cadastrado</h4>
              <p>Cadastre seu primeiro cliente para oferecer crédito.</p>
              <button 
                onClick={() => setMostrarCadastro(true)}
                className="btn-principal"
              >
                <i className="fas fa-user-plus"></i> Cadastrar Primeiro Cliente
              </button>
            </div>
          ) : (
            <div className="lista-clientes">
              <div className="total-clientes">
                <strong>{clientes.length}</strong> cliente(s) cadastrado(s)
              </div>
              
              <table className="tabela-clientes">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Telefone</th>
                    <th>Limite</th>
                    <th>Saldo</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {clientes.map(cliente => (
                    <tr key={cliente.id}>
                      <td>
                        <strong>{cliente.nome}</strong>
                        {cliente.observacoes && (
                          <div className="cliente-obs">{cliente.observacoes}</div>
                        )}
                      </td>
                      <td>{cliente.telefone || '--'}</td>
                      <td>R$ {cliente.limite_credito.toFixed(2)}</td>
                      <td className={cliente.saldo_atual > 0 ? 'saldo-negativo' : 'saldo-positivo'}>
                        {formatarSaldo(cliente.saldo_atual)}
                      </td>
                      <td className="acoes-cliente">
                        {onClienteSelecionado && (
                          <button
                            onClick={() => {
                              onClienteSelecionado(cliente);
                              onClose();
                            }}
                            className="btn-selecionar"
                            title="Usar este cliente"
                          >
                            <i className="fas fa-check"></i>
                          </button>
                        )}
                        
                        <button
                          onClick={() => handleExcluirCliente(cliente.id, cliente.nome)}
                          className="btn-excluir"
                          title="Excluir cliente"
                          disabled={cliente.saldo_atual > 0}
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                        
                        {cliente.saldo_atual > 0 && (
                          <span className="aviso-saldo" title="Não pode excluir com saldo pendente">
                            <i className="fas fa-exclamation-triangle"></i>
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              <div className="resumo-clientes">
                <div className="resumo-item">
                  <span className="resumo-label">Total Devido:</span>
                  <span className="resumo-valor negativo">
                    R$ {clientes.reduce((soma, c) => soma + (c.saldo_atual > 0 ? c.saldo_atual : 0), 0).toFixed(2)}
                  </span>
                </div>
                <div className="resumo-item">
                  <span className="resumo-label">Clientes com saldo:</span>
                  <span className="resumo-valor">
                    {clientes.filter(c => c.saldo_atual > 0).length}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="modal-footer">
          <button onClick={onClose} className="btn-fechar-modal">
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default GerenciarClientes;
