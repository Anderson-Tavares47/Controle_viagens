'use client'

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ProdutoPage = () => {
  const [produtos, setProdutos] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null); // Arquivo PDF
  const [selectedFotos, setSelectedFotos] = useState([]); // Arquivos de fotos
  const [nomeProduto, setNomeProduto] = useState('');
  const [descricao, setDescricao] = useState('');
  const [categoria, setCategoria] = useState('');
  const [nivelEnsino, setNivelEnsino] = useState('');
  const [valor, setValor] = useState('');
  const [componenteCurricular, setComponenteCurricular] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0); // Progresso do upload
  const API_KEY = "tpfTech"; // Chave da API

  // Função para buscar produtos (já existente no seu código)
  // useEffect(() => {
  //   const fetchProdutos = async () => {
  //     try {
  //       const response = await axios.get('http://localhost:5000/produtos', { 
  //         headers: {
  //           'api-key': API_KEY
  //         }
  //       });
  //       console.log(response.data);
  //       setProdutos(response.data);
  //     } catch (error) {
  //       console.error("Erro ao buscar produtos:", error);
  //     }
  //   };

  //   fetchProdutos();
  // }, []);

  // Função para lidar com a seleção do arquivo PDF
  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  // Função para lidar com a seleção das fotos
  const handleFotosChange = (event) => {
    setSelectedFotos([...event.target.files]);
  };

  // Função para fazer o upload do PDF em partes
  const uploadPdfInParts = async (file) => {
    const partSize = 1024 * 1024 * 4; // 4 MB por parte
    const totalParts = Math.ceil(file.size / partSize);
    const nomeArquivo = file.name;

    for (let i = 0; i < totalParts; i++) {
      const start = i * partSize;
      const end = Math.min(start + partSize, file.size);

      const part = file.slice(start, end);  // Dividir o arquivo em partes
      const formData = new FormData();
      formData.append('part', part);
      formData.append('partIndex', i);
      formData.append('totalParts', totalParts);
      formData.append('nomeArquivo', nomeArquivo);
      formData.append('nome_produto', nomeProduto);
      formData.append('descricao', descricao);
      formData.append('categoria', categoria);
      formData.append('nivel_ensino', nivelEnsino);
      formData.append('valor', valor);
      formData.append('componente_curricular', componenteCurricular);

      // Adicionar as fotos apenas na primeira parte
      if (i === 0 && selectedFotos.length > 0) {
        selectedFotos.forEach((foto, index) => {
          formData.append('fotos', foto);
        });
      }

      try {
        // Enviar a parte para o servidor
        const response = await fetch('https://back-eight-chi.vercel.app/adicionar-produto-v2', {
          method: 'POST',
          headers: {
            'api-key': API_KEY
          },
          body: formData
        });

        if (!response.ok) {
          console.error(`Erro ao enviar parte ${i + 1} de ${totalParts}`);
          return;
        }

        console.log(`Parte ${i + 1} de ${totalParts} enviada com sucesso`);

        // Atualizar progresso do upload
        setUploadProgress(((i + 1) / totalParts) * 100);
      } catch (error) {
        console.error("Erro ao enviar a parte:", error);
        return;
      }
    }

    console.log("Upload completo");
    alert("PDF e Produto enviados com sucesso!");
    setUploadProgress(0); // Resetar progresso após upload
  };

  // Função chamada ao submeter o formulário
  const handleUploadSubmit = (event) => {
    event.preventDefault();

    if (selectedFile) {
      uploadPdfInParts(selectedFile);
    } else {
      alert("Selecione um arquivo PDF para enviar");
    }
  };

  return (
    <div>
      <h2>Produtos</h2>

      {/* Formulário de Upload */}
      <form onSubmit={handleUploadSubmit}>
        <input 
          type="text" 
          placeholder="Nome do Produto" 
          value={nomeProduto}
          onChange={(e) => setNomeProduto(e.target.value)} 
          required 
        />
        <textarea 
          placeholder="Descrição" 
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)} 
          required 
        />
        <input 
          type="text" 
          placeholder="Categoria" 
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)} 
          required 
        />
        <input 
          type="text" 
          placeholder="Nível de Ensino" 
          value={nivelEnsino}
          onChange={(e) => setNivelEnsino(e.target.value)} 
          required 
        />
        <input 
          type="number" 
          placeholder="Valor" 
          value={valor}
          onChange={(e) => setValor(e.target.value)} 
          required 
        />
        <input 
          type="text" 
          placeholder="Componente Curricular" 
          value={componenteCurricular}
          onChange={(e) => setComponenteCurricular(e.target.value)} 
          required 
        />
        
        <input type="file" accept="application/pdf" onChange={handleFileChange} required />
        <input type="file" accept="image/*" multiple onChange={handleFotosChange} />
        <button type="submit">Enviar Produto e PDF</button>
      </form>

      {/* Exibir progresso do upload */}
      {uploadProgress > 0 && (
        <div>
          <p>Progresso do upload: {uploadProgress.toFixed(2)}%</p>
        </div>
      )}

      <ul>
        {produtos.map((produto) => (
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
                <a href={`data:application/pdf;base64,${Buffer.from(produto.pdf).toString('base64')}`} download={`${produto.nome_produto}.pdf`}>
                  Baixar PDF
                </a>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProdutoPage;
