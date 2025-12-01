// Script to update all mushroom positions for mobile
// This is a helper to generate mobile-optimized coordinates

const maps = {
    cave: { x_mult: 0.6, y_mult: 0.6 },
    mountain: { x_mult: 0.6, y_mult: 0.6 },
    abyss: { x_mult: 0.6, y_mult: 0.6 },
    throne: { x_mult: 0.6, y_mult: 0.6 }
};

// All remaining maps with adjusted positions
const updatedMaps = `
    // Intermediate Maps (6-10)
    'cave_1': [
        { id: 601, x: 150, y: 150, hp: 70, maxHp: 70, type: 'red', name: '동굴버섯', reward: 35, isDead: false, respawnTime: 0 },
        { id: 602, x: 280, y: 150, hp: 70, maxHp: 70, type: 'red', name: '동굴버섯', reward: 35, isDead: false, respawnTime: 0 },
        { id: 603, x: 210, y: 210, hp: 80, maxHp: 80, type: 'red', name: '동굴버섯', reward: 40, isDead: false, respawnTime: 0 },
        { id: 604, x: 180, y: 270, hp: 90, maxHp: 90, type: 'red', name: '빛나는버섯', reward: 45, isDead: false, respawnTime: 0 },
    ],
    'cave_2': [
        { id: 701, x: 120, y: 120, hp: 90, maxHp: 90, type: 'red', name: '수정버섯', reward: 45, isDead: false, respawnTime: 0 },
        { id: 702, x: 300, y: 120, hp: 90, maxHp: 90, type: 'red', name: '수정버섯', reward: 45, isDead: false, respawnTime: 0 },
        { id: 703, x: 210, y: 240, hp: 100, maxHp: 100, type: 'red', name: '수정버섯', reward: 50, isDead: false, respawnTime: 0 },
        { id: 704, x: 250, y: 180, hp: 110, maxHp: 110, type: 'boss', name: '동굴 수호자', reward: 60, isDead: false, respawnTime: 0 },
    ],
    'cave_3': [
        { id: 801, x: 150, y: 150, hp: 110, maxHp: 110, type: 'red', name: '얼음버섯', reward: 55, isDead: false, respawnTime: 0 },
        { id: 802, x: 280, y: 150, hp: 110, maxHp: 110, type: 'red', name: '얼음버섯', reward: 55, isDead: false, respawnTime: 0 },
        { id: 803, x: 210, y: 210, hp: 120, maxHp: 120, type: 'red', name: '얼음버섯', reward: 60, isDead: false, respawnTime: 0 },
        { id: 804, x: 180, y: 270, hp: 130, maxHp: 130, type: 'boss', name: '서리 버섯', reward: 70, isDead: false, respawnTime: 0 },
    ],
    'cave_4': [
        { id: 901, x: 120, y: 120, hp: 130, maxHp: 130, type: 'red', name: '용암버섯', reward: 65, isDead: false, respawnTime: 0 },
        { id: 902, x: 300, y: 120, hp: 130, maxHp: 130, type: 'red', name: '용암버섯', reward: 65, isDead: false, respawnTime: 0 },
        { id: 903, x: 210, y: 240, hp: 140, maxHp: 140, type: 'boss', name: '화염버섯', reward: 75, isDead: false, respawnTime: 0 },
        { id: 904, x: 250, y: 180, hp: 150, maxHp: 150, type: 'boss', name: '용암 수호자', reward: 80, isDead: false, respawnTime: 0 },
    ],
    'cave_5': [
        { id: 1001, x: 150, y: 150, hp: 150, maxHp: 150, type: 'boss', name: '거대 동굴버섯', reward: 80, isDead: false, respawnTime: 0 },
        { id: 1002, x: 280, y: 150, hp: 150, maxHp: 150, type: 'boss', name: '거대 동굴버섯', reward: 80, isDead: false, respawnTime: 0 },
        { id: 1003, x: 210, y: 210, hp: 160, maxHp: 160, type: 'boss', name: '거대 동굴버섯', reward: 85, isDead: false, respawnTime: 0 },
    ],
    
    // Advanced Maps (11-15)
    'mountain_1': [
        { id: 1101, x: 120, y: 120, hp: 200, maxHp: 200, type: 'boss', name: '산악버섯', reward: 100, isDead: false, respawnTime: 0 },
        { id: 1102, x: 300, y: 120, hp: 200, maxHp: 200, type: 'boss', name: '산악버섯', reward: 100, isDead: false, respawnTime: 0 },
        { id: 1103, x: 210, y: 240, hp: 220, maxHp: 220, type: 'boss', name: '바위버섯', reward: 110, isDead: false, respawnTime: 0 },
        { id: 1104, x: 180, y: 180, hp: 240, maxHp: 240, type: 'boss', name: '바위버섯', reward: 120, isDead: false, respawnTime: 0 },
    ],
    'mountain_2': [
        { id: 1201, x: 150, y: 150, hp: 250, maxHp: 250, type: 'boss', name: '고산버섯', reward: 125, isDead: false, respawnTime: 0 },
        { id: 1202, x: 280, y: 150, hp: 250, maxHp: 250, type: 'boss', name: '고산버섯', reward: 125, isDead: false, respawnTime: 0 },
        { id: 1203, x: 210, y: 210, hp: 270, maxHp: 270, type: 'boss', name: '설산버섯', reward: 135, isDead: false, respawnTime: 0 },
        { id: 1204, x: 250, y: 270, hp: 290, maxHp: 290, type: 'boss', name: '설산버섯', reward: 145, isDead: false, respawnTime: 0 },
    ],
    'mountain_3': [
        { id: 1301, x: 120, y: 120, hp: 300, maxHp: 300, type: 'boss', name: '천둥버섯', reward: 150, isDead: false, respawnTime: 0 },
        { id: 1302, x: 300, y: 120, hp: 300, maxHp: 300, type: 'boss', name: '천둥버섯', reward: 150, isDead: false, respawnTime: 0 },
        { id: 1303, x: 210, y: 240, hp: 320, maxHp: 320, type: 'boss', name: '번개버섯', reward: 160, isDead: false, respawnTime: 0 },
        { id: 1304, x: 180, y: 180, hp: 340, maxHp: 340, type: 'boss', name: '폭풍버섯', reward: 170, isDead: false, respawnTime: 0 },
    ],
    'mountain_4': [
        { id: 1401, x: 150, y: 150, hp: 350, maxHp: 350, type: 'boss', name: '거대 산악버섯', reward: 175, isDead: false, respawnTime: 0 },
        { id: 1402, x: 280, y: 150, hp: 350, maxHp: 350, type: 'boss', name: '거대 산악버섯', reward: 175, isDead: false, respawnTime: 0 },
        { id: 1403, x: 210, y: 210, hp: 370, maxHp: 370, type: 'boss', name: '거대 산악버섯', reward: 185, isDead: false, respawnTime: 0 },
        { id: 1404, x: 250, y: 270, hp: 390, maxHp: 390, type: 'boss', name: '산의 수호자', reward: 195, isDead: false, respawnTime: 0 },
    ],
    'mountain_5': [
        { id: 1501, x: 120, y: 120, hp: 400, maxHp: 400, type: 'boss', name: '정상버섯', reward: 200, isDead: false, respawnTime: 0 },
        { id: 1502, x: 300, y: 120, hp: 400, maxHp: 400, type: 'boss', name: '정상버섯', reward: 200, isDead: false, respawnTime: 0 },
        { id: 1503, x: 210, y: 240, hp: 420, maxHp: 420, type: 'boss', name: '정상버섯', reward: 210, isDead: false, respawnTime: 0 },
    ],
    
    // Expert Maps (16-19)
    'abyss_1': [
        { id: 1601, x: 150, y: 150, hp: 500, maxHp: 500, type: 'boss', name: '심연버섯', reward: 250, isDead: false, respawnTime: 0 },
        { id: 1602, x: 280, y: 150, hp: 500, maxHp: 500, type: 'boss', name: '심연버섯', reward: 250, isDead: false, respawnTime: 0 },
        { id: 1603, x: 210, y: 210, hp: 550, maxHp: 550, type: 'boss', name: '어둠버섯', reward: 275, isDead: false, respawnTime: 0 },
        { id: 1604, x: 180, y: 270, hp: 600, maxHp: 600, type: 'boss', name: '어둠버섯', reward: 300, isDead: false, respawnTime: 0 },
    ],
    'abyss_2': [
        { id: 1701, x: 120, y: 120, hp: 650, maxHp: 650, type: 'boss', name: '공허버섯', reward: 325, isDead: false, respawnTime: 0 },
        { id: 1702, x: 300, y: 120, hp: 650, maxHp: 650, type: 'boss', name: '공허버섯', reward: 325, isDead: false, respawnTime: 0 },
        { id: 1703, x: 210, y: 240, hp: 700, maxHp: 700, type: 'boss', name: '혼돈버섯', reward: 350, isDead: false, respawnTime: 0 },
        { id: 1704, x: 250, y: 180, hp: 750, maxHp: 750, type: 'boss', name: '혼돈버섯', reward: 375, isDead: false, respawnTime: 0 },
    ],
    'abyss_3': [
        { id: 1801, x: 150, y: 150, hp: 800, maxHp: 800, type: 'boss', name: '타락버섯', reward: 400, isDead: false, respawnTime: 0 },
        { id: 1802, x: 280, y: 150, hp: 800, maxHp: 800, type: 'boss', name: '타락버섯', reward: 400, isDead: false, respawnTime: 0 },
        { id: 1803, x: 210, y: 210, hp: 850, maxHp: 850, type: 'boss', name: '저주버섯', reward: 425, isDead: false, respawnTime: 0 },
        { id: 1804, x: 180, y: 270, hp: 900, maxHp: 900, type: 'boss', name: '저주버섯', reward: 450, isDead: false, respawnTime: 0 },
    ],
    'abyss_4': [
        { id: 1901, x: 120, y: 120, hp: 950, maxHp: 950, type: 'boss', name: '악마버섯', reward: 475, isDead: false, respawnTime: 0 },
        { id: 1902, x: 300, y: 120, hp: 950, maxHp: 950, type: 'boss', name: '악마버섯', reward: 475, isDead: false, respawnTime: 0 },
        { id: 1903, x: 210, y: 240, hp: 1000, maxHp: 1000, type: 'boss', name: '악마버섯', reward: 500, isDead: false, respawnTime: 0 },
    ],
    
    // Final Boss Map (20)
    'throne': [
        { id: 2001, x: 210, y: 180, hp: 2000, maxHp: 2000, type: 'boss', name: '버섯 대왕', reward: 1000, isDead: false, respawnTime: 0 },
    ]
`;

