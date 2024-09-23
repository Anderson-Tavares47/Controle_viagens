'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ProdutoPage = () => {
  const [produtos, setProdutos] = useState([]);
  const API_KEY = "tpfTech"; // Chave da API

  // Função para buscar produtos
  useEffect(() => {
    const fetchProdutos = async () => {
      try {
        const response = await axios.get('https://back-eight-chi.vercel.app/produtos/descricao', { 
          headers: { 'api-key': API_KEY }
        });
        console.log(response.data)
        setProdutos(response.data);
      } catch (error) {
        console.error("Erro ao buscar produtos:", error);
      }
    };

    fetchProdutos();
  }, []);

  // Função para converter base64 em Blob e criar um URL
  const base64ToBlobUrl = (base64, mimeType) => {
    const byteCharacters = atob(base64);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512);
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }

    const blob = new Blob(byteArrays, { type: mimeType });
    return URL.createObjectURL(blob);
  };

  return (
    <div>
      <h2>Produtos</h2>

      <ul>
        {produtos.length > 0 ? (
          produtos.map((produto) => (
            <li key={produto.id}>
              <h3>{produto.nome_produto}</h3>
              <p>{produto.descricao}</p>
              <p>Categoria: {produto.categoria}</p>
              <p>Nível de Ensino: {produto.nivel_ensino}</p>
              <p>Valor: R${produto.valor}</p>
              <p>Componente Curricular: {produto.componente_curricular}</p>

              {produto.fotos && produto.fotos.length > 0 && (
                <div>
                  <h4>Fotos:</h4>
                  {produto.fotos.map((foto, index) => (
                    <img key={index} src={`data:image/jpeg;base64,${foto}`} alt="Produto" style={{ maxWidth: '200px', marginBottom: '10px' }} />
                  ))}
                </div>
              )}

              {produto.pdf && (
                <div>
                  <h4>PDF:</h4>
                  <iframe
                    src={base64ToBlobUrl(produto.pdf, 'application/pdf')}
                    width="100%"
                    height="500px"
                    title={`PDF do produto ${produto.nome_produto}`}
                  />
                </div>
              )}
            </li>
          ))
        ) : (
          <p>Nenhum produto encontrado</p>
        )}
      </ul>
    </div>
  );
};

export default ProdutoPage;
