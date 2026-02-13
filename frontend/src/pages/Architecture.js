import { useState, useEffect } from 'react';
import axios from 'axios';
import { API } from '@/App';
import { 
    ChevronDown, 
    ChevronUp, 
    Shield, 
    Key, 
    Brain,
    Compass,
    Cog,
    Bot,
    Zap,
    FileText,
    ArrowDown
} from 'lucide-react';

const layerIcons = {
    0: Shield,
    1: Key,
    2: Brain,
    3: Compass,
    4: Cog,
    5: Bot,
    6: Zap,
    7: FileText
};

const layerColors = {
    0: 'border-yellow-500 bg-yellow-500/10',
    1: 'border-cyan-500 bg-cyan-500/10',
    2: 'border-orange-500 bg-orange-500/10',
    3: 'border-purple-500 bg-purple-500/10',
    4: 'border-pink-500 bg-pink-500/10',
    5: 'border-red-500 bg-red-500/10',
    6: 'border-green-500 bg-green-500/10',
    7: 'border-blue-500 bg-blue-500/10'
};

const ComponentBlock = ({ component, isExpanded, onToggle }) => {
    const Icon = layerIcons[component.layer] || Shield;
    const colorClass = layerColors[component.layer] || 'border-gray-500 bg-gray-500/10';

    return (
        <div 
            className={`border-2 transition-colors duration-100 ${colorClass}`}
            data-testid={`arch-component-${component.id}`}
        >
            <button 
                className="w-full p-4 flex items-center gap-4 hover:bg-white/5 transition-colors duration-100"
                onClick={onToggle}
                data-testid={`arch-toggle-${component.id}`}
            >
                <div className="w-10 h-10 border border-current flex items-center justify-center">
                    <Icon size={20} strokeWidth={1.5} />
                </div>
                <div className="flex-1 text-left">
                    <div className="font-mono text-sm font-bold uppercase tracking-wider">
                        {component.name}
                    </div>
                    <div className="font-mono text-[10px] text-muted-foreground tracking-wider">
                        LAYER {component.layer}
                    </div>
                </div>
                <span className="w-2 h-2 bg-green-500 rounded-full" />
                {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
            
            {isExpanded && (
                <div className="px-4 pb-4 space-y-4 border-t border-current/20 pt-4 animate-fade-in">
                    <p className="text-sm text-muted-foreground">{component.description}</p>
                    
                    <div>
                        <div className="font-mono text-[10px] text-muted-foreground tracking-wider mb-2">KEY FUNCTIONS</div>
                        <div className="flex flex-wrap gap-2">
                            {component.key_functions.map((fn, idx) => (
                                <span key={idx} className="px-2 py-1 bg-background border border-border font-mono text-xs">
                                    {fn}
                                </span>
                            ))}
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-muted-foreground tracking-wider">STATUS:</span>
                        <span className="px-2 py-1 bg-green-500/20 text-green-400 font-mono text-[10px] tracking-wider uppercase border border-green-500/30">
                            {component.status}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};

const Architecture = () => {
    const [components, setComponents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState(null);

    useEffect(() => {
        const fetchComponents = async () => {
            try {
                const res = await axios.get(`${API}/architecture/components`);
                setComponents(res.data.components);
            } catch (error) {
                console.error('Error fetching components:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchComponents();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="font-mono text-sm text-muted-foreground animate-pulse">LOADING ARCHITECTURE...</div>
            </div>
        );
    }

    return (
        <div className="space-y-8" data-testid="architecture-page">
            {/* Header */}
            <div className="space-y-2">
                <h1 className="font-mono text-3xl md:text-4xl font-bold tracking-tighter uppercase">
                    SYSTEM ARCHITECTURE
                </h1>
                <p className="text-muted-foreground font-mono text-sm">
                    Authority flow from sovereign to execution layer
                </p>
            </div>

            {/* Authority Flow Principle */}
            <div className="bg-card border border-border p-6">
                <div className="font-mono text-xs text-primary tracking-wider mb-2">CORE PRINCIPLE</div>
                <p className="text-sm text-foreground/90">
                    Authority and enforcement flow from top to bottom. No component below can override one above. 
                    Execution only happens at TELA, and all actions are logged to the Audit & Event Ledger. 
                    Customization resides at UOL, not in core systems.
                </p>
            </div>

            {/* Architecture Diagram */}
            <div className="space-y-4">
                <div className="font-mono text-xs text-muted-foreground tracking-wider">AUTHORITY CHAIN</div>
                
                <div className="space-y-2">
                    {components.map((component, index) => (
                        <div key={component.id}>
                            <ComponentBlock 
                                component={component}
                                isExpanded={expandedId === component.id}
                                onToggle={() => setExpandedId(expandedId === component.id ? null : component.id)}
                            />
                            {index < components.length - 1 && (
                                <div className="flex justify-center py-2">
                                    <ArrowDown size={20} className="text-muted-foreground" />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Legend */}
            <div className="bg-card border border-border p-6">
                <div className="font-mono text-xs text-muted-foreground tracking-wider mb-4">LEGEND</div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 bg-green-500" />
                        <span className="font-mono text-xs">ACTIVE</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 bg-yellow-500" />
                        <span className="font-mono text-xs">WARNING</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 bg-red-500" />
                        <span className="font-mono text-xs">HALTED</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 bg-gray-500" />
                        <span className="font-mono text-xs">INACTIVE</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Architecture;
