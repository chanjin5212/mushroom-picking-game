import React from 'react';
import { GameProvider } from './context/GameContext';
import GameCanvas from './components/GameCanvas';
import HUD from './components/HUD';
import Shop from './components/Shop';
import PortalMenu from './components/PortalMenu';

function App() {
  return (
    <GameProvider>
      <div className="App" style={{ width: '100vw', height: '100vh', position: 'relative' }}>
        <GameCanvas />
        <HUD />
        <Shop />
        <PortalMenu />
      </div>
    </GameProvider>
  );
}

export default App;
