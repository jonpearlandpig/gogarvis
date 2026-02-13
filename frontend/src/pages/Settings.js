import { useState } from 'react';
import { useTheme } from '@/App';
import { 
    Sun, 
    Moon, 
    Monitor, 
    Info,
    Shield,
    Database,
    Server
} from 'lucide-react';

const SettingSection = ({ title, children }) => (
    <div className="bg-card border border-border">
        <div className="px-6 py-4 border-b border-border">
            <h2 className="font-mono text-sm font-bold uppercase tracking-wider">{title}</h2>
        </div>
        <div className="p-6">
            {children}
        </div>
    </div>
);

const SettingRow = ({ label, description, children }) => (
    <div className="flex items-center justify-between py-4 border-b border-border last:border-0">
        <div>
            <div className="font-mono text-sm font-medium">{label}</div>
            {description && (
                <div className="text-xs text-muted-foreground mt-1">{description}</div>
            )}
        </div>
        <div>{children}</div>
    </div>
);

const SettingsPage = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <div className="space-y-8" data-testid="settings-page">
            {/* Header */}
            <div className="space-y-2">
                <h1 className="font-mono text-3xl md:text-4xl font-bold tracking-tighter uppercase">
                    SETTINGS
                </h1>
                <p className="text-muted-foreground font-mono text-sm">
                    Configure your GoGarvis experience
                </p>
            </div>

            {/* Appearance */}
            <SettingSection title="APPEARANCE">
                <SettingRow 
                    label="Theme" 
                    description="Switch between dark and light mode"
                >
                    <div className="flex gap-2">
                        <button
                            onClick={() => theme === 'light' && toggleTheme()}
                            className={`p-3 border transition-colors duration-100 ${
                                theme === 'dark' 
                                    ? 'border-primary bg-primary/10' 
                                    : 'border-border hover:border-muted-foreground'
                            }`}
                            data-testid="theme-dark-btn"
                        >
                            <Moon size={18} className={theme === 'dark' ? 'text-primary' : 'text-muted-foreground'} />
                        </button>
                        <button
                            onClick={() => theme === 'dark' && toggleTheme()}
                            className={`p-3 border transition-colors duration-100 ${
                                theme === 'light' 
                                    ? 'border-primary bg-primary/10' 
                                    : 'border-border hover:border-muted-foreground'
                            }`}
                            data-testid="theme-light-btn"
                        >
                            <Sun size={18} className={theme === 'light' ? 'text-primary' : 'text-muted-foreground'} />
                        </button>
                    </div>
                </SettingRow>
            </SettingSection>

            {/* System Information */}
            <SettingSection title="SYSTEM INFORMATION">
                <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 bg-background border border-border">
                        <Shield size={20} className="text-primary" />
                        <div>
                            <div className="font-mono text-xs text-muted-foreground tracking-wider">SYSTEM</div>
                            <div className="font-mono text-sm font-bold">GOGARVIS FULL STACK v1.0.0</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-background border border-border">
                        <Server size={20} className="text-green-500" />
                        <div>
                            <div className="font-mono text-xs text-muted-foreground tracking-wider">AI ENGINE</div>
                            <div className="font-mono text-sm font-bold">GPT-5.2 (OPENAI)</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-background border border-border">
                        <Database size={20} className="text-cyan-500" />
                        <div>
                            <div className="font-mono text-xs text-muted-foreground tracking-wider">DATABASE</div>
                            <div className="font-mono text-sm font-bold">MONGODB</div>
                        </div>
                    </div>
                </div>
            </SettingSection>

            {/* About */}
            <SettingSection title="ABOUT">
                <div className="space-y-4">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        GoGarvis is a sovereign intelligence and enforcement architecture 
                        developed by Pearl & Pig. This portal provides access to system 
                        documentation, architecture visualization, and AI-powered assistance.
                    </p>
                    <div className="flex flex-wrap gap-4 text-xs font-mono text-muted-foreground">
                        <span>© 2026 PEARL & PIG</span>
                        <span>•</span>
                        <span>ALL RIGHTS RESERVED</span>
                    </div>
                </div>
            </SettingSection>
        </div>
    );
};

export default SettingsPage;
