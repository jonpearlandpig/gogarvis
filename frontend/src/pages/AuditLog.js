import { useState, useEffect } from 'react';
import axios from 'axios';
import { API, useAuth } from '@/App';
import { History, User, FileText, Bot, Palette, BookOpen, Network, LogIn, LogOut, RefreshCw } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNavigate } from 'react-router-dom';

const actionIcons = {
    create: <FileText size={14} className="text-green-400" />,
    update: <RefreshCw size={14} className="text-blue-400" />,
    delete: <FileText size={14} className="text-red-400" />,
    rollback: <History size={14} className="text-yellow-400" />,
    login: <LogIn size={14} className="text-cyan-400" />,
    logout: <LogOut size={14} className="text-gray-400" />,
};

const contentTypeIcons = {
    document: <FileText size={14} />,
    glossary: <BookOpen size={14} />,
    component: <Network size={14} />,
    pigpen: <Bot size={14} />,
    brand: <Palette size={14} />,
    auth: <User size={14} />,
    user: <User size={14} />,
};

const AuditLogEntry = ({ entry }) => (
    <div className="bg-card border border-border p-4 flex items-start gap-4" data-testid={`audit-entry-${entry.log_id}`}>
        <div className="w-10 h-10 border border-border flex items-center justify-center flex-shrink-0">
            {contentTypeIcons[entry.content_type] || <FileText size={14} />}
        </div>
        <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
                {actionIcons[entry.action]}
                <span className="font-mono text-xs uppercase text-muted-foreground">{entry.action}</span>
                <span className="font-mono text-xs text-muted-foreground">•</span>
                <span className="font-mono text-xs uppercase">{entry.content_type}</span>
            </div>
            <div className="font-mono text-sm font-semibold truncate">{entry.content_title}</div>
            <div className="flex items-center gap-2 mt-2">
                <span className="font-mono text-[10px] text-muted-foreground">BY {entry.user_name}</span>
                <span className="font-mono text-[10px] text-muted-foreground">•</span>
                <span className="font-mono text-[10px] text-muted-foreground">{new Date(entry.timestamp).toLocaleString()}</span>
            </div>
            {entry.details && Object.keys(entry.details).length > 0 && (
                <div className="mt-2 p-2 bg-background border border-border">
                    <pre className="font-mono text-[10px] text-muted-foreground overflow-x-auto">
                        {JSON.stringify(entry.details, null, 2)}
                    </pre>
                </div>
            )}
        </div>
    </div>
);

const AuditLog = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        fetchAuditLog();
    }, [user, filter]);

    const fetchAuditLog = async () => {
        try {
            const params = filter !== 'all' ? `?content_type=${filter}` : '';
            const res = await axios.get(`${API}/audit-log${params}`, { withCredentials: true });
            setEntries(res.data.entries);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <div className="space-y-6" data-testid="audit-log-page">
            <div>
                <h1 className="font-mono text-3xl md:text-4xl font-bold tracking-tighter uppercase">AUDIT LOG</h1>
                <p className="text-muted-foreground font-mono text-sm">Immutable record of all system changes</p>
            </div>

            <div className="flex gap-2 flex-wrap">
                {['all', 'document', 'glossary', 'component', 'pigpen', 'brand', 'auth', 'user'].map(type => (
                    <button key={type} onClick={() => setFilter(type)} className={`px-3 py-1.5 font-mono text-xs tracking-wider uppercase ${filter === type ? 'bg-primary text-primary-foreground' : 'bg-secondary border border-border text-muted-foreground hover:text-foreground'}`}>
                        {type}
                    </button>
                ))}
            </div>

            <div className="font-mono text-xs text-muted-foreground">{entries.length} ENTRIES</div>

            <ScrollArea className="h-[600px]">
                <div className="space-y-2 pr-4">
                    {loading ? (
                        <div className="text-center py-12 font-mono text-sm text-muted-foreground">LOADING...</div>
                    ) : entries.length === 0 ? (
                        <div className="text-center py-12">
                            <History size={48} className="text-muted-foreground mx-auto mb-4" />
                            <p className="font-mono text-sm text-muted-foreground">NO AUDIT ENTRIES</p>
                        </div>
                    ) : entries.map(entry => (
                        <AuditLogEntry key={entry.log_id} entry={entry} />
                    ))}
                </div>
            </ScrollArea>
        </div>
    );
};

export default AuditLog;
