import React, { useEffect, useRef, useState } from 'react';
import { useGame } from '../../context/GameContext';
import { formatDamage } from '../../utils/formatNumber';
import Player from './Player';
import Mushroom from './Mushroom';
import Joystick from './Joystick';
import LoadingScreen from '../hud/LoadingScreen';
import RemotePlayer from './RemotePlayer';
import ChatWindow from '../hud/ChatWindow';
import StageHUD from '../hud/StageHUD';
import WorldBossModal from '../modals/WorldBossModal';
import WorldBossResultModal from '../modals/WorldBossResultModal';
import StageSelectMenu from '../modals/StageSelectMenu';
import Toast from '../hud/Toast';

const GameCanvas = () => {
    const { state, dispatch, setChatOpen } = useGame();
    const containerRef = useRef(null);
    const [damageNumbers, setDamageNumbers] = useState([]);
    const [toast, setToast] = useState(null);
    const [showBossResult, setShowBossResult] = useState(false);
    const [lastBattleDamage, setLastBattleDamage] = useState(0);
    const prevIsBattling = useRef(false);

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

    // Virtual Joystick State
    const [virtualJoystick, setVirtualJoystick] = useState(null); // { baseX, baseY, currentX, currentY }
    const touchIdRef = useRef(null);

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
        } else if (state.bossTimer === 0 && state.bossPhase) {
            // Timer expired, restart the same boss stage
            // Only show toast if still in boss phase
            setToast('시간 초과! 보스 스테이지를 다시 시작합니다.');
            const timeoutId = setTimeout(() => {
                setToast(null);
                dispatch({ type: 'SELECT_STAGE', payload: state.currentStage });
            }, 1500);

            return () => clearTimeout(timeoutId);
        }
    }, [state.bossTimer, state.currentScene, state.bossPhase, state.currentStage, dispatch]);

    // World Boss Timer
    useEffect(() => {
        if (state.worldBoss.isBattling && state.worldBoss.timeLeft > 0) {
            const timer = setInterval(() => {
                dispatch({ type: 'BOSS_TICK' });
            }, 1000);
            return () => clearInterval(timer);
        } else if (state.worldBoss.isBattling && state.worldBoss.timeLeft === 0) {
            dispatch({ type: 'END_BOSS_BATTLE' });
            setToast(`월드버섯 전투 종료! ${formatDamage(state.worldBoss.damage)} 데미지를 입혔습니다.`);
            setTimeout(() => setToast(null), 3000);
        }
    }, [state.worldBoss.isBattling, state.worldBoss.timeLeft, dispatch]);

    // World Boss Result Logic
    useEffect(() => {
        if (state.worldBoss.isBattling) {
            setLastBattleDamage(state.worldBoss.damage);
        }

        if (prevIsBattling.current && !state.worldBoss.isBattling) {
            // Battle just ended
            setShowBossResult(true);
        }
        prevIsBattling.current = state.worldBoss.isBattling;
    }, [state.worldBoss.isBattling, state.worldBoss.damage]);

    // Handle Stage Selection
    const handleSelectStage = (stage) => {
        dispatch({ type: 'SELECT_STAGE', payload: stage });
    };

    // Handle Boss Challenge
    const handleBossChallenge = () => {
        const { chapter, stage } = state.currentStage;
        const difficultyLevel = (chapter - 1) * 10 + stage;
        const baseHp = Math.floor(Math.pow(10, difficultyLevel * 0.05) * 100);
        const bossHp = baseHp * 1000;
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

    // Helper to calculate damage
    const calculateDamage = () => {
        let damage = state.clickDamage * (1 + (state.artifacts.attackBonus.count * 0.005));

        // Skin effects
        const getSkinBonus = () => {
            let equipBonus = 0;
            let passiveBonus = 0;

            const effects = {
                common: { 1: 5, 2: 3, 3: 2, 4: 1 },
                rare: { 1: 15, 2: 12, 3: 10, 4: 8 },
                epic: { 1: 40, 2: 30, 3: 25, 4: 20 },
                legendary: { 1: 80, 2: 70, 3: 60, 4: 50 },
                mythic: { 1: 300, 2: 200, 3: 150, 4: 100 }
            };

            // Equipped skin bonus
            if (state.skins?.equipped) {
                const parts = state.skins.equipped.split('_');
                if (parts.length === 3) {
                    const rarity = parts[1];
                    const grade = parseInt(parts[2]);
                    equipBonus = effects[rarity]?.[grade] || 0;
                }
            }

            // Passive bonus from all unlocked skins (1/10 of equipped effect)
            if (state.skins?.unlocked) {
                state.skins.unlocked.forEach(skinId => {
                    const parts = skinId.split('_');
                    if (parts.length === 3) {
                        const rarity = parts[1];
                        const grade = parseInt(parts[2]);
                        const skinEffect = effects[rarity]?.[grade] || 0;
                        passiveBonus += skinEffect / 10;
                    }
                });
            }

            return equipBonus + passiveBonus;
        };

        const skinBonus = getSkinBonus();
        damage *= (1 + skinBonus / 100);

        let criticalTier = 0;

        // Critical Logic
        if (Math.random() * 100 < state.criticalChance) {
            criticalTier = 1;
            damage *= (1 + state.criticalDamage / 100) * (1 + (state.artifacts.critDamageBonus.count * 0.1));

            if (Math.random() * 100 < state.hyperCriticalChance) {
                criticalTier = 2;
                damage *= (1 + state.hyperCriticalDamage / 100) * (1 + (state.artifacts.hyperCritDamageBonus.count * 0.1));

                if (Math.random() * 100 < state.megaCriticalChance) {
                    criticalTier = 3;
                    damage *= (1 + state.megaCriticalDamage / 100) * (1 + (state.artifacts.megaCritDamageBonus.count * 0.1));

                    if (Math.random() * 100 < state.gigaCriticalChance) {
                        criticalTier = 4;
                        damage *= (1 + state.gigaCriticalDamage / 100);

                        if (Math.random() * 100 < state.teraCriticalChance) {
                            criticalTier = 5;
                            damage *= (1 + state.teraCriticalDamage / 100);

                            if (Math.random() * 100 < state.petaCriticalChance) {
                                criticalTier = 6;
                                damage *= (1 + state.petaCriticalDamage / 100);

                                if (Math.random() * 100 < state.exaCriticalChance) {
                                    criticalTier = 7;
                                    damage *= (1 + state.exaCriticalDamage / 100);

                                    if (Math.random() * 100 < state.zettaCriticalChance) {
                                        criticalTier = 8;
                                        damage *= (1 + state.zettaCriticalDamage / 100);

                                        if (Math.random() * 100 < state.yottaCriticalChance) {
                                            criticalTier = 9;
                                            damage *= (1 + state.yottaCriticalDamage / 100);

                                            if (Math.random() * 100 < state.ronnaCriticalChance) {
                                                criticalTier = 10;
                                                damage *= (1 + state.ronnaCriticalDamage / 100);

                                                if (Math.random() * 100 < state.quettaCriticalChance) {
                                                    criticalTier = 11;
                                                    damage *= (1 + state.quettaCriticalDamage / 100);

                                                    if (Math.random() * 100 < state.xenoCriticalChance) {
                                                        criticalTier = 12;
                                                        damage *= (1 + state.xenoCriticalDamage / 100);

                                                        if (Math.random() * 100 < state.ultimaCriticalChance) {
                                                            criticalTier = 13;
                                                            damage *= (1 + state.ultimaCriticalDamage / 100);

                                                            if (Math.random() * 100 < state.omniCriticalChance) {
                                                                criticalTier = 14;
                                                                damage *= (1 + state.omniCriticalDamage / 100);

                                                                if (Math.random() * 100 < state.absoluteCriticalChance) {
                                                                    criticalTier = 15;
                                                                    damage *= (1 + state.absoluteCriticalDamage / 100);

                                                                    if (Math.random() * 100 < state.infinityCriticalChance) {
                                                                        criticalTier = 16;
                                                                        damage *= (1 + state.infinityCriticalDamage / 100);
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        return {
            damage: Math.floor(damage),
            isCritical: criticalTier >= 1,
            isHyperCritical: criticalTier >= 2,
            isMegaCritical: criticalTier >= 3,
            criticalTier
        };
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
        if (!state.autoProgress) return;
        if (state.mushroomsCollected < 100) return;
        if (autoProgressTriggeredRef.current) return; // Already triggered

        const isBossStage = state.currentStage.stage === 10;

        if (isBossStage && !state.bossPhase) {
            // Auto-challenge boss in X-10
            autoProgressTriggeredRef.current = true;
            handleBossChallenge();
        } else if (!isBossStage) {
            // Auto-advance to next stage
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

        // Reset UI elements on scene change
        setDamageNumbers([]);
        setToast(null);

        // Cancel world boss battle if leaving world boss scene
        if (state.currentScene !== 'worldBoss' && state.worldBoss.isBattling) {
            dispatch({ type: 'END_BOSS_BATTLE' });
        }

        // Center world boss when entering world boss scene
        if (state.currentScene === 'worldBoss' && containerRef.current) {
            const { clientWidth, clientHeight } = containerRef.current;
            const centerX = clientWidth / 2 - 50; // Offset for boss size
            const centerY = clientHeight / 2 - 50;

            // Update boss position if it exists
            const boss = state.mushrooms.find(m => m.id === 'WORLD_BOSS');
            if (boss && (boss.x !== centerX || boss.y !== centerY)) {
                dispatch({
                    type: 'UPDATE_MUSHROOM_POSITION',
                    payload: { id: 'WORLD_BOSS', x: centerX, y: centerY }
                });
            }
        }
    }, [state.currentScene, state.mushrooms, state.worldBoss.isBattling, dispatch]);

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

    // Virtual Joystick Handlers
    const handlePointerDown = (e) => {
        if (isChatOpen) return;
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;

        const x = e.clientX || e.touches?.[0]?.clientX;
        const y = e.clientY || e.touches?.[0]?.clientY;

        if (x && y) {
            const baseX = x - rect.left;
            const baseY = y - rect.top;
            setVirtualJoystick({ baseX, baseY, currentX: baseX, currentY: baseY });
            touchIdRef.current = e.pointerId || e.touches?.[0]?.identifier;
        }
    };

    const handlePointerMove = (e) => {
        if (!virtualJoystick || isChatOpen) return;
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;

        const x = e.clientX || e.touches?.[0]?.clientX;
        const y = e.clientY || e.touches?.[0]?.clientY;

        if (x && y) {
            const currentX = x - rect.left;
            const currentY = y - rect.top;
            setVirtualJoystick(prev => ({ ...prev, currentX, currentY }));

            // Calculate joystick vector
            const dx = currentX - virtualJoystick.baseX;
            const dy = currentY - virtualJoystick.baseY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const maxDistance = 50;

            if (distance > 0) {
                const normalizedX = dx / Math.max(distance, maxDistance);
                const normalizedY = dy / Math.max(distance, maxDistance);
                joystickRef.current = { x: normalizedX, y: normalizedY };
            }
        }
    };

    const handlePointerUp = () => {
        setVirtualJoystick(null);
        touchIdRef.current = null;
        joystickRef.current = { x: 0, y: 0 };
    };

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

        const isWorldBoss = currentState.currentScene === 'worldBoss';

        currentState.mushrooms.forEach(mushroom => {
            if (mushroom.isDead) return;

            const mushroomCenter = {
                x: mushroom.x + (mushroom.type === 'boss' ? 50 : 25),
                y: mushroom.y + (mushroom.type === 'boss' ? 50 : 25)
            };

            const dist = Math.hypot(playerCenter.x - mushroomCenter.x, playerCenter.y - mushroomCenter.y);
            const artifactRangeBonus = (currentState.artifacts?.attackRange?.level || 0) * 0.04;
            const range = currentState.attackRange + artifactRangeBonus + (mushroom.type === 'boss' ? 40 : 0);

            if (dist < range) {
                // Artifact Bonuses
                const attackBonus = (currentState.artifacts?.attackBonus?.level || 0) * 0.5;
                const critDamageBonus = (currentState.artifacts?.critDamageBonus?.level || 0) * 10;

                // Calculate damage
                const baseDamage = Math.floor(currentState.clickDamage * (1 + attackBonus / 100));
                const isCritical = Math.random() * 100 < currentState.criticalChance;
                let damage = baseDamage;
                let isHyperCritical = false;
                let isMegaCritical = false;
                let isGigaCritical = false;
                let isTeraCritical = false;
                let isPetaCritical = false;
                let isExaCritical = false;
                let isZettaCritical = false;
                let isYottaCritical = false;
                let isRonnaCritical = false;
                let isQuettaCritical = false;
                let isXenoCritical = false;
                let isUltimaCritical = false;
                let isOmniCritical = false;
                let isAbsoluteCritical = false;

                if (isCritical) {
                    const totalCritDamage = currentState.criticalDamage + critDamageBonus;
                    damage = Math.floor(baseDamage * (totalCritDamage / 100));

                    isHyperCritical = Math.random() * 100 < currentState.hyperCriticalChance;
                    if (isHyperCritical) {
                        const totalHyperCritDamage = currentState.hyperCriticalDamage;
                        damage = Math.floor(damage * (totalHyperCritDamage / 100));

                        // Mega Critical Check
                        isMegaCritical = Math.random() * 100 < currentState.megaCriticalChance;
                        if (isMegaCritical) {
                            const totalMegaCritDamage = currentState.megaCriticalDamage;
                            damage = Math.floor(damage * (totalMegaCritDamage / 100));

                            // Giga Critical Check
                            isGigaCritical = Math.random() * 100 < currentState.gigaCriticalChance;
                            if (isGigaCritical) {
                                const totalGigaCritDamage = currentState.gigaCriticalDamage;
                                damage = Math.floor(damage * (totalGigaCritDamage / 100));

                                // Tera Critical Check
                                isTeraCritical = Math.random() * 100 < currentState.teraCriticalChance;
                                if (isTeraCritical) {
                                    const totalTeraCritDamage = currentState.teraCriticalDamage;
                                    damage = Math.floor(damage * (totalTeraCritDamage / 100));

                                    // Peta Critical Check
                                    isPetaCritical = Math.random() * 100 < currentState.petaCriticalChance;
                                    if (isPetaCritical) {
                                        const totalPetaCritDamage = currentState.petaCriticalDamage;
                                        damage = Math.floor(damage * (totalPetaCritDamage / 100));

                                        // Exa Critical Check
                                        isExaCritical = Math.random() * 100 < currentState.exaCriticalChance;
                                        if (isExaCritical) {
                                            const totalExaCritDamage = currentState.exaCriticalDamage;
                                            damage = Math.floor(damage * (totalExaCritDamage / 100));

                                            // Zetta Critical Check
                                            isZettaCritical = Math.random() * 100 < currentState.zettaCriticalChance;
                                            if (isZettaCritical) {
                                                const totalZettaCritDamage = currentState.zettaCriticalDamage;
                                                damage = Math.floor(damage * (totalZettaCritDamage / 100));

                                                // Yotta Critical Check
                                                isYottaCritical = Math.random() * 100 < currentState.yottaCriticalChance;
                                                if (isYottaCritical) {
                                                    const totalYottaCritDamage = currentState.yottaCriticalDamage;
                                                    damage = Math.floor(damage * (totalYottaCritDamage / 100));

                                                    // Ronna Critical Check
                                                    isRonnaCritical = Math.random() * 100 < currentState.ronnaCriticalChance;
                                                    if (isRonnaCritical) {
                                                        const totalRonnaCritDamage = currentState.ronnaCriticalDamage;
                                                        damage = Math.floor(damage * (totalRonnaCritDamage / 100));

                                                        // Quetta Critical Check
                                                        isQuettaCritical = Math.random() * 100 < currentState.quettaCriticalChance;
                                                        if (isQuettaCritical) {
                                                            const totalQuettaCritDamage = currentState.quettaCriticalDamage;
                                                            damage = Math.floor(damage * (totalQuettaCritDamage / 100));

                                                            // Xeno Critical Check
                                                            isXenoCritical = Math.random() * 100 < currentState.xenoCriticalChance;
                                                            if (isXenoCritical) {
                                                                const totalXenoCritDamage = currentState.xenoCriticalDamage;
                                                                damage = Math.floor(damage * (totalXenoCritDamage / 100));

                                                                // Ultima Critical Check
                                                                isUltimaCritical = Math.random() * 100 < currentState.ultimaCriticalChance;
                                                                if (isUltimaCritical) {
                                                                    const totalUltimaCritDamage = currentState.ultimaCriticalDamage;
                                                                    damage = Math.floor(damage * (totalUltimaCritDamage / 100));

                                                                    // Omni Critical Check
                                                                    isOmniCritical = Math.random() * 100 < currentState.omniCriticalChance;
                                                                    if (isOmniCritical) {
                                                                        const totalOmniCritDamage = currentState.omniCriticalDamage;
                                                                        damage = Math.floor(damage * (totalOmniCritDamage / 100));

                                                                        // Absolute Critical Check
                                                                        isAbsoluteCritical = Math.random() * 100 < currentState.absoluteCriticalChance;
                                                                        if (isAbsoluteCritical) {
                                                                            const totalAbsoluteCritDamage = currentState.absoluteCriticalDamage;
                                                                            damage = Math.floor(damage * (totalAbsoluteCritDamage / 100));
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                // Pet Effects
                const equippedPets = currentState.pets?.equipped || [];

                // Dragon Pet: Final Damage Multiplier
                const dragonMultiplier = equippedPets.reduce((mult, petId) => {
                    const [type, rarity] = petId.split('_');
                    if (type === 'dragon') {
                        const multipliers = { common: 1.05, rare: 1.1, epic: 1.2, legendary: 1.4, mythic: 2 };
                        return Math.max(mult, multipliers[rarity] || 1);
                    }
                    return mult;
                }, 1);
                damage = Math.floor(damage * dragonMultiplier);

                // Wolf Pet: Boss Damage Bonus
                if (mushroom.type === 'boss') {
                    const wolfBonus = equippedPets.reduce((bonus, petId) => {
                        const [type, rarity] = petId.split('_');
                        if (type === 'wolf') {
                            const bonuses = { common: 0.1, rare: 0.2, epic: 0.4, legendary: 0.8, mythic: 2 };
                            return Math.max(bonus, bonuses[rarity] || 0);
                        }
                        return bonus;
                    }, 0);
                    damage = Math.floor(damage * (1 + wolfBonus));
                }

                // Create floating damage number
                const damageId = `damage-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                setDamageNumbers(prev => [...prev, {
                    id: damageId,
                    damage: damage,
                    isCritical: isCritical,
                    isHyperCritical: isHyperCritical,
                    isMegaCritical: isMegaCritical,
                    isGigaCritical: isGigaCritical,
                    isTeraCritical: isTeraCritical,
                    isPetaCritical: isPetaCritical,
                    isExaCritical: isExaCritical,
                    isZettaCritical: isZettaCritical,
                    isYottaCritical: isYottaCritical,
                    isRonnaCritical: isRonnaCritical,
                    isQuettaCritical: isQuettaCritical,
                    isXenoCritical: isXenoCritical,
                    isUltimaCritical: isUltimaCritical,
                    isOmniCritical: isOmniCritical,
                    isAbsoluteCritical: isAbsoluteCritical,
                    x: mushroom.x,
                    y: mushroom.y
                }]);

                setTimeout(() => {
                    setDamageNumbers(prev => prev.filter(d => d.id !== damageId));
                }, 1000);

                // For world boss, accumulate damage instead of damaging mushroom
                if (isWorldBoss) {
                    dispatch({ type: 'BOSS_DAMAGE', payload: damage });
                } else {
                    dispatch({ type: 'DAMAGE_MUSHROOM', payload: { id: mushroom.id, damage: damage } });

                    if (mushroom.hp - damage <= 0) {
                        // Slime Pet: Gold Bonus
                        const slimeBonus = equippedPets.reduce((bonus, petId) => {
                            const [type, rarity] = petId.split('_');
                            if (type === 'slime') {
                                const bonuses = { common: 0.1, rare: 0.2, epic: 0.4, legendary: 0.8, mythic: 2 };
                                return Math.max(bonus, bonuses[rarity] || 0);
                            }
                            return bonus;
                        }, 0);
                        const goldReward = Math.floor(mushroom.reward * (1 + slimeBonus));
                        dispatch({ type: 'ADD_GOLD', payload: goldReward });

                        // Give diamond reward if mushroom has diamondReward (Unique mushrooms)
                        if (mushroom.diamondReward && mushroom.diamondReward > 0) {
                            dispatch({ type: 'ADD_DIAMOND', payload: mushroom.diamondReward });
                        }

                        // Fairy Pet: Diamond Drop Chance (10 diamonds per drop)
                        const fairyDropChance = equippedPets.reduce((chance, petId) => {
                            const [type, rarity] = petId.split('_');
                            if (type === 'fairy') {
                                const chances = { common: 0.0001, rare: 0.0002, epic: 0.0005, legendary: 0.001, mythic: 0.002 };
                                return Math.max(chance, chances[rarity] || 0);
                            }
                            return chance;
                        }, 0);
                        if (fairyDropChance > 0 && Math.random() < fairyDropChance) {
                            dispatch({ type: 'ADD_DIAMOND', payload: 10 });
                        }

                        // Track mushroom collection
                        if (mushroom.name && mushroom.rarity) {
                            dispatch({
                                type: 'COLLECT_MUSHROOM_TYPE',
                                payload: { name: mushroom.name, rarity: mushroom.rarity }
                            });
                        }

                        dispatch({ type: 'COLLECT_MUSHROOM' });

                        // If boss is killed, auto-complete stage
                        if (mushroom.type === 'boss') {
                            setTimeout(() => {
                                dispatch({ type: 'COMPLETE_STAGE' });
                            }, 500);
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
                const speed = currentState.moveSpeed + (currentState.artifacts?.moveSpeed?.level || 0) * 0.005;
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

                // Auto Attack Logic - Always attack if mushroom in range
                const now = Date.now();
                const attackInterval = 100; // Fixed 10 attacks per second

                if (now - lastAttackTimeRef.current >= attackInterval) {
                    // Check if any mushroom is in range
                    const inRange = currentState.mushrooms.some(m => {
                        if (m.isDead) return false;
                        const mX = m.x + (m.type === 'boss' ? 50 : 25);
                        const mY = m.y + (m.type === 'boss' ? 50 : 25);
                        const dist = Math.hypot((x + 20) - mX, (y + 20) - mY);
                        const range = m.type === 'boss' ? 120 : 80;
                        return dist <= range;
                    });

                    if (inRange) {
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
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
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

            {/* Dark overlay for World Boss */}
            {state.currentScene === 'worldBoss' && (
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(0, 0, 0, 0.4)',
                    pointerEvents: 'none',
                    zIndex: 1
                }} />
            )}

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
                            boxShadow: '0 2px 5px rgba(0,0,0,0.3)'
                        }}
                    >
                        ⚔️ 스테이지 {state.currentStage.chapter}-{state.currentStage.stage}
                    </button>

                    {/* World Mushroom Button - Only available from stage 20-1 */}
                    {(state.currentStage.chapter > 20 || (state.currentStage.chapter === 20 && state.currentStage.stage >= 1)) && (
                        <button
                            onClick={() => dispatch({ type: 'OPEN_WORLD_BOSS' })}
                            style={{
                                position: 'absolute',
                                top: 120, // Below stage button
                                right: 15,
                                padding: '8px 16px',
                                background: 'linear-gradient(45deg, #FFD700, #FFA500)',
                                color: 'black',
                                border: '2px solid white',
                                borderRadius: '20px',
                                cursor: 'pointer',
                                zIndex: 300,
                                fontWeight: 'bold',
                                boxShadow: '0 0 10px rgba(255, 215, 0, 0.5)',
                                animation: 'pulse 2s infinite'
                            }}
                        >
                            🍄 월드버섯
                        </button>
                    )}
                    <style>{`
                        @keyframes pulse {
                            0% { box-shadow: 0 0 0 0 rgba(255, 215, 0, 0.4); }
                            70% { box-shadow: 0 0 0 10px rgba(255, 215, 0, 0); }
                            100% { box-shadow: 0 0 0 0 rgba(255, 215, 0, 0); }
                        }
                    `}</style>
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
                        fontSize: dmg.isAbsoluteCritical ? '28px' : (dmg.isOmniCritical ? '27px' : (dmg.isUltimaCritical ? '26px' : (dmg.isXenoCritical ? '25px' : (dmg.isQuettaCritical ? '24px' : (dmg.isRonnaCritical ? '23px' : (dmg.isYottaCritical ? '22px' : (dmg.isZettaCritical ? '21px' : (dmg.isExaCritical ? '20px' : (dmg.isPetaCritical ? '19px' : (dmg.isTeraCritical ? '18px' : (dmg.isGigaCritical ? '17px' : (dmg.isMegaCritical ? '16px' : (dmg.isHyperCritical ? '14px' : (dmg.isCritical ? '12px' : '10px')))))))))))))),
                        fontWeight: 'bold',
                        color: dmg.isAbsoluteCritical ? '#B0E0E6' : (dmg.isOmniCritical ? '#F0E68C' : (dmg.isUltimaCritical ? '#DC143C' : (dmg.isXenoCritical ? '#1E90FF' : (dmg.isQuettaCritical ? '#FF00FF' : (dmg.isRonnaCritical ? '#00FFFF' : (dmg.isYottaCritical ? '#ADFF2F' : (dmg.isZettaCritical ? '#FF4500' : (dmg.isExaCritical ? '#FFFFFF' : (dmg.isPetaCritical ? '#FFD700' : (dmg.isTeraCritical ? '#FF1493' : (dmg.isGigaCritical ? '#00CED1' : (dmg.isMegaCritical ? '#8A2BE2' : (dmg.isHyperCritical ? '#ff00ff' : (dmg.isCritical ? '#ff4444' : '#FFD700')))))))))))))),
                        textShadow: dmg.isAbsoluteCritical ? '0 0 15px #B0E0E6, 0 0 30px #FFFFFF' : (dmg.isOmniCritical ? '0 0 15px #F0E68C, 0 0 30px #FFD700' : (dmg.isUltimaCritical ? '0 0 15px #DC143C, 0 0 30px #FF0000' : (dmg.isXenoCritical ? '0 0 15px #1E90FF, 0 0 30px #0000FF' : (dmg.isQuettaCritical ? '0 0 15px #FF00FF, 0 0 30px #FF1493' : (dmg.isRonnaCritical ? '0 0 15px #00FFFF, 0 0 30px #00CED1' : (dmg.isYottaCritical ? '0 0 15px #ADFF2F, 0 0 30px #7FFF00' : (dmg.isZettaCritical ? '0 0 15px #FF4500, 0 0 30px #FF6347' : (dmg.isExaCritical ? '0 0 10px #FFFFFF, 0 0 20px #FF00FF' : (dmg.isPetaCritical ? '0 0 10px #FFD700, 0 0 20px #FFA500' : (dmg.isTeraCritical ? '0 0 10px #FF1493, 0 0 20px #800080' : (dmg.isGigaCritical ? '0 0 10px #00CED1, 0 0 20px #0000FF' : (dmg.isMegaCritical ? '0 0 10px #4B0082, 2px 2px 4px rgba(0,0,0,0.8)' : '2px 2px 4px rgba(0,0,0,0.8), -1px -1px 2px rgba(255,255,255,0.5)')))))))))))),
                        pointerEvents: 'none',
                        whiteSpace: 'nowrap',
                        animation: 'floatUp 1s ease-out forwards',
                        zIndex: 200
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
            {
                !state.isLoading && state.currentScene === 'village' && Object.entries(state.otherPlayers || {}).map(([id, player]) => {
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
                })
            }

            {/* Virtual Joystick */}
            {
                virtualJoystick && (
                    <>
                        {/* Base Circle */}
                        <div style={{
                            position: 'absolute',
                            left: virtualJoystick.baseX - 50,
                            top: virtualJoystick.baseY - 50,
                            width: '100px',
                            height: '100px',
                            borderRadius: '50%',
                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                            border: '2px solid rgba(255, 255, 255, 0.5)',
                            pointerEvents: 'none',
                            zIndex: 50
                        }} />
                        {/* Stick */}
                        <div style={{
                            position: 'absolute',
                            left: virtualJoystick.currentX - 25,
                            top: virtualJoystick.currentY - 25,
                            width: '50px',
                            height: '50px',
                            borderRadius: '50%',
                            backgroundColor: 'rgba(255, 255, 255, 0.6)',
                            border: '2px solid rgba(255, 255, 255, 0.8)',
                            pointerEvents: 'none',
                            zIndex: 51
                        }} />
                    </>
                )
            }

            {/* Auto Hunt Toggle Button */}
            {
                state.currentScene !== 'village' && (
                    <button
                        onClick={() => {
                            const newState = !isAutoHunting;
                            setIsAutoHunting(newState);
                            if (newState) {
                                autoHuntTargetRef.current = null;
                            }
                        }}
                        style={{
                            position: 'fixed',
                            bottom: '45px', // 5px above the BottomPanel handle (40px)
                            right: '10px',
                            width: '45px',
                            height: '45px',
                            borderRadius: '50%',
                            backgroundColor: isAutoHunting ? '#4caf50' : 'rgba(0,0,0,0.5)',
                            border: '2px solid white',
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: '0.65rem',
                            cursor: 'pointer',
                            boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                            zIndex: 999,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            padding: '2px',
                            transition: 'bottom 0.3s cubic-bezier(0.4, 0, 0.2, 1)' // Smooth transition matching BottomPanel
                        }}
                    >
                        <span style={{ fontSize: '0.6rem' }}>AUTO</span>
                        <span style={{ fontSize: '0.5rem' }}>{isAutoHunting ? 'ON' : 'OFF'}</span>
                    </button>
                )
            }

            {/* Stage HUD - Show in stage/forest scenes */}
            {
                !state.isLoading && (state.currentScene === 'stage' || state.currentScene === 'forest') && (
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
                )
            }

            {/* Chat Window - Available in all scenes */}
            {
                isChatOpen && (
                    <ChatWindow onClose={() => setIsChatOpen(false)} />
                )
            }

            {/* Stage Select Menu */}
            {
                state.isPortalMenuOpen && (
                    <StageSelectMenu
                        currentStage={state.currentStage}
                        maxStage={state.maxStage}
                        onSelectStage={handleSelectStage}
                        onClose={() => dispatch({ type: 'TOGGLE_PORTAL_MENU' })}
                    />
                )
            }

            {/* World Mushroom HUD - Center Top */}
            {
                state.currentScene === 'worldBoss' && (
                    <div style={{
                        position: 'fixed',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -300%)',
                        display: 'flex',
                        gap: '15px',
                        zIndex: 9999,
                        pointerEvents: 'none'
                    }}>
                        <div style={{
                            color: 'white',
                            fontSize: '1rem',
                            fontWeight: 'bold',
                            textShadow: '0 0 8px black',
                            background: 'rgba(0,0,0,0.75)',
                            padding: '6px 12px',
                            borderRadius: '10px',
                            border: '1px solid white',
                            minWidth: '80px',
                            textAlign: 'center'
                        }}>
                            ⏳ {state.worldBoss.timeLeft}s
                        </div>
                        <div style={{
                            color: '#FFD700',
                            fontSize: '1rem',
                            fontWeight: 'bold',
                            textShadow: '0 0 8px black',
                            background: 'rgba(0,0,0,0.75)',
                            padding: '6px 12px',
                            borderRadius: '10px',
                            border: '1px solid #FFD700',
                            minWidth: '120px',
                            textAlign: 'center'
                        }}>
                            ⚔️ {formatDamage(state.worldBoss.damage)}
                        </div>
                    </div>
                )
            }

            {/* World Boss Result Modal */}
            {
                showBossResult && (
                    <WorldBossResultModal
                        damage={lastBattleDamage}
                        onClose={() => setShowBossResult(false)}
                    />
                )
            }

            {/* World Boss Modal */}
            <WorldBossModal />

            {/* Toast Notification */}
            {
                toast && (
                    <Toast
                        message={toast}
                        onClose={() => setToast(null)}
                    />
                )
            }
        </div >
    );
};


export default GameCanvas;
