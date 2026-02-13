import { useState, useEffect } from 'react';
import axios from 'axios';
import { API, useAuth } from '@/App';
import { Users, Shield, Edit2, User } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const roleColors = {
    admin: 'bg-red-500/20 text-red-400 border-red-500/30',
    editor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    viewer: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
};

const UserCard = ({ userData, onUpdateRole, currentUserId }) => {
    const [editing, setEditing] = useState(false);
    const [newRole, setNewRole] = useState(userData.role);

    const handleSave = () => {
        onUpdateRole(userData.user_id, newRole);
        setEditing(false);
    };

    return (
        <div className="bg-card border border-border p-6" data-testid={`user-${userData.user_id}`}>
            <div className="flex items-start gap-4">
                {userData.picture ? (
                    <img src={userData.picture} alt={userData.name} className="w-12 h-12 rounded-full" />
                ) : (
                    <div className="w-12 h-12 bg-secondary flex items-center justify-center">
                        <User size={20} className="text-muted-foreground" />
                    </div>
                )}
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-sm font-bold">{userData.name}</span>
                        {userData.user_id === currentUserId && (
                            <span className="px-2 py-0.5 bg-primary/20 text-primary font-mono text-[10px] border border-primary/30">YOU</span>
                        )}
                    </div>
                    <div className="font-mono text-xs text-muted-foreground mb-3">{userData.email}</div>
                    
                    {editing ? (
                        <div className="flex items-center gap-2">
                            <select value={newRole} onChange={(e) => setNewRole(e.target.value)} className="bg-background border border-border px-3 py-1.5 font-mono text-xs">
                                <option value="viewer">VIEWER</option>
                                <option value="editor">EDITOR</option>
                                <option value="admin">ADMIN</option>
                            </select>
                            <button onClick={handleSave} className="px-3 py-1.5 bg-primary text-primary-foreground font-mono text-xs">SAVE</button>
                            <button onClick={() => setEditing(false)} className="px-3 py-1.5 bg-secondary font-mono text-xs">CANCEL</button>
                        </div>
                    ) : (
                        <div className="flex items-center justify-between">
                            <span className={`px-2 py-1 font-mono text-[10px] uppercase border ${roleColors[userData.role]}`}>
                                {userData.role}
                            </span>
                            {userData.user_id !== currentUserId && (
                                <button onClick={() => setEditing(true)} className="p-2 hover:bg-secondary" data-testid={`edit-role-${userData.user_id}`}>
                                    <Edit2 size={14} />
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
            <div className="mt-4 pt-4 border-t border-border">
                <div className="font-mono text-[10px] text-muted-foreground">
                    JOINED: {new Date(userData.created_at).toLocaleDateString()}
                </div>
            </div>
        </div>
    );
};

const AdminUsers = () => {
    const { user, isAdmin } = useAuth();
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user || !isAdmin()) {
            navigate('/');
            return;
        }
        fetchUsers();
    }, [user]);

    const fetchUsers = async () => {
        try {
            const res = await axios.get(`${API}/admin/users`, { withCredentials: true });
            setUsers(res.data.users);
        } catch (error) {
            console.error('Error:', error);
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateRole = async (userId, newRole) => {
        try {
            await axios.put(`${API}/admin/users/${userId}/role`, { role: newRole }, { withCredentials: true });
            toast.success('Role updated');
            fetchUsers();
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Failed to update role');
        }
    };

    if (!user || !isAdmin()) return null;

    return (
        <div className="space-y-6" data-testid="admin-users-page">
            <div>
                <h1 className="font-mono text-3xl md:text-4xl font-bold tracking-tighter uppercase">USER MANAGEMENT</h1>
                <p className="text-muted-foreground font-mono text-sm">Manage user roles and permissions</p>
            </div>

            <div className="bg-card border border-border p-4 flex items-center gap-4">
                <Shield size={20} className="text-primary" />
                <div>
                    <div className="font-mono text-xs text-muted-foreground">ROLE HIERARCHY</div>
                    <div className="font-mono text-sm">ADMIN > EDITOR > VIEWER</div>
                </div>
            </div>

            <div className="font-mono text-xs text-muted-foreground">{users.length} USERS</div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {loading ? (
                    <div className="col-span-3 text-center py-12 font-mono text-sm text-muted-foreground">LOADING...</div>
                ) : users.map(u => (
                    <UserCard key={u.user_id} userData={u} onUpdateRole={handleUpdateRole} currentUserId={user.user_id} />
                ))}
            </div>
        </div>
    );
};

export default AdminUsers;
