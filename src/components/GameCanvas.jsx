import React, { useEffect, useRef, useState } from 'react';
import { useGame } from '../context/GameContext';
import { formatDamage } from '../utils/formatNumber';
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
    // Removed attackIntervalRef, using game loop for attacks
    const lastAttackTimeRef = useRef(0);
    const isManualAttackingRef = useRef(false);

    // Game Loop Logic (Ref-based to avoid stale closures)
    const loopRef = useRef();
    const lastFrameTimeRef = useRef(Date.now());
    const watchdogRef = useRef(null);

    // NPC Logic
    const [npcPos, setNpcPos] = useState({ x: 250, y: 250 });
    const [showShopBtn, setShowShopBtn] = useState(false);

    // Portal Logic
    const [portalPos, setPortalPos] = useState({ x: 600, y: 300 });

    // Auto Hunt State
    const [isAutoHunting, setIsAutoHunting] = useState(false);
    const autoHuntTargetRef = useRef(null);

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
            playerPosRef.current = { ...state.playerPos };
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
            const range = currentState.attackRange + (mushroom.type === 'boss' ? 40 : 0);

            if (dist < range) {
                // Calculate damage
                const baseDamage = currentState.clickDamage;
                const isCritical = Math.random() * 100 < currentState.criticalChance;
                let damage = baseDamage;
                let isHyperCritical = false;

                if (isCritical) {
                    damage = Math.floor(baseDamage * (currentState.criticalDamage / 100));
                    isHyperCritical = Math.random() * 100 < currentState.hyperCriticalChance;
                    if (isHyperCritical) {
                        damage = Math.floor(damage * (currentState.hyperCriticalDamage / 100));
                    }
                }

                // Create floating damage number
                const damageId = Date.now() + Math.random();
                setDamageNumbers(prev => [...prev, {
                    id: damageId,
                    damage: damage,
                    isCritical: isCritical,
                    isHyperCritical: isHyperCritical,
                    x: mushroom.x,
                    y: mushroom.y
                }]);

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

    // Manual Attack Handling
    const startManualAttack = () => {
        isManualAttackingRef.current = true;
    };

    const stopManualAttack = () => {
        isManualAttackingRef.current = false;
    };

    // Spacebar Listeners
    useEffect(() => {
        const handleDown = (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                isManualAttackingRef.current = true;
            }
        };
        const handleKeyUp = (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                isManualAttackingRef.current = false;
            }
        };
        window.addEventListener('keydown', handleDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    // Stop manual attack when auto hunting is toggled (safety)
    useEffect(() => {
        if (!isAutoHunting) {
            autoHuntTargetRef.current = null;
        }
    }, [isAutoHunting]);

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

                let shouldAutoAttack = false;

                // Auto Hunt Logic
                if (isAutoHunting && currentState.currentScene !== 'village') {
                    // 1. Find Target
                    let target = currentState.mushrooms.find(m => m.id === autoHuntTargetRef.current && !m.isDead);

                    if (!target) {
                        // Find nearest living mushroom
                        let minDist = Infinity;
                        currentState.mushrooms.forEach(m => {
                            if (!m.isDead) {
                                const mX = m.x + (m.type === 'boss' ? 50 : 25);
                                const mY = m.y + (m.type === 'boss' ? 50 : 25);
                                const dist = Math.hypot((x + 20) - mX, (y + 20) - mY);
                                if (dist < minDist) {
                                    minDist = dist;
                                    target = m;
                                }
                            }
                        });
                        if (target) autoHuntTargetRef.current = target.id;
                    }

                    // 2. Move & Attack
                    if (target) {
                        const targetX = target.x + (target.type === 'boss' ? 50 : 25);
                        const targetY = target.y + (target.type === 'boss' ? 50 : 25);
                        const dist = Math.hypot((x + 20) - targetX, (y + 20) - targetY);
                        const range = target.type === 'boss' ? 120 : 80;

                        if (dist > range - 20) {
                            // Move towards target
                            const angle = Math.atan2(targetY - (y + 20), targetX - (x + 20));
                            dx += Math.cos(angle) * speed;
                            dy += Math.sin(angle) * speed;
                        }

                        // Auto Hunt Attack Logic handled below in unified attack block
                        if (dist <= range) {
                            shouldAutoAttack = true;
                        }
                    }
                }

                // Unified Attack Logic (Manual + Auto)
                const now = Date.now();
                if (now - lastAttackTimeRef.current >= 100) { // 100ms cooldown
                    if (isManualAttackingRef.current || shouldAutoAttack) {
                        performAttack();
                        lastAttackTimeRef.current = now;
                    }
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

                // Portal Logic (Village only)
                if (currentState.currentScene === 'village') {
                    const distToNpc = Math.hypot((x + 20) - npcPos.x, (y + 20) - npcPos.y);
                    if (distToNpc < 80) {
                        if (!showShopBtn) setShowShopBtn(true);
                    } else {
                        if (showShopBtn) setShowShopBtn(false);
                    }
                } else {
                    if (showShopBtn) setShowShopBtn(false);
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

    useEffect(() => {
        loopRef.current = update;
    });

    useEffect(() => {
        const startLoop = () => {
            if (!requestRef.current) {
                requestRef.current = requestAnimationFrame(loopRef.current);
            }
        };
        startLoop();

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
        if (stateRef.current.isLoading) return;
        dispatch({ type: 'SET_LOADING', payload: true });
        setTimeout(() => {
            dispatch({ type: 'SWITCH_SCENE', payload: { scene, pos: targetPos } });
        }, 500);
    };

    return (
        <div
            ref={containerRef}
            style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                backgroundColor: '#333',
                overflow: 'hidden',
                touchAction: 'none'
            }}
        >
            {state.isLoading && <LoadingScreen />}

            {/* Background */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundImage: state.currentScene === 'village'
                    ? 'url("/assets/village_bg.png")'
                    : 'linear-gradient(#444 1px, transparent 1px), linear-gradient(90deg, #444 1px, transparent 1px)',
                backgroundSize: state.currentScene === 'village' ? 'cover' : '40px 40px',
                backgroundPosition: 'center',
                opacity: state.currentScene === 'village' ? 1 : 0.2
            }} />

            {/* Village UI */}
            {!state.isLoading && state.currentScene === 'village' && (
                <>
                    {/* NPC & Portal Emojis Removed as per request */}

                    {/* Portal Button - Always visible in village */}
                    <button
                        onClick={() => dispatch({ type: 'TOGGLE_PORTAL_MENU' })}
                        style={{
                            position: 'absolute',
                            top: 70,
                            right: 15,
                            padding: '8px 16px',
                            backgroundColor: '#9c27b0',
                            color: 'white',
                            border: '2px solid white',
                            borderRadius: '20px',
                            cursor: 'pointer',
                            zIndex: 100,
                            fontWeight: 'bold',
                            fontSize: '0.85rem',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px'
                        }}
                    >
                        🌀 포탈
                    </button>
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
                            top: 70,
                            right: 15,
                            padding: '8px 16px',
                            backgroundColor: '#4caf50',
                            color: 'white',
                            border: '2px solid white',
                            borderRadius: '20px',
                            cursor: 'pointer',
                            zIndex: 100,
                            fontWeight: 'bold',
                            fontSize: '0.85rem',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px'
                        }}
                    >
                        🏠 마을
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
                        fontSize: dmg.isHyperCritical ? '28px' : (dmg.isCritical ? '22px' : '16px'),
                        fontWeight: 'bold',
                        color: dmg.isHyperCritical ? '#ff00ff' : (dmg.isCritical ? '#ff4444' : '#FFD700'),
                        textShadow: '2px 2px 4px rgba(0,0,0,0.8), -1px -1px 2px rgba(255,255,255,0.5)',
                        pointerEvents: 'none',
                        whiteSpace: 'nowrap',
                        animation: 'floatUp 1s ease-out forwards',
                        zIndex: 1000
                    }}
                >
                    -{formatDamage(dmg.damage)}
                </div>
            ))}

            {/* Player */}
            <div style={{ opacity: state.isLoading ? 0 : 1, transition: 'opacity 0.2s' }}>
                <Player ref={playerDOMRef} />
            </div>

            <Joystick onMove={(vec) => joystickRef.current = vec} />

            {/* Attack Button */}
            <button
                onMouseDown={(e) => { e.preventDefault(); startManualAttack(); }}
                onMouseUp={(e) => { e.preventDefault(); stopManualAttack(); }}
                onMouseLeave={(e) => { e.preventDefault(); stopManualAttack(); }}
                onTouchStart={(e) => { e.preventDefault(); startManualAttack(); }}
                onTouchEnd={(e) => { e.preventDefault(); stopManualAttack(); }}
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
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    fontSize: '2rem',
                    cursor: 'pointer',
                    userSelect: 'none',
                    zIndex: 100
                }}
            >
                ⚔️
            </button>

            {/* Auto Hunt Toggle Button */}
            {state.currentScene !== 'village' && (
                <button
                    onClick={() => {
                        const newState = !isAutoHunting;
                        setIsAutoHunting(newState);
                        // Reset target when starting to ensure we find the nearest one from CURRENT position
                        if (newState) {
                            autoHuntTargetRef.current = null;
                        }
                    }}
                    style={{
                        position: 'absolute',
                        bottom: 130, // Above attack button
                        right: 50,
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        backgroundColor: isAutoHunting ? '#4caf50' : 'rgba(0,0,0,0.5)',
                        border: '3px solid white',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                        zIndex: 100,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}
                >
                    <span>AUTO</span>
                    <span style={{ fontSize: '0.7rem' }}>{isAutoHunting ? 'ON' : 'OFF'}</span>
                </button>
            )}
        </div>
    );
};

export default GameCanvas;
