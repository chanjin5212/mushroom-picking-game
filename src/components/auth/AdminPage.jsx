import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { formatNumber } from '../../utils/formatNumber';

const AdminPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(null); // ID of user being saved
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('users')
                .select('id, username, game_data')
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Map data to editable format
            const formattedUsers = data.map(user => ({
                id: user.id,
                username: user.username,
                gold: user.game_data?.gold || 0,
                diamond: user.game_data?.diamond || 0,
                originalGold: user.game_data?.gold || 0,
                originalDiamond: user.game_data?.diamond || 0,
                game_data: user.game_data // Keep original game_data to preserve other fields
            }));

            setUsers(formattedUsers);
        } catch (err) {
            console.error('Error fetching users:', err);
            setError('사용자 목록을 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (id, field, value) => {
        setUsers(users.map(user => {
            if (user.id === id) {
                return { ...user, [field]: Number(value) };
            }
            return user;
        }));
    };

    const handleSave = async (user) => {
        setSaving(user.id);
        try {
            const updatedGameData = {
                ...user.game_data,
                gold: user.gold,
                diamond: user.diamond
            };

            const { error } = await supabase
                .from('users')
                .update({ game_data: updatedGameData })
                .eq('id', user.id);

            if (error) throw error;

            // Update original values to reflect saved state
            setUsers(users.map(u => {
                if (u.id === user.id) {
                    return { ...u, originalGold: u.gold, originalDiamond: u.diamond, game_data: updatedGameData };
                }
                return u;
            }));

            alert(`${user.username}님의 정보가 수정되었습니다.`);
        } catch (err) {
            console.error('Error updating user:', err);
            alert('저장에 실패했습니다.');
        } finally {
            setSaving(null);
        }
    };

    if (loading) {
        return <div style={{ padding: '20px', color: 'white' }}>로딩 중...</div>;
    }

    return (
        <div style={{
            padding: '20px',
            backgroundColor: '#1a1a1a',
            minHeight: '100vh',
            color: 'white',
            fontFamily: 'Arial, sans-serif'
        }}>
            <h1 style={{ marginBottom: '20px', borderBottom: '1px solid #333', paddingBottom: '10px' }}>
                🛠️ 관리자 페이지
            </h1>

            {error && <div style={{ color: 'red', marginBottom: '20px' }}>{error}</div>}

            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#333', textAlign: 'left' }}>
                            <th style={{ padding: '12px', borderBottom: '1px solid #444' }}>Username</th>
                            <th style={{ padding: '12px', borderBottom: '1px solid #444' }}>Gold</th>
                            <th style={{ padding: '12px', borderBottom: '1px solid #444' }}>Diamond</th>
                            <th style={{ padding: '12px', borderBottom: '1px solid #444' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => {
                            const isModified = user.gold !== user.originalGold || user.diamond !== user.originalDiamond;

                            return (
                                <tr key={user.id} style={{ borderBottom: '1px solid #2a2a2a' }}>
                                    <td style={{ padding: '12px' }}>
                                        <div style={{ fontWeight: 'bold' }}>{user.username}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#666' }}>{user.id.substring(0, 8)}...</div>
                                    </td>
                                    <td style={{ padding: '12px' }}>
                                        <input
                                            type="number"
                                            value={user.gold}
                                            onChange={(e) => handleInputChange(user.id, 'gold', e.target.value)}
                                            style={{
                                                background: '#222',
                                                border: '1px solid #444',
                                                color: '#ffd700',
                                                padding: '8px',
                                                borderRadius: '4px',
                                                width: '150px'
                                            }}
                                        />
                                        <div style={{ fontSize: '0.8rem', color: '#888', marginTop: '4px' }}>
                                            {formatNumber(user.gold)}
                                        </div>
                                    </td>
                                    <td style={{ padding: '12px' }}>
                                        <input
                                            type="number"
                                            value={user.diamond}
                                            onChange={(e) => handleInputChange(user.id, 'diamond', e.target.value)}
                                            style={{
                                                background: '#222',
                                                border: '1px solid #444',
                                                color: '#00bfff',
                                                padding: '8px',
                                                borderRadius: '4px',
                                                width: '100px'
                                            }}
                                        />
                                    </td>
                                    <td style={{ padding: '12px' }}>
                                        <button
                                            onClick={() => handleSave(user)}
                                            disabled={!isModified || saving === user.id}
                                            style={{
                                                padding: '8px 16px',
                                                backgroundColor: isModified ? '#4CAF50' : '#444',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: isModified ? 'pointer' : 'default',
                                                opacity: (isModified && saving !== user.id) ? 1 : 0.5
                                            }}
                                        >
                                            {saving === user.id ? '저장 중...' : '저장'}
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminPage;
