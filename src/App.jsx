import React from 'react';
import { GameProvider, useGame } from './context/GameContext';
import Auth from './components/auth/Auth';
import GameCanvas from './components/game/GameCanvas';
import HUD from './components/hud/HUD';
import BottomPanel from './components/panels/BottomPanel';
import PortalMenu from './components/modals/PortalMenu';
import AdminPage from './components/auth/AdminPage';

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
      overflow: 'auto'
    }}>
      <div style={{
        position: 'relative',
        width: '430px',
        height: '932px',
        flexShrink: 0,
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
  // Simple routing
  const path = window.location.pathname;
  if (path === '/admin') {
    return <AdminPage />;
  }

  return (
    <GameProvider>
      <GameContent />
    </GameProvider>
  );
}

export default App;
