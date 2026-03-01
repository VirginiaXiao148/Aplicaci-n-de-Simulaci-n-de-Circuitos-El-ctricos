import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SimulatorPage from './pages/SimulatorPage';
import HomePage from './pages/HomePage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/simulator" element={<SimulatorPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
