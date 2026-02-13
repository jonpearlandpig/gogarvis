import { LogIn, Shield } from 'lucide-react';

const Login = () => {
    const handleLogin = () => {
        // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
        const redirectUrl = window.location.origin + '/';
        window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
    };

    return (
        <div className="min-h-[60vh] flex items-center justify-center" data-testid="login-page">
            <div className="max-w-md w-full bg-card border border-border p-8 space-y-6">
                <div className="text-center space-y-4">
                    <Shield size={48} className="text-primary mx-auto" strokeWidth={1.5} />
                    <h1 className="font-mono text-2xl font-bold tracking-tight uppercase">ACCESS PORTAL</h1>
                    <p className="text-sm text-muted-foreground">
                        Sign in with your Google account to access editing capabilities and admin features.
                    </p>
                </div>

                <div className="space-y-4">
                    <button
                        onClick={handleLogin}
                        className="w-full bg-primary text-primary-foreground p-4 font-mono text-sm tracking-wider uppercase hover:bg-primary/90 transition-colors flex items-center justify-center gap-3"
                        data-testid="google-login-btn"
                    >
                        <LogIn size={18} />
                        SIGN IN WITH GOOGLE
                    </button>
                </div>

                <div className="text-center">
                    <p className="font-mono text-[10px] text-muted-foreground tracking-wider">
                        FIRST USER AUTOMATICALLY BECOMES ADMIN
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
