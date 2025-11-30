import React, { useEffect, useRef, useState } from 'react';
import { useGame } from '../context/GameContext';
import { formatDamage } from '../utils/formatNumber';
import Player from './Player';
import Mushroom from './Mushroom';
import Joystick from './Joystick';
import LoadingScreen from './LoadingScreen';
import RemotePlayer from './RemotePlayer';
import ChatWindow from './ChatWindow';
import StageHUD from './StageHUD';
import StageSelectMenu from './StageSelectMenu';
import Toast from './Toast';

const GameCanvas = () => {
    const { state, dispatch, setChatOpen } = useGame();
    const containerRef = useRef(null);
    const [damageNumbers, setDamageNumbers] = useState([]);
    const [toast, setToast] = useState(null);

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
    const lastSyncTimeRef = useRef(0); // For throttling state updates
    const watchdogRef = useRef(null);

    // NPC Logic
    const [npcPos, setNpcPos] = useState({ x: 250, y: 250 });
    const [showShopBtn, setShowShopBtn] = useState(false);

    // Portal Logic
    const [portalPos, setPortalPos] = useState({ x: 600, y: 300 });

    // Auto Hunt State
    const [isAutoHunting, setIsAutoHunting] = useState(false);
    const autoHuntTargetRef = useRef(null);

    // Chat State
    const [isChatOpen, setIsChatOpen] = useState(false);

    // Clear unread count when chat is open
    useEffect(() => {
        setChatOpen(isChatOpen);
        if (isChatOpen) {
            dispatch({ type: 'CLEAR_UNREAD_CHAT' });
        }
    }, [isChatOpen, dispatch, setChatOpen]);

    // Handle Next Stage
    const handleNextStage = () => {
        dispatch({ type: 'COMPLETE_STAGE' });
    };

    // Boss Timer Countdown
    useEffect(() => {
        // Only run timer if in stage scene
        if (state.currentScene !== 'stage' && state.currentScene !== 'forest') {
            return;
        }

        if (state.bossTimer !== null && state.bossTimer > 0) {
            const timer = setInterval(() => {
                dispatch({ type: 'UPDATE_BOSS_TIMER', payload: state.bossTimer - 1 });
            }, 1000);

            return () => clearInterval(timer);
        } else if (state.bossTimer === 0) {
            // Timer expired, restart the same boss stage
            setToast('시간 초과! 보스 스테이지를 다시 시작합니다.');
            setTimeout(() => {
                dispatch({ type: 'SELECT_STAGE', payload: state.currentStage });
            }, 1500);
        }
    }, [state.bossTimer, state.currentScene, dispatch]);

    // Handle Stage Selection
    const handleSelectStage = (stage) => {
        dispatch({ type: 'SELECT_STAGE', payload: stage });
    };

    // Handle Boss Challenge
    const handleBossChallenge = () => {
        const { chapter, stage } = state.currentStage;
        const difficultyLevel = (chapter - 1) * 10 + stage;
        const baseHp = Math.floor(Math.pow(10, difficultyLevel * 0.05) * 100);
        const bossHp = baseHp * 10000;
        const bossReward = Math.floor(Math.pow(10, difficultyLevel * 0.04) * 50) * 100;

        const bossMushroom = [{
            id: 'BOSS',
            x: 200,
            y: 200,
            hp: bossHp,
            maxHp: bossHp,
            type: 'boss',
            name: `Chapter ${chapter} BOSS`,
            reward: bossReward,
            isDead: false,
            respawnTime: 0,
            scale: 3
        }];

        dispatch({
            type: 'SET_BOSS_PHASE',
            payload: { mushrooms: bossMushroom }
        });
    };


    // Track if auto-progress was triggered to prevent multiple calls
    const autoProgressTriggeredRef = useRef(false);

    // Reset auto-progress flag when mushrooms < 100
    useEffect(() => {
        if (state.mushroomsCollected < 100) {
            autoProgressTriggeredRef.current = false;
        }
    }, [state.mushroomsCollected]);

    // Auto-progress when enabled
    useEffect(() => {
        console.log('Auto-progress check:', {
            autoProgress: state.autoProgress,
            mushroomsCollected: state.mushroomsCollected,
            bossPhase: state.bossPhase,
            stage: state.currentStage.stage,
            triggered: autoProgressTriggeredRef.current
        });

        if (!state.autoProgress) return;
        if (state.mushroomsCollected < 100) return;
        if (autoProgressTriggeredRef.current) return; // Already triggered

        const isBossStage = state.currentStage.stage === 10;

        if (isBossStage && !state.bossPhase) {
            // Auto-challenge boss in X-10
            console.log('Auto-challenging boss NOW!');
            autoProgressTriggeredRef.current = true;
            handleBossChallenge();
        } else if (!isBossStage) {
            // Auto-advance to next stage
            console.log('Auto-advancing to next stage NOW!');
            autoProgressTriggeredRef.current = true;
            handleNextStage();
        }
    }, [state.autoProgress, state.mushroomsCollected, state.bossPhase, state.currentStage.stage]);


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
                    // Collect mushroom for stage progress (only in non-village scenes)
                    if (state.currentScene !== 'village') {
                        dispatch({ type: 'COLLECT_MUSHROOM' });

                        // If boss is killed, auto-complete stage
                        if (mushroom.type === 'boss') {
                            setTimeout(() => {
                                dispatch({ type: 'COMPLETE_STAGE' });
                            }, 500); // Small delay for visual feedback
                        }
                    }
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

                // Movement - disabled when chat is open
                let dx = 0;
                let dy = 0;

                if (!isChatOpen) {
                    if (keysRef.current['ArrowUp'] || keysRef.current['KeyW']) dy -= speed;
                    if (keysRef.current['ArrowDown'] || keysRef.current['KeyS']) dy += speed;
                    if (keysRef.current['ArrowLeft'] || keysRef.current['KeyA']) dx -= speed;
                    if (keysRef.current['ArrowRight'] || keysRef.current['KeyD']) dx += speed;

                    if (joystickRef.current.x !== 0 || joystickRef.current.y !== 0) {
                        dx += joystickRef.current.x * speed;
                        dy += joystickRef.current.y * speed;
                    }
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

                // Sync to Global State (Moderate Speed: ~50 updates/sec)
                if (now - lastSyncTimeRef.current > 20) {
                    // Only dispatch if moved significantly
                    const lastSynced = stateRef.current.playerPos;
                    if (Math.abs(x - lastSynced.x) > 1 || Math.abs(y - lastSynced.y) > 1) {
                        dispatch({ type: 'SET_PLAYER_POS', payload: { x, y } });
                        lastSyncTimeRef.current = now;
                    }
                }

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
                    : 'url("/assets/forest_bg.png")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                opacity: 1
            }} />

            {/* Village UI */}
            {!state.isLoading && state.currentScene === 'village' && (
                <>
                    {/* Stage Select Button - Always visible in village */}
                    <button
                        onClick={() => dispatch({ type: 'SELECT_STAGE', payload: state.currentStage })}
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
                            zIndex: 300,
                            fontWeight: 'bold',
                            fontSize: '0.85rem',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px'
                        }}
                    >
                        🎯 스테이지 {state.currentStage.chapter}-{state.currentStage.stage}
                    </button>
                </>
            )}

            {/* Chat Button - Available in all scenes */}
            {!state.isLoading && (
                <button
                    onClick={() => setIsChatOpen(!isChatOpen)}
                    style={{
                        position: 'absolute',
                        top: 70,
                        left: 15,
                        width: '50px',
                        height: '50px',
                        borderRadius: '50%',
                        backgroundColor: isChatOpen ? '#4caf50' : 'rgba(33, 150, 243, 0.9)',
                        border: '2px solid white',
                        cursor: 'pointer',
                        zIndex: 300,
                        fontSize: '1.5rem',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s'
                    }}
                >
                    💬
                    {/* Unread Badge */}
                    {state.unreadChatCount > 0 && (
                        <div style={{
                            position: 'absolute',
                            top: -5,
                            right: -5,
                            backgroundColor: '#f44336',
                            color: 'white',
                            borderRadius: '50%',
                            width: '20px',
                            height: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '10px',
                            fontWeight: 'bold',
                            border: '2px solid white'
                        }}>
                            {state.unreadChatCount > 9 ? '9+' : state.unreadChatCount}
                        </div>
                    )}
                </button>
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
                        zIndex: 50 // Below UI elements
                    }}
                >
                    -{formatDamage(dmg.damage)}
                </div>
            ))}

            {/* Player */}
            <div style={{ opacity: state.isLoading ? 0 : 1, transition: 'opacity 0.2s' }}>
                <Player ref={playerDOMRef} />
            </div>

            {/* Remote Players (Village Only) */}
            {!state.isLoading && state.currentScene === 'village' && Object.entries(state.otherPlayers || {}).map(([id, player]) => {
                const p = Array.isArray(player) ? player[0] : player;
                if (!p) return null;
                return (
                    <RemotePlayer
                        key={id}
                        username={p.username}
                        x={p.x}
                        y={p.y}
                        lastMessage={p.lastMessage}
                        messageTimestamp={p.messageTimestamp}
                    />
                );
            })}

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

            {/* Stage HUD - Show in stage/forest scenes */}
            {!state.isLoading && (state.currentScene === 'stage' || state.currentScene === 'forest') && (
                <StageHUD
                    currentStage={state.currentStage}
                    mushroomsCollected={state.mushroomsCollected}
                    bossTimer={state.bossTimer}
                    bossPhase={state.bossPhase}
                    onNextStage={handleNextStage}
                    onBossChallenge={handleBossChallenge}
                    onToggleAutoProgress={() => dispatch({ type: 'TOGGLE_AUTO_PROGRESS' })}
                    autoProgress={state.autoProgress}
                    bossHp={state.mushrooms.find(m => m.type === 'boss')?.hp}
                    bossMaxHp={state.mushrooms.find(m => m.type === 'boss')?.maxHp}
                />
            )}

            {/* Chat Window - Available in all scenes */}
            {isChatOpen && (
                <ChatWindow onClose={() => setIsChatOpen(false)} />
            )}

            {/* Stage Select Menu */}
            {state.isPortalMenuOpen && (
                <StageSelectMenu
                    currentStage={state.currentStage}
                    maxStage={state.maxStage}
                    onSelectStage={handleSelectStage}
                    onClose={() => dispatch({ type: 'TOGGLE_PORTAL_MENU' })}
                />
            )}

            {/* Toast Notification */}
            {toast && (
                <Toast
                    message={toast}
                    onClose={() => setToast(null)}
                />
            )}
        </div >
    );
};


export default GameCanvas;
