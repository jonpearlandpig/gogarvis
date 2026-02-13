import { useState, useEffect } from 'react';
import axios from 'axios';
import { API, useAuth } from '@/App';
import { Bot, Plus, Edit2, Trash2, X, Save, History } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

const categoryColors = {
    'Core Resolution': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    'Business': 'bg-green-500/20 text-green-400 border-green-500/30',
    'Creative': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    'Systems': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    'Quality': 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    'Optional': 'bg-gray-500/20 text-gray-400 border-gray-500/30',
};

const OperatorCard = ({ operator, onEdit, onDelete, canEdit }) => (
    <div className="bg-card border border-border p-6 hover:border-primary/50 transition-colors" data-testid={`operator-${operator.operator_id}`}>
        <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 border border-primary flex items-center justify-center">
                    <Bot size={18} className="text-primary" />
                </div>
                <div>
                    <div className="font-mono text-xs text-muted-foreground">{operator.tai_d}</div>
                    <div className="font-mono text-sm font-bold uppercase">{operator.name}</div>
                </div>
            </div>
            {canEdit && (
                <div className="flex gap-2">
                    <button onClick={() => onEdit(operator)} className="p-2 hover:bg-secondary" data-testid={`edit-operator-${operator.operator_id}`}>
                        <Edit2 size={14} />
                    </button>
                    <button onClick={() => onDelete(operator)} className="p-2 hover:bg-destructive/20 text-destructive" data-testid={`delete-operator-${operator.operator_id}`}>
                        <Trash2 size={14} />
                    </button>
                </div>
            )}
        </div>
        <p className="text-sm text-muted-foreground mb-4">{operator.capabilities}</p>
        <div className="flex flex-wrap gap-2">
            <span className={`px-2 py-1 font-mono text-[10px] border ${categoryColors[operator.category] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'}`}>
                {operator.category}
            </span>
            <span className="px-2 py-1 font-mono text-[10px] bg-secondary border border-border">{operator.role}</span>
            <span className={`px-2 py-1 font-mono text-[10px] border ${operator.status === 'LOCKED' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-gray-500/20 text-gray-400 border-gray-500/30'}`}>
                {operator.status}
            </span>
        </div>
        <div className="mt-3 pt-3 border-t border-border">
            <span className="font-mono text-[10px] text-muted-foreground">AUTHORITY: {operator.authority}</span>
        </div>
    </div>
);

const OperatorForm = ({ operator, onSave, onCancel }) => {
    const [form, setForm] = useState(operator || {
        tai_d: '', name: '', capabilities: '', role: '', authority: '', status: 'LOCKED', category: 'Core Resolution'
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(form);
    };

    return (
        <form onSubmit={handleSubmit} className="bg-card border border-border p-6 space-y-4">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-mono text-lg font-bold uppercase">{operator ? 'EDIT OPERATOR' : 'NEW OPERATOR'}</h3>
                <button type="button" onClick={onCancel} className="p-2 hover:bg-secondary"><X size={18} /></button>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="font-mono text-xs text-muted-foreground block mb-2">TAI-D IDENTIFIER</label>
                    <input value={form.tai_d} onChange={(e) => setForm({...form, tai_d: e.target.value})} className="w-full bg-background border border-border px-3 py-2 font-mono text-sm" placeholder="TAI-D-XXX" required />
                </div>
                <div>
                    <label className="font-mono text-xs text-muted-foreground block mb-2">NAME</label>
                    <input value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="w-full bg-background border border-border px-3 py-2 font-mono text-sm" required />
                </div>
            </div>
            <div>
                <label className="font-mono text-xs text-muted-foreground block mb-2">CAPABILITIES</label>
                <textarea value={form.capabilities} onChange={(e) => setForm({...form, capabilities: e.target.value})} className="w-full bg-background border border-border px-3 py-2 font-mono text-sm h-20" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="font-mono text-xs text-muted-foreground block mb-2">ROLE</label>
                    <input value={form.role} onChange={(e) => setForm({...form, role: e.target.value})} className="w-full bg-background border border-border px-3 py-2 font-mono text-sm" required />
                </div>
                <div>
                    <label className="font-mono text-xs text-muted-foreground block mb-2">AUTHORITY</label>
                    <input value={form.authority} onChange={(e) => setForm({...form, authority: e.target.value})} className="w-full bg-background border border-border px-3 py-2 font-mono text-sm" required />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="font-mono text-xs text-muted-foreground block mb-2">STATUS</label>
                    <select value={form.status} onChange={(e) => setForm({...form, status: e.target.value})} className="w-full bg-background border border-border px-3 py-2 font-mono text-sm">
                        <option value="LOCKED">LOCKED</option>
                        <option value="INACTIVE">INACTIVE</option>
                        <option value="ACTIVE">ACTIVE</option>
                    </select>
                </div>
                <div>
                    <label className="font-mono text-xs text-muted-foreground block mb-2">CATEGORY</label>
                    <select value={form.category} onChange={(e) => setForm({...form, category: e.target.value})} className="w-full bg-background border border-border px-3 py-2 font-mono text-sm">
                        <option value="Core Resolution">Core Resolution</option>
                        <option value="Business">Business</option>
                        <option value="Creative">Creative</option>
                        <option value="Systems">Systems</option>
                        <option value="Quality">Quality</option>
                        <option value="Optional">Optional</option>
                    </select>
                </div>
            </div>
            <button type="submit" className="w-full bg-primary text-primary-foreground p-3 font-mono text-sm tracking-wider uppercase flex items-center justify-center gap-2">
                <Save size={16} /> SAVE OPERATOR
            </button>
        </form>
    );
};

const PigPen = () => {
    const { user, canEdit } = useAuth();
    const [operators, setOperators] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingOperator, setEditingOperator] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('all');

    useEffect(() => { fetchOperators(); }, [selectedCategory]);

    const fetchOperators = async () => {
        try {
            const params = selectedCategory !== 'all' ? `?category=${selectedCategory}` : '';
            const res = await axios.get(`${API}/pigpen${params}`);
            setOperators(res.data.operators);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (form) => {
        try {
            if (editingOperator) {
                await axios.put(`${API}/pigpen/${editingOperator.operator_id}`, form, { withCredentials: true });
                toast.success('Operator updated');
            } else {
                await axios.post(`${API}/pigpen`, form, { withCredentials: true });
                toast.success('Operator created');
            }
            setShowForm(false);
            setEditingOperator(null);
            fetchOperators();
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Error saving operator');
        }
    };

    const handleDelete = async (operator) => {
        if (!window.confirm(`Delete ${operator.name}?`)) return;
        try {
            await axios.delete(`${API}/pigpen/${operator.operator_id}`, { withCredentials: true });
            toast.success('Operator deleted');
            fetchOperators();
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Error deleting operator');
        }
    };

    return (
        <div className="space-y-6" data-testid="pigpen-page">
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="font-mono text-3xl md:text-4xl font-bold tracking-tighter uppercase">PIG PEN</h1>
                    <p className="text-muted-foreground font-mono text-sm">Non-Human Cognition Operators Registry (TAI-D)</p>
                </div>
                {canEdit() && (
                    <button onClick={() => { setEditingOperator(null); setShowForm(true); }} className="bg-primary text-primary-foreground px-4 py-2 font-mono text-xs tracking-wider flex items-center gap-2" data-testid="add-operator-btn">
                        <Plus size={16} /> ADD OPERATOR
                    </button>
                )}
            </div>

            {showForm && <OperatorForm operator={editingOperator} onSave={handleSave} onCancel={() => { setShowForm(false); setEditingOperator(null); }} />}

            <div className="flex gap-2 flex-wrap">
                {['all', 'Core Resolution', 'Business', 'Creative', 'Systems', 'Quality', 'Optional'].map(cat => (
                    <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-3 py-1.5 font-mono text-xs tracking-wider uppercase ${selectedCategory === cat ? 'bg-primary text-primary-foreground' : 'bg-secondary border border-border text-muted-foreground hover:text-foreground'}`}>
                        {cat}
                    </button>
                ))}
            </div>

            <ScrollArea className="h-[600px]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-4">
                    {loading ? (
                        <div className="col-span-2 text-center py-12 font-mono text-sm text-muted-foreground">LOADING...</div>
                    ) : operators.map(op => (
                        <OperatorCard key={op.operator_id} operator={op} onEdit={(o) => { setEditingOperator(o); setShowForm(true); }} onDelete={handleDelete} canEdit={canEdit()} />
                    ))}
                </div>
            </ScrollArea>
        </div>
    );
};

export default PigPen;
