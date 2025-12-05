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
    const [activeTab, setActiveTab] = useState('users'); // 'users' or 'mail'

    // Mail sending state
    const [mailForm, setMailForm] = useState({
        title: '',
        message: '',
        diamond: 0,
        gold: 0,
        targetType: 'all' // 'all' or 'specific'
    });
    const [sendingMail, setSendingMail] = useState(false);

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

    const sendMail = async () => {
        if (!mailForm.title || !mailForm.message) {
            alert('제목과 메시지를 입력해주세요.');
            return;
        }

        if (mailForm.diamond === 0 && mailForm.gold === 0) {
            if (!confirm('보상이 없는 우편을 발송하시겠습니까?')) {
                return;
            }
        }

        setSendingMail(true);
        try {
            const mail = {
                id: Date.now().toString(),
                title: mailForm.title,
                message: mailForm.message,
                rewards: {
                    diamond: Number(mailForm.diamond) || 0,
                    gold: parseAlphabetNumber(mailForm.gold) || 0
                },
                isRead: false,
                isRewardClaimed: false,
                createdAt: Date.now()
            };

            // Get target users
            let targetUsers = [];
            if (mailForm.targetType === 'all') {
                targetUsers = users;
            } else if (selectedUser) {
                targetUsers = [selectedUser];
            }

            if (targetUsers.length === 0) {
                alert('발송 대상이 없습니다.');
                return;
            }

            // Send mail to each user
            for (const user of targetUsers) {
                // Fetch latest game_data from server to get current mailbox
                const { data: latestUserData, error: fetchError } = await supabase
                    .from('users')
                    .select('game_data')
                    .eq('id', user.id)
                    .single();

                if (fetchError) {
                    console.error(`Failed to fetch user ${user.id}:`, fetchError);
                    continue;
                }

                const currentMailbox = latestUserData.game_data?.mailbox || [];
                const updatedMailbox = [...currentMailbox, mail];

                await supabase
                    .from('users')
                    .update({
                        game_data: {
                            ...latestUserData.game_data,
                            mailbox: updatedMailbox
                        }
                    })
                    .eq('id', user.id);
            }

            alert(`${targetUsers.length}명에게 우편이 발송되었습니다!`);

            // Reset form
            setMailForm({
                title: '',
                message: '',
                diamond: 0,
                gold: 0,
                targetType: 'all'
            });

            // Refresh users
            await fetchUsers();
        } catch (err) {
            console.error('Error sending mail:', err);
            alert('우편 발송 실패');
        } finally {
            setSendingMail(false);
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

                {/* Tab Navigation */}
                <div style={{
                    display: 'flex',
                    gap: '10px',
                    marginBottom: '20px',
                    borderBottom: '2px solid #444'
                }}>
                    <button
                        onClick={() => setActiveTab('users')}
                        style={{
                            padding: '12px 24px',
                            backgroundColor: activeTab === 'users' ? '#4CAF50' : 'transparent',
                            color: 'white',
                            border: 'none',
                            borderBottom: activeTab === 'users' ? '3px solid #4CAF50' : 'none',
                            cursor: 'pointer',
                            fontSize: '1rem',
                            fontWeight: 'bold',
                            transition: 'all 0.2s'
                        }}
                    >
                        👥 사용자 관리
                    </button>
                    <button
                        onClick={() => setActiveTab('mail')}
                        style={{
                            padding: '12px 24px',
                            backgroundColor: activeTab === 'mail' ? '#FFD700' : 'transparent',
                            color: activeTab === 'mail' ? '#000' : 'white',
                            border: 'none',
                            borderBottom: activeTab === 'mail' ? '3px solid #FFD700' : 'none',
                            cursor: 'pointer',
                            fontSize: '1rem',
                            fontWeight: 'bold',
                            transition: 'all 0.2s'
                        }}
                    >
                        📬 우편 발송
                    </button>
                </div>

                {/* Users Tab */}
                {activeTab === 'users' && (
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
                )}

                {/* Mail Tab */}
                {activeTab === 'mail' && (
                    <div style={{ maxWidth: '600px' }}>
                        <h2 style={{ marginBottom: '20px' }}>📬 우편 발송</h2>

                        {/* Target Type */}
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '10px', color: '#aaa' }}>
                                발송 대상
                            </label>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button
                                    onClick={() => setMailForm({ ...mailForm, targetType: 'all' })}
                                    style={{
                                        padding: '10px 20px',
                                        backgroundColor: mailForm.targetType === 'all' ? '#4CAF50' : '#2a2a2a',
                                        color: 'white',
                                        border: '2px solid ' + (mailForm.targetType === 'all' ? '#4CAF50' : '#444'),
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    전체 사용자 ({users.length}명)
                                </button>
                            </div>
                        </div>

                        {/* Title */}
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '10px', color: '#aaa' }}>
                                제목
                            </label>
                            <input
                                type="text"
                                value={mailForm.title}
                                onChange={(e) => setMailForm({ ...mailForm, title: e.target.value })}
                                placeholder="우편 제목을 입력하세요"
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    backgroundColor: '#2a2a2a',
                                    border: '1px solid #444',
                                    borderRadius: '8px',
                                    color: 'white',
                                    fontSize: '1rem'
                                }}
                            />
                        </div>

                        {/* Message */}
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '10px', color: '#aaa' }}>
                                메시지
                            </label>
                            <textarea
                                value={mailForm.message}
                                onChange={(e) => setMailForm({ ...mailForm, message: e.target.value })}
                                placeholder="우편 내용을 입력하세요"
                                rows={6}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    backgroundColor: '#2a2a2a',
                                    border: '1px solid #444',
                                    borderRadius: '8px',
                                    color: 'white',
                                    fontSize: '1rem',
                                    resize: 'vertical'
                                }}
                            />
                        </div>

                        {/* Rewards */}
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '10px', color: '#aaa' }}>
                                보상
                            </label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', color: '#888', fontSize: '0.9rem' }}>
                                        💎 다이아
                                    </label>
                                    <input
                                        type="number"
                                        value={mailForm.diamond}
                                        onChange={(e) => setMailForm({ ...mailForm, diamond: e.target.value })}
                                        placeholder="0"
                                        style={{
                                            width: '100%',
                                            padding: '10px',
                                            backgroundColor: '#2a2a2a',
                                            border: '1px solid #444',
                                            borderRadius: '8px',
                                            color: 'white',
                                            fontSize: '1rem'
                                        }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', color: '#888', fontSize: '0.9rem' }}>
                                        💰 골드 (알파벳 가능)
                                    </label>
                                    <input
                                        type="text"
                                        value={mailForm.gold}
                                        onChange={(e) => setMailForm({ ...mailForm, gold: e.target.value })}
                                        placeholder="예: 100K, 1M"
                                        style={{
                                            width: '100%',
                                            padding: '10px',
                                            backgroundColor: '#2a2a2a',
                                            border: '1px solid #444',
                                            borderRadius: '8px',
                                            color: 'white',
                                            fontSize: '1rem'
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Preview */}
                        <div style={{
                            backgroundColor: 'rgba(255, 215, 0, 0.1)',
                            border: '2px solid rgba(255, 215, 0, 0.3)',
                            borderRadius: '10px',
                            padding: '15px',
                            marginBottom: '20px'
                        }}>
                            <div style={{ color: '#FFD700', fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '10px' }}>
                                📋 미리보기
                            </div>
                            <div style={{ color: 'white', fontWeight: 'bold', marginBottom: '5px' }}>
                                {mailForm.title || '(제목 없음)'}
                            </div>
                            <div style={{ color: '#ddd', fontSize: '0.9rem', marginBottom: '10px', whiteSpace: 'pre-wrap' }}>
                                {mailForm.message || '(메시지 없음)'}
                            </div>
                            {(mailForm.diamond > 0 || mailForm.gold > 0) && (
                                <div style={{ display: 'flex', gap: '10px', fontSize: '0.9rem' }}>
                                    {mailForm.diamond > 0 && <span>💎 {mailForm.diamond}</span>}
                                    {mailForm.gold > 0 && <span>💰 {mailForm.gold}</span>}
                                </div>
                            )}
                        </div>

                        {/* Send Button */}
                        <button
                            onClick={sendMail}
                            disabled={sendingMail}
                            style={{
                                width: '100%',
                                padding: '15px',
                                backgroundColor: '#FFD700',
                                color: '#000',
                                border: 'none',
                                borderRadius: '10px',
                                fontSize: '1.1rem',
                                fontWeight: 'bold',
                                cursor: sendingMail ? 'not-allowed' : 'pointer',
                                opacity: sendingMail ? 0.6 : 1
                            }}
                        >
                            {sendingMail ? '발송 중...' : `📬 ${mailForm.targetType === 'all' ? `전체 사용자 (${users.length}명)` : '선택한 사용자'}에게 발송`}
                        </button>
                    </div>
                )}
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
