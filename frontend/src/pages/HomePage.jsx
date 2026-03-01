import React from 'react';
import { useNavigate } from 'react-router-dom';

function HomePage() {
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: '24px' }}>
      <h1>Simulador de Circuitos Eléctricos</h1>
      <p>Diseña y simula circuitos eléctricos de forma interactiva.</p>
      <button onClick={() => navigate('/simulator')} style={{ padding: '12px 32px', fontSize: '1rem' }}>
        Comenzar →
      </button>
    </div>
  );
}

export default HomePage;
