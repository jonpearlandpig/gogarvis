import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { API } from '@/App';
import { 
    Send, 
    Trash2, 
    Bot,
    User,
    Terminal,
    Copy,
    Check
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const MessageBubble = ({ message, onCopy }) => {
    const [copied, setCopied] = useState(false);
    const isUser = message.role === 'user';

    const handleCopy = () => {
        navigator.clipboard.writeText(message.content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`} data-testid={`chat-message-${message.role}`}>
            <div className={`w-8 h-8 border flex items-center justify-center flex-shrink-0 ${
                isUser ? 'border-muted-foreground' : 'border-primary bg-primary/10'
            }`}>
                {isUser ? <User size={14} /> : <Bot size={14} className="text-primary" />}
            </div>
            <div className={`flex-1 max-w-[80%] ${isUser ? 'text-right' : ''}`}>
                <div className={`inline-block p-4 ${
                    isUser 
                        ? 'bg-secondary border border-border' 
                        : 'bg-card border border-primary/30'
                }`}>
                    <div className="prose prose-invert prose-sm max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {message.content}
                        </ReactMarkdown>
                    </div>
                </div>
                <div className="flex items-center gap-2 mt-2 justify-end">
                    <button 
                        className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                        onClick={handleCopy}
                        data-testid="copy-message-btn"
                    >
                        {copied ? <Check size={12} /> : <Copy size={12} />}
                    </button>
                    <span className="font-mono text-[10px] text-muted-foreground">
                        {new Date(message.timestamp).toLocaleTimeString()}
                    </span>
                </div>
            </div>
        </div>
    );
};

const GarvisChat = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [sessionId, setSessionId] = useState(() => localStorage.getItem('garvis-session') || null);
    const scrollRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        if (sessionId) {
            loadHistory();
        }
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    };

    const loadHistory = async () => {
        if (!sessionId) return;
        try {
            const res = await axios.get(`${API}/chat/history/${sessionId}`);
            setMessages(res.data.messages);
        } catch (error) {
            console.error('Error loading history:', error);
        }
    };

    const sendMessage = async () => {
        if (!input.trim() || loading) return;

        const userMessage = {
            role: 'user',
            content: input,
            timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const res = await axios.post(`${API}/chat`, {
                message: input,
                session_id: sessionId
            });

            const newSessionId = res.data.session_id;
            if (newSessionId !== sessionId) {
                setSessionId(newSessionId);
                localStorage.setItem('garvis-session', newSessionId);
            }

            const assistantMessage = {
                role: 'assistant',
                content: res.data.response,
                timestamp: new Date().toISOString()
            };

            setMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
            console.error('Chat error:', error);
            toast.error('Failed to get response from GARVIS');
            setMessages(prev => prev.slice(0, -1));
        } finally {
            setLoading(false);
            inputRef.current?.focus();
        }
    };

    const clearSession = async () => {
        if (!sessionId) return;
        try {
            await axios.delete(`${API}/chat/session/${sessionId}`);
            setMessages([]);
            setSessionId(null);
            localStorage.removeItem('garvis-session');
            toast.success('Chat session cleared');
        } catch (error) {
            console.error('Error clearing session:', error);
            toast.error('Failed to clear session');
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <div className="space-y-6" data-testid="garvis-chat-page">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div className="space-y-2">
                    <h1 className="font-mono text-3xl md:text-4xl font-bold tracking-tighter uppercase">
                        GARVIS AI
                    </h1>
                    <p className="text-muted-foreground font-mono text-sm">
                        Sovereign intelligence assistant powered by GPT-5.2
                    </p>
                </div>
                <button 
                    className="px-4 py-2 border border-border hover:border-destructive hover:text-destructive transition-colors duration-100 font-mono text-xs tracking-wider"
                    onClick={clearSession}
                    disabled={messages.length === 0}
                    data-testid="clear-chat-btn"
                >
                    <Trash2 size={14} className="inline mr-2" />
                    CLEAR
                </button>
            </div>

            {/* Chat Container */}
            <div className="border border-border bg-card">
                {/* Terminal Header */}
                <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-background">
                    <Terminal size={14} className="text-primary" />
                    <span className="font-mono text-xs text-muted-foreground">GARVIS TERMINAL</span>
                    <span className="ml-auto font-mono text-[10px] text-muted-foreground">
                        SESSION: {sessionId ? sessionId.slice(0, 8) : 'NEW'}
                    </span>
                </div>

                {/* Messages */}
                <ScrollArea className="h-[450px]" ref={scrollRef}>
                    <div className="p-6 space-y-6">
                        {messages.length === 0 ? (
                            <div className="text-center py-12">
                                <Bot size={48} className="text-primary mx-auto mb-4" strokeWidth={1} />
                                <p className="font-mono text-sm text-muted-foreground mb-2">GARVIS AI READY</p>
                                <p className="text-xs text-muted-foreground max-w-md mx-auto">
                                    Ask me about the GoGarvis architecture, system components, terminology, 
                                    or any questions about sovereign intelligence and enforcement.
                                </p>
                            </div>
                        ) : (
                            messages.map((msg, idx) => (
                                <MessageBubble key={idx} message={msg} />
                            ))
                        )}
                        {loading && (
                            <div className="flex gap-3">
                                <div className="w-8 h-8 border border-primary bg-primary/10 flex items-center justify-center">
                                    <Bot size={14} className="text-primary" />
                                </div>
                                <div className="bg-card border border-primary/30 p-4">
                                    <span className="font-mono text-sm text-muted-foreground animate-pulse">
                                        PROCESSING<span className="terminal-cursor">_</span>
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>

                {/* Input */}
                <div className="border-t border-border p-4">
                    <div className="flex gap-4">
                        <textarea
                            ref={inputRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask GARVIS..."
                            rows={2}
                            className="flex-1 bg-background border border-border px-4 py-3 font-mono text-sm resize-none focus:outline-none focus:border-primary"
                            disabled={loading}
                            data-testid="chat-input"
                        />
                        <button
                            onClick={sendMessage}
                            disabled={!input.trim() || loading}
                            className="px-6 bg-primary text-primary-foreground font-mono text-sm tracking-wider uppercase disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors duration-100"
                            data-testid="send-message-btn"
                        >
                            <Send size={18} />
                        </button>
                    </div>
                    <div className="mt-2 font-mono text-[10px] text-muted-foreground">
                        PRESS ENTER TO SEND // SHIFT+ENTER FOR NEW LINE
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GarvisChat;
