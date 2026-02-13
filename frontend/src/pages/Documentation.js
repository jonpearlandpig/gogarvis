import { useState, useEffect } from 'react';
import axios from 'axios';
import { API, useAuth } from '@/App';
import { 
    FileText, 
    Search, 
    X,
    Plus,
    Edit2,
    Trash2,
    Save,
    History
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

const CategoryBadge = ({ category }) => {
    const colors = {
        'Architecture': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        'Reference': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
        'GARVIS': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
        'Telauthorium': 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
        'Identity': 'bg-green-500/20 text-green-400 border-green-500/30',
        'Flightpath': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
        'MOSE': 'bg-pink-500/20 text-pink-400 border-pink-500/30',
        'TELA': 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
        'Pig Pen': 'bg-red-500/20 text-red-400 border-red-500/30',
        'Audit': 'bg-teal-500/20 text-teal-400 border-teal-500/30',
        'ECOS': 'bg-violet-500/20 text-violet-400 border-violet-500/30',
        'Enforcement': 'bg-rose-500/20 text-rose-400 border-rose-500/30',
    };
    
    return (
        <span className={`px-2 py-1 font-mono text-[10px] tracking-wider uppercase border ${colors[category] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'}`}>
            {category}
        </span>
    );
};

const DocumentCard = ({ doc, onClick, onEdit, onDelete, isSelected, canEdit }) => (
    <div 
        className={`p-4 border cursor-pointer transition-colors duration-100 ${isSelected ? 'bg-primary/10 border-primary' : 'bg-card border-border hover:border-primary/50'}`}
        data-testid={`doc-card-${doc.doc_id?.slice(0, 8) || doc.filename?.slice(0, 8)}`}
    >
        <div className="flex items-start gap-3">
            <FileText size={18} className={isSelected ? 'text-primary' : 'text-muted-foreground'} strokeWidth={1.5} onClick={onClick} />
            <div className="flex-1 min-w-0" onClick={onClick}>
                <div className="font-mono text-sm font-semibold line-clamp-2 mb-2">{doc.title}</div>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{doc.description}</p>
                <CategoryBadge category={doc.category} />
            </div>
            {canEdit && (
                <div className="flex flex-col gap-1">
                    <button onClick={(e) => { e.stopPropagation(); onEdit(doc); }} className="p-1.5 hover:bg-secondary" data-testid={`edit-doc-${doc.doc_id?.slice(0, 8)}`}>
                        <Edit2 size={12} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); onDelete(doc); }} className="p-1.5 hover:bg-destructive/20 text-destructive" data-testid={`delete-doc-${doc.doc_id?.slice(0, 8)}`}>
                        <Trash2 size={12} />
                    </button>
                </div>
            )}
        </div>
    </div>
);

const DocumentForm = ({ doc, categories, onSave, onCancel }) => {
    const [form, setForm] = useState(doc || {
        filename: '', title: '', category: 'Reference', description: '', content: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(form);
    };

    return (
        <form onSubmit={handleSubmit} className="bg-card border border-border p-6 space-y-4">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-mono text-lg font-bold uppercase">{doc ? 'EDIT DOCUMENT' : 'NEW DOCUMENT'}</h3>
                <button type="button" onClick={onCancel} className="p-2 hover:bg-secondary"><X size={18} /></button>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="font-mono text-xs text-muted-foreground block mb-2">TITLE *</label>
                    <input value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} className="w-full bg-background border border-border px-3 py-2 font-mono text-sm" required />
                </div>
                <div>
                    <label className="font-mono text-xs text-muted-foreground block mb-2">CATEGORY *</label>
                    <select value={form.category} onChange={(e) => setForm({...form, category: e.target.value})} className="w-full bg-background border border-border px-3 py-2 font-mono text-sm">
                        {['Architecture', 'Reference', 'GARVIS', 'Telauthorium', 'Identity', 'Flightpath', 'MOSE', 'TELA', 'Pig Pen', 'Audit', 'ECOS', 'Enforcement', 'Custom'].map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>
            </div>
            <div>
                <label className="font-mono text-xs text-muted-foreground block mb-2">FILENAME</label>
                <input value={form.filename} onChange={(e) => setForm({...form, filename: e.target.value})} className="w-full bg-background border border-border px-3 py-2 font-mono text-sm" placeholder="optional - for reference" />
            </div>
            <div>
                <label className="font-mono text-xs text-muted-foreground block mb-2">DESCRIPTION *</label>
                <textarea value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} className="w-full bg-background border border-border px-3 py-2 font-mono text-sm h-20" required />
            </div>
            <div>
                <label className="font-mono text-xs text-muted-foreground block mb-2">CONTENT</label>
                <textarea value={form.content} onChange={(e) => setForm({...form, content: e.target.value})} className="w-full bg-background border border-border px-3 py-2 font-mono text-sm h-40" placeholder="Document content (text, markdown, or paste from PDF)" />
            </div>
            <button type="submit" className="w-full bg-primary text-primary-foreground p-3 font-mono text-sm tracking-wider uppercase flex items-center justify-center gap-2">
                <Save size={16} /> SAVE DOCUMENT
            </button>
        </form>
    );
};

const Documentation = () => {
    const { canEdit } = useAuth();
    const [documents, setDocuments] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDoc, setSelectedDoc] = useState(null);
    const [docContent, setDocContent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadingContent, setLoadingContent] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingDoc, setEditingDoc] = useState(null);

    useEffect(() => {
        fetchDocs();
    }, [selectedCategory, searchQuery]);

    const fetchDocs = async () => {
        try {
            const params = new URLSearchParams();
            if (selectedCategory !== 'all') params.append('category', selectedCategory);
            if (searchQuery) params.append('search', searchQuery);
            
            const [docsRes, categoriesRes] = await Promise.all([
                axios.get(`${API}/documents?${params.toString()}`),
                axios.get(`${API}/documents/categories/list`)
            ]);
            
            setDocuments(docsRes.data.documents);
            setCategories(categoriesRes.data.categories);
        } catch (error) {
            console.error('Error fetching documents:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadDocContent = async (doc) => {
        setSelectedDoc(doc);
        setLoadingContent(true);
        try {
            const res = await axios.get(`${API}/documents/${doc.doc_id}`);
            setDocContent(res.data);
        } catch (error) {
            console.error('Error loading document:', error);
            setDocContent({ ...doc, content: 'Error loading document content.' });
        } finally {
            setLoadingContent(false);
        }
    };

    const handleSave = async (form) => {
        try {
            if (editingDoc) {
                await axios.put(`${API}/documents/${editingDoc.doc_id}`, form, { withCredentials: true });
                toast.success('Document updated');
            } else {
                await axios.post(`${API}/documents`, form, { withCredentials: true });
                toast.success('Document created');
            }
            setShowForm(false);
            setEditingDoc(null);
            fetchDocs();
            // Refresh content if viewing the edited doc
            if (selectedDoc?.doc_id === editingDoc?.doc_id) {
                loadDocContent({ doc_id: editingDoc.doc_id });
            }
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Error saving document');
        }
    };

    const handleDelete = async (doc) => {
        if (!window.confirm(`Delete "${doc.title}"?`)) return;
        try {
            await axios.delete(`${API}/documents/${doc.doc_id}`, { withCredentials: true });
            toast.success('Document deleted');
            if (selectedDoc?.doc_id === doc.doc_id) {
                setSelectedDoc(null);
                setDocContent(null);
            }
            fetchDocs();
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Error deleting document');
        }
    };

    const handleEdit = (doc) => {
        setEditingDoc(doc);
        setShowForm(true);
    };

    return (
        <div className="space-y-6" data-testid="documentation-page">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div className="space-y-2">
                    <h1 className="font-mono text-3xl md:text-4xl font-bold tracking-tighter uppercase">
                        DOCUMENTATION
                    </h1>
                    <p className="text-muted-foreground font-mono text-sm">
                        Browse, search, and manage system specifications
                    </p>
                </div>
                {canEdit() && (
                    <button 
                        onClick={() => { setEditingDoc(null); setShowForm(true); }} 
                        className="bg-primary text-primary-foreground px-4 py-2 font-mono text-xs tracking-wider flex items-center gap-2"
                        data-testid="add-document-btn"
                    >
                        <Plus size={16} /> ADD DOCUMENT
                    </button>
                )}
            </div>

            {/* Form */}
            {showForm && (
                <DocumentForm 
                    doc={editingDoc} 
                    categories={categories}
                    onSave={handleSave} 
                    onCancel={() => { setShowForm(false); setEditingDoc(null); }} 
                />
            )}

            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search documents..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-card border border-border pl-10 pr-4 py-3 font-mono text-sm focus:outline-none focus:border-primary"
                        data-testid="doc-search-input"
                    />
                    {searchQuery && (
                        <button 
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            onClick={() => setSearchQuery('')}
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>
                <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="bg-card border border-border px-4 py-3 font-mono text-sm focus:outline-none focus:border-primary min-w-[180px]"
                    data-testid="doc-category-select"
                >
                    <option value="all">ALL CATEGORIES</option>
                    {categories.map(cat => (
                        <option key={cat} value={cat}>{cat.toUpperCase()}</option>
                    ))}
                </select>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Document List */}
                <div className="lg:col-span-1 space-y-2">
                    <div className="font-mono text-xs text-muted-foreground tracking-wider mb-4">
                        {documents.length} DOCUMENTS FOUND
                    </div>
                    <ScrollArea className="h-[600px]">
                        <div className="space-y-2 pr-4">
                            {loading ? (
                                <div className="text-center py-8 font-mono text-sm text-muted-foreground">LOADING...</div>
                            ) : documents.length === 0 ? (
                                <div className="text-center py-8 font-mono text-sm text-muted-foreground">NO DOCUMENTS FOUND</div>
                            ) : (
                                documents.map(doc => (
                                    <DocumentCard 
                                        key={doc.doc_id} 
                                        doc={doc} 
                                        onClick={() => loadDocContent(doc)}
                                        onEdit={handleEdit}
                                        onDelete={handleDelete}
                                        isSelected={selectedDoc?.doc_id === doc.doc_id}
                                        canEdit={canEdit()}
                                    />
                                ))
                            )}
                        </div>
                    </ScrollArea>
                </div>

                {/* Document Viewer */}
                <div className="lg:col-span-2">
                    {!selectedDoc ? (
                        <div className="h-[600px] border border-border bg-card flex items-center justify-center">
                            <div className="text-center">
                                <FileText size={48} className="text-muted-foreground mx-auto mb-4" strokeWidth={1} />
                                <p className="font-mono text-sm text-muted-foreground">SELECT A DOCUMENT TO VIEW</p>
                            </div>
                        </div>
                    ) : (
                        <div className="border border-border bg-card h-[600px] flex flex-col">
                            {/* Document Header */}
                            <div className="p-4 border-b border-border flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <h2 className="font-mono text-lg font-bold uppercase tracking-tight mb-2">{selectedDoc.title}</h2>
                                    <p className="text-sm text-muted-foreground mb-3">{selectedDoc.description}</p>
                                    <div className="flex items-center gap-2">
                                        <CategoryBadge category={selectedDoc.category} />
                                        {canEdit() && (
                                            <button 
                                                onClick={() => handleEdit(selectedDoc)}
                                                className="px-2 py-1 border border-border font-mono text-[10px] hover:bg-secondary flex items-center gap-1"
                                                data-testid="edit-current-doc"
                                            >
                                                <Edit2 size={10} /> EDIT
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <button 
                                    className="p-2 hover:bg-secondary transition-colors"
                                    onClick={() => { setSelectedDoc(null); setDocContent(null); }}
                                    data-testid="close-doc-viewer"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                            
                            {/* Document Content */}
                            <ScrollArea className="flex-1">
                                <div className="p-6">
                                    {loadingContent ? (
                                        <div className="text-center py-8 font-mono text-sm text-muted-foreground animate-pulse">
                                            LOADING CONTENT...
                                        </div>
                                    ) : docContent?.content ? (
                                        <pre className="font-mono text-sm whitespace-pre-wrap text-foreground/90 leading-relaxed">
                                            {docContent.content}
                                        </pre>
                                    ) : (
                                        <div className="text-center py-8">
                                            <FileText size={32} className="text-muted-foreground mx-auto mb-4" />
                                            <p className="font-mono text-sm text-muted-foreground mb-4">
                                                No content available for this document.
                                            </p>
                                            {canEdit() && (
                                                <button 
                                                    onClick={() => handleEdit(selectedDoc)}
                                                    className="bg-primary text-primary-foreground px-4 py-2 font-mono text-xs tracking-wider"
                                                >
                                                    ADD CONTENT
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </ScrollArea>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Documentation;
