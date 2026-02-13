import { useState, useEffect } from 'react';
import axios from 'axios';
import { API, useAuth } from '@/App';
import { Palette, Plus, Edit2, Trash2, X, Save } from 'lucide-react';
import { toast } from 'sonner';

const BrandCard = ({ brand, onEdit, onDelete, canEdit }) => (
    <div className="bg-card border border-border p-6" data-testid={`brand-${brand.brand_id}`}>
        <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 border border-border flex items-center justify-center" style={{ backgroundColor: brand.primary_color }}>
                    <Palette size={20} className="text-white" />
                </div>
                <div>
                    <div className="font-mono text-lg font-bold uppercase">{brand.name}</div>
                    <div className="text-sm text-muted-foreground">{brand.description}</div>
                </div>
            </div>
            {canEdit && (
                <div className="flex gap-2">
                    <button onClick={() => onEdit(brand)} className="p-2 hover:bg-secondary"><Edit2 size={14} /></button>
                    <button onClick={() => onDelete(brand)} className="p-2 hover:bg-destructive/20 text-destructive"><Trash2 size={14} /></button>
                </div>
            )}
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
                <div className="font-mono text-[10px] text-muted-foreground mb-1">PRIMARY</div>
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 border border-border" style={{ backgroundColor: brand.primary_color }} />
                    <span className="font-mono text-xs">{brand.primary_color}</span>
                </div>
            </div>
            <div>
                <div className="font-mono text-[10px] text-muted-foreground mb-1">SECONDARY</div>
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 border border-border" style={{ backgroundColor: brand.secondary_color }} />
                    <span className="font-mono text-xs">{brand.secondary_color}</span>
                </div>
            </div>
        </div>
        <div className="space-y-2">
            <div className="flex justify-between">
                <span className="font-mono text-[10px] text-muted-foreground">HEADING FONT</span>
                <span className="font-mono text-xs">{brand.font_heading}</span>
            </div>
            <div className="flex justify-between">
                <span className="font-mono text-[10px] text-muted-foreground">BODY FONT</span>
                <span className="font-mono text-xs">{brand.font_body}</span>
            </div>
        </div>
        {brand.style_guidelines && (
            <div className="mt-4 pt-4 border-t border-border">
                <div className="font-mono text-[10px] text-muted-foreground mb-1">STYLE GUIDELINES</div>
                <p className="text-xs text-muted-foreground">{brand.style_guidelines}</p>
            </div>
        )}
    </div>
);

const BrandForm = ({ brand, onSave, onCancel }) => {
    const [form, setForm] = useState(brand || {
        name: '', description: '', primary_color: '#FF4500', secondary_color: '#1A1A1A',
        font_heading: 'JetBrains Mono', font_body: 'Manrope', logo_url: '', style_guidelines: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(form);
    };

    return (
        <form onSubmit={handleSubmit} className="bg-card border border-border p-6 space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="font-mono text-lg font-bold uppercase">{brand ? 'EDIT BRAND' : 'NEW BRAND'}</h3>
                <button type="button" onClick={onCancel} className="p-2 hover:bg-secondary"><X size={18} /></button>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="font-mono text-xs text-muted-foreground block mb-2">NAME</label>
                    <input value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="w-full bg-background border border-border px-3 py-2 font-mono text-sm" required />
                </div>
                <div>
                    <label className="font-mono text-xs text-muted-foreground block mb-2">LOGO URL</label>
                    <input value={form.logo_url || ''} onChange={(e) => setForm({...form, logo_url: e.target.value})} className="w-full bg-background border border-border px-3 py-2 font-mono text-sm" placeholder="https://..." />
                </div>
            </div>
            <div>
                <label className="font-mono text-xs text-muted-foreground block mb-2">DESCRIPTION</label>
                <textarea value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} className="w-full bg-background border border-border px-3 py-2 font-mono text-sm h-20" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="font-mono text-xs text-muted-foreground block mb-2">PRIMARY COLOR</label>
                    <div className="flex gap-2">
                        <input type="color" value={form.primary_color} onChange={(e) => setForm({...form, primary_color: e.target.value})} className="w-12 h-10 border border-border cursor-pointer" />
                        <input value={form.primary_color} onChange={(e) => setForm({...form, primary_color: e.target.value})} className="flex-1 bg-background border border-border px-3 py-2 font-mono text-sm" />
                    </div>
                </div>
                <div>
                    <label className="font-mono text-xs text-muted-foreground block mb-2">SECONDARY COLOR</label>
                    <div className="flex gap-2">
                        <input type="color" value={form.secondary_color} onChange={(e) => setForm({...form, secondary_color: e.target.value})} className="w-12 h-10 border border-border cursor-pointer" />
                        <input value={form.secondary_color} onChange={(e) => setForm({...form, secondary_color: e.target.value})} className="flex-1 bg-background border border-border px-3 py-2 font-mono text-sm" />
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="font-mono text-xs text-muted-foreground block mb-2">HEADING FONT</label>
                    <input value={form.font_heading} onChange={(e) => setForm({...form, font_heading: e.target.value})} className="w-full bg-background border border-border px-3 py-2 font-mono text-sm" />
                </div>
                <div>
                    <label className="font-mono text-xs text-muted-foreground block mb-2">BODY FONT</label>
                    <input value={form.font_body} onChange={(e) => setForm({...form, font_body: e.target.value})} className="w-full bg-background border border-border px-3 py-2 font-mono text-sm" />
                </div>
            </div>
            <div>
                <label className="font-mono text-xs text-muted-foreground block mb-2">STYLE GUIDELINES</label>
                <textarea value={form.style_guidelines} onChange={(e) => setForm({...form, style_guidelines: e.target.value})} className="w-full bg-background border border-border px-3 py-2 font-mono text-sm h-20" />
            </div>
            <button type="submit" className="w-full bg-primary text-primary-foreground p-3 font-mono text-sm tracking-wider uppercase flex items-center justify-center gap-2">
                <Save size={16} /> SAVE BRAND
            </button>
        </form>
    );
};

const Brands = () => {
    const { canEdit } = useAuth();
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingBrand, setEditingBrand] = useState(null);

    useEffect(() => { fetchBrands(); }, []);

    const fetchBrands = async () => {
        try {
            const res = await axios.get(`${API}/brands`);
            setBrands(res.data.brands);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (form) => {
        try {
            if (editingBrand) {
                await axios.put(`${API}/brands/${editingBrand.brand_id}`, form, { withCredentials: true });
                toast.success('Brand updated');
            } else {
                await axios.post(`${API}/brands`, form, { withCredentials: true });
                toast.success('Brand created');
            }
            setShowForm(false);
            setEditingBrand(null);
            fetchBrands();
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Error saving brand');
        }
    };

    const handleDelete = async (brand) => {
        if (!window.confirm(`Delete ${brand.name}?`)) return;
        try {
            await axios.delete(`${API}/brands/${brand.brand_id}`, { withCredentials: true });
            toast.success('Brand deleted');
            fetchBrands();
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Error deleting brand');
        }
    };

    return (
        <div className="space-y-6" data-testid="brands-page">
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="font-mono text-3xl md:text-4xl font-bold tracking-tighter uppercase">BRAND PROFILES</h1>
                    <p className="text-muted-foreground font-mono text-sm">Design system configurations and brand guidelines</p>
                </div>
                {canEdit() && (
                    <button onClick={() => { setEditingBrand(null); setShowForm(true); }} className="bg-primary text-primary-foreground px-4 py-2 font-mono text-xs tracking-wider flex items-center gap-2" data-testid="add-brand-btn">
                        <Plus size={16} /> ADD BRAND
                    </button>
                )}
            </div>

            {showForm && <BrandForm brand={editingBrand} onSave={handleSave} onCancel={() => { setShowForm(false); setEditingBrand(null); }} />}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {loading ? (
                    <div className="col-span-2 text-center py-12 font-mono text-sm text-muted-foreground">LOADING...</div>
                ) : brands.length === 0 ? (
                    <div className="col-span-2 text-center py-12">
                        <Palette size={48} className="text-muted-foreground mx-auto mb-4" />
                        <p className="font-mono text-sm text-muted-foreground">NO BRANDS CONFIGURED</p>
                    </div>
                ) : brands.map(brand => (
                    <BrandCard key={brand.brand_id} brand={brand} onEdit={(b) => { setEditingBrand(b); setShowForm(true); }} onDelete={handleDelete} canEdit={canEdit()} />
                ))}
            </div>
        </div>
    );
};

export default Brands;
