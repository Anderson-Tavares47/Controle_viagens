'use client'

import { useState } from 'react';
import Sidebar from './sidebar';

export default function Layout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <main
        style={{
          flexGrow: 1,
          marginLeft: isSidebarOpen ? '240px' : '60px', // Ajusta com base na largura do Sidebar
          padding: '20px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh', // Garante que o conteúdo ocupe a altura total da tela
          transition: 'margin-left 0.3s ease', // Transição suave ao abrir/fechar o Sidebar
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '1200px',
            textAlign: 'center',
            padding: '20px',
            boxSizing: 'border-box',
          }}
        >
          {children}
        </div>
      </main>
    </div>
  );
}
