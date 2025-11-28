import React from 'react';
import { GameProvider, useGame } from './context/GameContext';
import Auth from './components/Auth';
import GameCanvas from './components/GameCanvas';
import HUD from './components/HUD';
import BottomPanel from './components/BottomPanel';
import PortalMenu from './components/PortalMenu';

function GameContent() {
  const { state } = useGame();

  if (!state.user) {
    return <Auth />;
  }

  return (
    <div className="App" style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#1a1a1a',
      overflow: 'hidden'
    }}>
      <div style={{
        position: 'relative',
        width: 'min(100vw, calc(100vh * 9 / 16))',
        height: 'min(100vh, calc(100vw * 16 / 9))',
        maxWidth: '430px',
        maxHeight: '932px',
        backgroundColor: '#fff',
        overflow: 'hidden',
        boxShadow: '0 0 50px rgba(0,0,0,0.5)'
      }}>
        <GameCanvas />
        <HUD />
        <BottomPanel />
        <PortalMenu />
      </div>
    </div>
  );
}

function App() {
  return (
    <GameProvider>
      <GameContent />
    </GameProvider>
  );
}

export default App;
