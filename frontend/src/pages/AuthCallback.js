import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API, useAuth } from '@/App';
import { toast } from 'sonner';

const AuthCallback = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const hasProcessed = useRef(false);

    useEffect(() => {
        // Use useRef to prevent double processing in StrictMode
        if (hasProcessed.current) return;
        hasProcessed.current = true;

        const processAuth = async () => {
            const hash = window.location.hash;
            const sessionIdMatch = hash.match(/session_id=([^&]+)/);
            
            if (!sessionIdMatch) {
                toast.error('Invalid authentication response');
                navigate('/login');
                return;
            }

            const sessionId = sessionIdMatch[1];

            try {
                const response = await axios.post(
                    `${API}/auth/session`,
                    { session_id: sessionId },
                    { withCredentials: true }
                );

                login(response.data);
                toast.success(`Welcome, ${response.data.name}!`);
                
                // Clear hash and navigate to dashboard
                window.history.replaceState(null, '', window.location.pathname);
                navigate('/', { state: { user: response.data } });
            } catch (error) {
                console.error('Auth error:', error);
                toast.error('Authentication failed');
                navigate('/login');
            }
        };

        processAuth();
    }, [navigate, login]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="text-center">
                <div className="font-mono text-sm text-muted-foreground animate-pulse">
                    AUTHENTICATING...
                </div>
            </div>
        </div>
    );
};

export default AuthCallback;
