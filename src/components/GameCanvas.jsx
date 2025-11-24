import React, { useEffect, useRef, useState } from 'react';
import { useGame } from '../context/GameContext';
import Player from './Player';
import Mushroom from './Mushroom';
import Joystick from './Joystick';
import LoadingScreen from './LoadingScreen';

const GameCanvas = () => {
    const { state, dispatch } = useGame();
    const containerRef = useRef(null);
    const [damageNumbers, setDamageNumbers] = useState([]);

    // Direct DOM Refs
    const playerDOMRef = useRef(null);

    // Logic Refs (No Re-renders)
    const playerPosRef = useRef(state.playerPos);
    const stateRef = useRef(state);
    const keysRef = useRef({});
    const joystickRef = useRef({ x: 0, y: 0 });
    const requestRef = useRef();
    const attackIntervalRef = useRef(null);

    // Game Loop Logic (Ref-based to avoid stale closures)
    const loopRef = useRef();
    const lastFrameTimeRef = useRef(Date.now());
    const watchdogRef = useRef(null);

    // NPC Logic - will be positioned dynamically based on container size
    const [npcPos, setNpcPos] = useState({ x: 250, y: 250 });
    const [showShopBtn, setShowShopBtn] = useState(false);

    // Portal Logic - positioned dynamically
    const [portalPos, setPortalPos] = useState({ x: 600, y: 300 });
    const [showPortalBtn, setShowPortalBtn] = useState(false);

    // Update NPC and Portal positions based on container size
    useEffect(() => {
        if (containerRef.current) {
            const { clientWidth, clientHeight } = containerRef.current;
            setNpcPos({
                x: clientWidth * 0.3,
                y: clientHeight * 0.35
            });
            setPortalPos({
                x: clientWidth * 0.7,
                y: clientHeight * 0.5
            });
        }
    }, [state.currentScene]);

    // Sync state to ref
    useEffect(() => {
        stateRef.current = state;
    }, [state]);

    // Force Position Update ONLY when Loading Finishes
    useEffect(() => {
        if (!state.isLoading) {
            // Sync local ref with global state when loading finishes
            playerPosRef.current = { ...state.playerPos };

            // Force DOM update immediately
            if (playerDOMRef.current) {
                playerDOMRef.current.style.transform = `translate(${state.playerPos.x}px, ${state.playerPos.y}px)`;
            }
        }
    }, [state.isLoading]);

    // Handle Input
    useEffect(() => {
        const handleKeyDown = (e) => {
            keysRef.current[e.code] = true;
        };
        const handleKeyUp = (e) => {
            keysRef.current[e.code] = false;
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    // Helper to update DOM
    const updatePlayerDOM = () => {
        if (playerDOMRef.current) {
            playerDOMRef.current.style.transform = `translate(${playerPosRef.current.x}px, ${playerPosRef.current.y}px)`;
        }
    };

    // Attack Logic
    const performAttack = () => {
        const currentState = stateRef.current;
        if (currentState.currentScene === 'village') return;

        const playerCenter = {
            x: playerPosRef.current.x + 20,
            y: playerPosRef.current.y + 20
        };

        currentState.mushrooms.forEach(mushroom => {
            if (mushroom.isDead) return;

            const mushroomCenter = {
                x: mushroom.x + (mushroom.type === 'boss' ? 50 : 25),
                y: mushroom.y + (mushroom.type === 'boss' ? 50 : 25)
            };

            const dist = Math.hypot(playerCenter.x - mushroomCenter.x, playerCenter.y - mushroomCenter.y);
            const range = mushroom.type === 'boss' ? 120 : 80;

            if (dist < range) {
                const damage = currentState.clickDamage;

                // Create floating damage number
                const damageId = Date.now() + Math.random();
                setDamageNumbers(prev => [...prev, {
                    id: damageId,
                    damage: damage,
                    x: mushroom.x,
                    y: mushroom.y
                }]);

                // Remove after animation
                setTimeout(() => {
                    setDamageNumbers(prev => prev.filter(d => d.id !== damageId));
                }, 1000);

                dispatch({ type: 'DAMAGE_MUSHROOM', payload: { id: mushroom.id, damage: damage } });

                if (mushroom.hp - damage <= 0) {
                    dispatch({ type: 'ADD_GOLD', payload: mushroom.reward });
                }
            }
        });
    };

    // Auto Attack Management
    const startAutoAttack = () => {
        performAttack();
        if (attackIntervalRef.current) clearInterval(attackIntervalRef.current);
        attackIntervalRef.current = setInterval(performAttack, 100);
    };

    const stopAutoAttack = () => {
        if (attackIntervalRef.current) {
            clearInterval(attackIntervalRef.current);
            attackIntervalRef.current = null;
        }
    };

    // Spacebar Listeners
    useEffect(() => {
        const handleDown = (e) => {
            if (e.code === 'Space' && !attackIntervalRef.current) startAutoAttack();
        };
        const handleKeyUp = (e) => {
            if (e.code === 'Space') stopAutoAttack();
        };
        window.addEventListener('keydown', handleDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);


    // Game Loop
    const update = () => {
        try {
            lastFrameTimeRef.current = Date.now();

            if (containerRef.current && !stateRef.current.isLoading) {
                const currentState = stateRef.current;
                let { x, y } = playerPosRef.current;
                const speed = currentState.moveSpeed;
                const { clientWidth, clientHeight } = containerRef.current;

                // Movement
                let dx = 0;
                let dy = 0;

                if (keysRef.current['ArrowUp'] || keysRef.current['KeyW']) dy -= speed;
                if (keysRef.current['ArrowDown'] || keysRef.current['KeyS']) dy += speed;
                if (keysRef.current['ArrowLeft'] || keysRef.current['KeyA']) dx -= speed;
                if (keysRef.current['ArrowRight'] || keysRef.current['KeyD']) dx += speed;

                if (joystickRef.current.x !== 0 || joystickRef.current.y !== 0) {
                    dx += joystickRef.current.x * speed;
                    dy += joystickRef.current.y * speed;
                }

                x += dx;
                y += dy;

                // Boundary
                x = Math.max(0, Math.min(clientWidth - 40, x));
                y = Math.max(0, Math.min(clientHeight - 40, y));

                // Update Local Ref
                playerPosRef.current = { x, y };

                // Direct DOM Update
                updatePlayerDOM();

                // Portal Logic
                if (currentState.currentScene === 'village') {
                    // NPC Proximity Check
                    const distToNpc = Math.hypot((x + 20) - npcPos.x, (y + 20) - npcPos.y);
                    if (distToNpc < 80) {
                        if (!showShopBtn) setShowShopBtn(true);
                    } else {
                        if (showShopBtn) setShowShopBtn(false);
                    }

                    // Portal Proximity Check
                    const distToPortal = Math.hypot((x + 20) - portalPos.x, (y + 20) - portalPos.y);
                    if (distToPortal < 100) {
                        if (!showPortalBtn) setShowPortalBtn(true);
                    } else {
                        if (showPortalBtn) setShowPortalBtn(false);
                    }
                } else {
                    // Hide buttons if not in village
                    if (showShopBtn) setShowShopBtn(false);
                    if (showPortalBtn) setShowPortalBtn(false);
                }

                // Respawn Check
                currentState.mushrooms.forEach(m => {
                    if (m.isDead && m.respawnTime > 0 && Date.now() > m.respawnTime) {
                        dispatch({ type: 'RESPAWN_MUSHROOM', payload: { id: m.id } });
                    }
                });
            }
        } catch (error) {
            console.error("Game Loop Error:", error);
        }

        requestRef.current = requestAnimationFrame(loopRef.current);
    };

    // Store the latest update function in a ref
    useEffect(() => {
        loopRef.current = update;
    });

    // Start/Stop Loop & Watchdog
    useEffect(() => {
        const startLoop = () => {
            if (!requestRef.current) {
                requestRef.current = requestAnimationFrame(loopRef.current);
            }
        };

        startLoop();

        // Watchdog: Restart loop if it hangs
        watchdogRef.current = setInterval(() => {
            const timeSinceLastFrame = Date.now() - lastFrameTimeRef.current;
            if (timeSinceLastFrame > 1000) {
                console.warn("Game Loop Hang Detected! Restarting...");
                cancelAnimationFrame(requestRef.current);
                requestRef.current = requestAnimationFrame(loopRef.current);
                lastFrameTimeRef.current = Date.now();
            }
        }, 1000);

        return () => {
            cancelAnimationFrame(requestRef.current);
            clearInterval(watchdogRef.current);
        };
    }, []);

    const triggerSceneSwitch = (scene, targetPos) => {
        // Prevent multiple triggers
        if (stateRef.current.isLoading) return;

        dispatch({ type: 'SET_LOADING', payload: true });

        setTimeout(() => {
            keysRef.current = {};
            joystickRef.current = { x: 0, y: 0 };

            // We update the global state, and let the useEffect sync it back to local ref
            dispatch({ type: 'SWITCH_SCENE', payload: { scene, pos: targetPos } });
        }, 1000);
    };

    // Background Color based on scene
    const getBackgroundColor = () => {
        if (state.currentScene === 'village') return '#a5d6a7';
        if (state.currentScene.startsWith('forest')) return '#81c784';
        if (state.currentScene.startsWith('cave')) return '#424242';
        if (state.currentScene.startsWith('mountain')) return '#5d4037';
        if (state.currentScene.startsWith('abyss')) return '#1a1a1a';
        if (state.currentScene === 'throne') return '#4a148c';
        return '#a5d6a7';
    };

    return (
        <div
            ref={containerRef}
            style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                backgroundColor: getBackgroundColor(),
                overflow: 'hidden',
                transition: 'background-color 0.5s'
            }}
        >
            {state.isLoading && <LoadingScreen />}

            {/* Village Scene */}
            {!state.isLoading && state.currentScene === 'village' && (
                <>
                    <div style={{ position: 'absolute', top: 50, left: 100, fontSize: '50px' }}>🏠</div>
                    <div style={{ position: 'absolute', top: 200, left: 300, fontSize: '30px' }}>🌳</div>
                    <div style={{ position: 'absolute', top: 400, left: 100, fontSize: '30px' }}>🌳</div>

                    {/* NPC */}
                    <div style={{
                        position: 'absolute',
                        top: npcPos.y - 30,
                        left: npcPos.x - 30,
                        fontSize: '60px',
                        zIndex: 50,
                        textAlign: 'center'
                    }}>
                        🧙‍♂️
                        <div style={{ fontSize: '14px', fontWeight: 'bold', background: 'rgba(139, 69, 19, 0.8)', color: 'white', borderRadius: '8px', padding: '4px 8px', marginTop: '5px', border: '2px solid #fff' }}>⚔️ 무기 상인</div>
                    </div>

                    {/* Shop Interaction Button */}
                    {showShopBtn && !state.isShopOpen && (
                        <button
                            onClick={() => dispatch({ type: 'TOGGLE_SHOP' })}
                            style={{
                                position: 'absolute',
                                top: npcPos.y - 70,
                                left: npcPos.x - 50,
                                padding: '10px 16px',
                                backgroundColor: '#ff9800',
                                color: 'white',
                                border: '3px solid white',
                                borderRadius: '25px',
                                cursor: 'pointer',
                                zIndex: 100,
                                fontWeight: 'bold',
                                fontSize: '16px',
                                boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
                            }}
                        >
                            🛒 상점 열기
                        </button>
                    )}

                    {/* Portal */}
                    <div style={{
                        position: 'absolute',
                        top: portalPos.y - 40,
                        left: portalPos.x - 40,
                        textAlign: 'center',
                        zIndex: 50
                    }}>
                        <div style={{
                            fontSize: '80px',
                            animation: 'spin 3s linear infinite'
                        }}>
                            🌀
                        </div>
                        <div style={{ fontSize: '14px', fontWeight: 'bold', background: 'rgba(75, 0, 130, 0.8)', color: 'white', borderRadius: '8px', padding: '4px 8px', marginTop: '-10px', border: '2px solid #fff' }}>🚪 포탈</div>
                    </div>

                    {/* Portal Interaction Button */}
                    {showPortalBtn && !state.isPortalMenuOpen && (
                        <button
                            onClick={() => dispatch({ type: 'TOGGLE_PORTAL_MENU' })}
                            style={{
                                position: 'absolute',
                                top: portalPos.y - 80,
                                left: portalPos.x - 50,
                                padding: '10px 16px',
                                backgroundColor: '#9c27b0',
                                color: 'white',
                                border: '3px solid white',
                                borderRadius: '25px',
                                cursor: 'pointer',
                                zIndex: 100,
                                fontWeight: 'bold',
                                fontSize: '16px',
                                boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
                            }}
                        >
                            🌀 포탈 이동
                        </button>
                    )}
                </>
            )}

            {/* Other Scenes - Return to Village Button */}
            {!state.isLoading && state.currentScene !== 'village' && (
                <>
                    <button
                        onClick={() => {
                            const centerPos = { x: 400, y: 300 };
                            triggerSceneSwitch('village', centerPos);
                        }}
                        style={{
                            position: 'absolute',
                            top: 20,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            padding: '12px 24px',
                            backgroundColor: '#4caf50',
                            color: 'white',
                            border: '3px solid white',
                            borderRadius: '25px',
                            cursor: 'pointer',
                            zIndex: 100,
                            fontWeight: 'bold',
                            fontSize: '16px',
                            boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        🏠 마을로 돌아가기
                    </button>

                    {state.mushrooms.map(m => !m.isDead && (
                        <Mushroom key={m.id} {...m} />
                    ))}
                </>
            )}

            {/* Floating Damage Numbers */}
            {damageNumbers.map(dmg => (
                <div
                    key={dmg.id}
                    style={{
                        position: 'absolute',
                        left: dmg.x,
                        top: dmg.y,
                        transform: 'translate(-50%, -50%)',
                        fontSize: '24px',
                        fontWeight: 'bold',
                        color: '#FFD700',
                        textShadow: '2px 2px 4px rgba(0,0,0,0.8), -1px -1px 2px rgba(255,255,255,0.5)',
                        pointerEvents: 'none',
                        animation: 'floatUp 1s ease-out forwards',
                        zIndex: 1000
                    }}
                >
                    -{dmg.damage.toLocaleString()}
                </div>
            ))}

            {/* ALWAYS RENDER PLAYER, use opacity to hide. Keeps Ref alive and layout valid. */}
            <div style={{ opacity: state.isLoading ? 0 : 1, transition: 'opacity 0.2s' }}>
                <Player ref={playerDOMRef} />
            </div>

            <Joystick onMove={(vec) => joystickRef.current = vec} />

            <button
                onMouseDown={startAutoAttack}
                onMouseUp={stopAutoAttack}
                onMouseLeave={stopAutoAttack}
                onTouchStart={(e) => { e.preventDefault(); startAutoAttack(); }}
                onTouchEnd={(e) => { e.preventDefault(); stopAutoAttack(); }}
                style={{
                    position: 'absolute',
                    bottom: 40,
                    right: 40,
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    backgroundColor: state.currentScene === 'village' ? '#ccc' : 'var(--color-primary)',
                    border: '4px solid white',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                    color: 'white',
                    fontSize: '24px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    zIndex: 100,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    userSelect: 'none',
                    transform: 'scale(1)',
                    transition: 'transform 0.05s'
                }}
            >
                ⚔️
            </button>

            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @keyframes floatUp {
                    0% {
                        opacity: 1;
                        transform: translate(-50%, -50%) translateY(0);
                    }
                    100% {
                        opacity: 0;
                        transform: translate(-50%, -50%) translateY(-60px);
                    }
                }
            `}</style>
        </div>
    );
};

export default GameCanvas;
