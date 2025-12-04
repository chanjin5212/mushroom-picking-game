import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { formatNumber } from '../../utils/formatNumber';

// 알파벳 숫자를 실제 숫자로 변환
const parseAlphabetNumber = (str) => {
    if (typeof str === 'number') return str;

    const units = {
        'K': 1e3, 'M': 1e6, 'B': 1e9, 'T': 1e12,
        'AA': 1e15, 'AB': 1e18, 'AC': 1e21, 'AD': 1e24,
        'AE': 1e27, 'AF': 1e30, 'AG': 1e33, 'AH': 1e36,
        'AI': 1e39, 'AJ': 1e42, 'AK': 1e45, 'AL': 1e48
    };

    const match = String(str).match(/^([\d.]+)([A-Z]+)$/i);
    if (match) {
        const [, num, unit] = match;
        const multiplier = units[unit.toUpperCase()] || 1;
        return parseFloat(num) * multiplier;
    }

    return parseFloat(str) || 0;
};

// InputField 컴포넌트 (외부로 이동하여 포커스 문제 해결)
const InputField = ({ label, path, type = 'text', isAlphabetNumber = false, editData, handleChange }) => {
    const keys = path.split('.');
    let value = editData;
    for (const key of keys) {
        value = value?.[key];
    }

    const displayValue = value || '';

    return (
        <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', color: '#aaa', fontSize: '0.9rem' }}>
                {label}
            </label>
            <input
                type="text"
                value={displayValue}
                onChange={(e) => {
                    let val = e.target.value;
                    if (type === 'number' && !isAlphabetNumber) {
                        val = Number(val);
                    }
                    handleChange(path, val);
                }}
                placeholder={isAlphabetNumber ? '예: 100K, 1M, 1AL' : ''}
                style={{
                    width: '100%',
                    padding: '10px',
                    backgroundColor: '#2a2a2a',
                    border: '1px solid #444',
                    borderRadius: '4px',
                    color: 'white',
                    fontSize: '1rem'
                }}
            />
            {isAlphabetNumber && value && (
                <div style={{ fontSize: '0.8rem', color: '#888', marginTop: '5px' }}>
                    실제 저장될 값: {parseAlphabetNumber(value).toExponential(2)}
                </div>
            )}
        </div>
    );
};

const AdminPage = () => {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [editData, setEditData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchUsers();

        // body와 root 스타일 변경
        const originalOverflow = document.body.style.overflow;
        const originalPosition = document.body.style.position;
        const originalHeight = document.body.style.height;

        const root = document.getElementById('root');
        const originalRootHeight = root?.style.height;
        const originalRootDisplay = root?.style.display;

        document.body.style.overflow = 'auto';
        document.body.style.position = 'static';
        document.body.style.height = 'auto';

        if (root) {
            root.style.height = 'auto';
            root.style.display = 'block';
        }

        return () => {
            document.body.style.overflow = originalOverflow;
            document.body.style.position = originalPosition;
            document.body.style.height = originalHeight;

            if (root) {
                root.style.height = originalRootHeight || '';
                root.style.display = originalRootDisplay || '';
            }
        };
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('users')
                .select('id, username, game_data')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setUsers(data || []);
        } catch (err) {
            console.error('Error fetching users:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleUserClick = (user) => {
        setSelectedUser(user);
        const data = JSON.parse(JSON.stringify(user.game_data || {}));

        // 포맷팅이 필요한 필드들을 문자열로 변환
        if (data.gold) data.gold = formatNumber(data.gold);
        if (data.diamond) data.diamond = formatNumber(data.diamond);

        setEditData(data);
    };

    const handleBack = () => {
        setSelectedUser(null);
        setEditData(null);
    };

    const handleChange = (path, value) => {
        const keys = path.split('.');
        const newData = { ...editData };
        let current = newData;

        for (let i = 0; i < keys.length - 1; i++) {
            if (!current[keys[i]]) current[keys[i]] = {};
            current = current[keys[i]];
        }

        current[keys[keys.length - 1]] = value;
        setEditData(newData);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            // 저장 전 데이터 파싱
            const dataToSave = JSON.parse(JSON.stringify(editData));

            // 문자열로 된 필드들을 숫자로 변환
            if (dataToSave.gold) dataToSave.gold = parseAlphabetNumber(dataToSave.gold);
            if (dataToSave.diamond) dataToSave.diamond = parseAlphabetNumber(dataToSave.diamond);

            const { error } = await supabase
                .from('users')
                .update({ game_data: dataToSave })
                .eq('id', selectedUser.id);

            if (error) throw error;

            alert('저장되었습니다!');
            await fetchUsers();
            setSelectedUser(null);
            setEditData(null);
        } catch (err) {
            console.error('Error saving:', err);
            alert('저장 실패');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div style={{ padding: '20px', color: 'white' }}>로딩 중...</div>;
    }

    // 사용자 목록 화면
    if (!selectedUser) {
        return (
            <div style={{
                padding: '20px',
                backgroundColor: '#1a1a1a',
                minHeight: '100vh',
                color: 'white'
            }}>
                <h1 style={{ marginBottom: '20px' }}>🛠️ 관리자 페이지</h1>
                <div style={{ display: 'grid', gap: '10px', maxWidth: '600px' }}>
                    {users.map(user => (
                        <div
                            key={user.id}
                            onClick={() => handleUserClick(user)}
                            style={{
                                padding: '15px',
                                backgroundColor: '#2a2a2a',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                transition: 'background 0.2s'
                            }}
                            onMouseEnter={(e) => e.target.style.backgroundColor = '#3a3a3a'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = '#2a2a2a'}
                        >
                            <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{user.username}</div>
                            <div style={{ fontSize: '0.8rem', color: '#888', marginTop: '5px' }}>
                                ID: {user.id.substring(0, 8)}...
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }



    return (
        <div style={{
            padding: '20px',
            backgroundColor: '#1a1a1a',
            minHeight: '100vh',
            color: 'white'
        }}>
            <button
                onClick={handleBack}
                style={{
                    padding: '10px 20px',
                    backgroundColor: '#444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    marginBottom: '20px'
                }}
            >
                ← 목록으로
            </button>

            <h1 style={{ marginBottom: '10px' }}>{selectedUser.username}</h1>
            <p style={{ color: '#888', marginBottom: '30px' }}>ID: {selectedUser.id}</p>

            <div style={{ maxWidth: '800px' }}>
                <h2 style={{ borderBottom: '1px solid #444', paddingBottom: '10px', marginBottom: '20px' }}>기본 정보</h2>
                <InputField label="골드 (알파벳 입력 가능)" path="gold" isAlphabetNumber={true} editData={editData} handleChange={handleChange} />
                <InputField label="다이아몬드 (알파벳 입력 가능)" path="diamond" isAlphabetNumber={true} editData={editData} handleChange={handleChange} />
                <InputField label="무기 레벨" path="weaponLevel" type="number" editData={editData} handleChange={handleChange} />

                <h2 style={{ borderBottom: '1px solid #444', paddingBottom: '10px', marginBottom: '20px', marginTop: '40px' }}>스탯 레벨</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <InputField label="치명타 확률 레벨" path="statLevels.critChance" type="number" editData={editData} handleChange={handleChange} />
                    <InputField label="치명타 데미지 레벨" path="statLevels.critDamage" type="number" editData={editData} handleChange={handleChange} />
                    <InputField label="하이퍼 확률 레벨" path="statLevels.hyperCritChance" type="number" editData={editData} handleChange={handleChange} />
                    <InputField label="하이퍼 데미지 레벨" path="statLevels.hyperCritDamage" type="number" editData={editData} handleChange={handleChange} />
                    <InputField label="메가 확률 레벨" path="statLevels.megaCritChance" type="number" editData={editData} handleChange={handleChange} />
                    <InputField label="메가 데미지 레벨" path="statLevels.megaCritDamage" type="number" editData={editData} handleChange={handleChange} />
                    <InputField label="기가 확률 레벨" path="statLevels.gigaCritChance" type="number" editData={editData} handleChange={handleChange} />
                    <InputField label="기가 데미지 레벨" path="statLevels.gigaCritDamage" type="number" editData={editData} handleChange={handleChange} />
                    <InputField label="테라 확률 레벨" path="statLevels.teraCritChance" type="number" editData={editData} handleChange={handleChange} />
                    <InputField label="테라 데미지 레벨" path="statLevels.teraCritDamage" type="number" editData={editData} handleChange={handleChange} />
                    <InputField label="페타 확률 레벨" path="statLevels.petaCritChance" type="number" editData={editData} handleChange={handleChange} />
                    <InputField label="페타 데미지 레벨" path="statLevels.petaCritDamage" type="number" editData={editData} handleChange={handleChange} />
                    <InputField label="엑사 확률 레벨" path="statLevels.exaCritChance" type="number" editData={editData} handleChange={handleChange} />
                    <InputField label="엑사 데미지 레벨" path="statLevels.exaCritDamage" type="number" editData={editData} handleChange={handleChange} />
                    <InputField label="제타 확률 레벨" path="statLevels.zettaCritChance" type="number" editData={editData} handleChange={handleChange} />
                    <InputField label="제타 데미지 레벨" path="statLevels.zettaCritDamage" type="number" editData={editData} handleChange={handleChange} />
                    <InputField label="요타 확률 레벨" path="statLevels.yottaCritChance" type="number" editData={editData} handleChange={handleChange} />
                    <InputField label="요타 데미지 레벨" path="statLevels.yottaCritDamage" type="number" editData={editData} handleChange={handleChange} />
                    <InputField label="론나 확률 레벨" path="statLevels.ronnaCritChance" type="number" editData={editData} handleChange={handleChange} />
                    <InputField label="론나 데미지 레벨" path="statLevels.ronnaCritDamage" type="number" editData={editData} handleChange={handleChange} />
                    <InputField label="퀘타 확률 레벨" path="statLevels.quettaCritChance" type="number" editData={editData} handleChange={handleChange} />
                    <InputField label="퀘타 데미지 레벨" path="statLevels.quettaCritDamage" type="number" editData={editData} handleChange={handleChange} />
                    <InputField label="제노 확률 레벨" path="statLevels.xenoCritChance" type="number" editData={editData} handleChange={handleChange} />
                    <InputField label="제노 데미지 레벨" path="statLevels.xenoCritDamage" type="number" editData={editData} handleChange={handleChange} />
                    <InputField label="울티마 확률 레벨" path="statLevels.ultimaCritChance" type="number" editData={editData} handleChange={handleChange} />
                    <InputField label="울티마 데미지 레벨" path="statLevels.ultimaCritDamage" type="number" editData={editData} handleChange={handleChange} />
                    <InputField label="옴니 확률 레벨" path="statLevels.omniCritChance" type="number" editData={editData} handleChange={handleChange} />
                    <InputField label="옴니 데미지 레벨" path="statLevels.omniCritDamage" type="number" editData={editData} handleChange={handleChange} />
                    <InputField label="앱솔루트 확률 레벨" path="statLevels.absoluteCritChance" type="number" editData={editData} handleChange={handleChange} />
                    <InputField label="앱솔루트 데미지 레벨" path="statLevels.absoluteCritDamage" type="number" editData={editData} handleChange={handleChange} />
                    <InputField label="이동속도 레벨" path="statLevels.moveSpeed" type="number" editData={editData} handleChange={handleChange} />
                    <InputField label="공격범위 레벨" path="statLevels.attackRange" type="number" editData={editData} handleChange={handleChange} />
                </div>

                <h2 style={{ borderBottom: '1px solid #444', paddingBottom: '10px', marginBottom: '20px', marginTop: '40px' }}>유물</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <InputField label="공격력 유물 레벨" path="artifacts.attackBonus.level" type="number" editData={editData} handleChange={handleChange} />
                    <InputField label="치명타 데미지 유물 레벨" path="artifacts.critDamageBonus.level" type="number" editData={editData} handleChange={handleChange} />
                    <InputField label="이동속도 유물 레벨" path="artifacts.moveSpeed.level" type="number" editData={editData} handleChange={handleChange} />
                    <InputField label="공격범위 유물 레벨" path="artifacts.attackRange.level" type="number" editData={editData} handleChange={handleChange} />
                    <InputField label="골드 보너스 유물 레벨" path="artifacts.goldBonus.level" type="number" editData={editData} handleChange={handleChange} />
                </div>

                <h2 style={{ borderBottom: '1px solid #444', paddingBottom: '10px', marginBottom: '20px', marginTop: '40px' }}>스테이지</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <InputField label="현재 챕터" path="currentStage.chapter" type="number" editData={editData} handleChange={handleChange} />
                    <InputField label="현재 스테이지" path="currentStage.stage" type="number" editData={editData} handleChange={handleChange} />
                    <InputField label="최고 챕터" path="maxStage.chapter" type="number" editData={editData} handleChange={handleChange} />
                    <InputField label="최고 스테이지" path="maxStage.stage" type="number" editData={editData} handleChange={handleChange} />
                </div>

                <button
                    onClick={handleSave}
                    disabled={saving}
                    style={{
                        marginTop: '30px',
                        padding: '15px 40px',
                        backgroundColor: '#4CAF50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '1.1rem',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        width: '100%'
                    }}
                >
                    {saving ? '저장 중...' : '💾 저장하기'}
                </button>
            </div>
        </div>
    );
};

export default AdminPage;
