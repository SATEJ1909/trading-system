import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Button } from '@/components/ui/button';
import {
    TrendingUp,
    LogOut,
    User,
    Menu,
    X,
    LayoutDashboard,
    LineChart,
    Wallet,
} from 'lucide-react';
import { useState } from 'react';

interface NavbarProps {
    showBackButton?: boolean;
    backTo?: string;
    backLabel?: string;
}

export default function Navbar({ showBackButton, backTo, backLabel }: NavbarProps) {
    const location = useLocation();
    const { user, logout } = useAuthStore();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const navLinks = [
        { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/markets', label: 'Markets', icon: LineChart },
        { href: '/wallet', label: 'Wallet', icon: Wallet },
    ];

    const isActive = (href: string) => location.pathname === href;

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <div className="flex items-center gap-4">
                        {showBackButton && backTo && (
                            <Link
                                to={backTo}
                                className="text-muted-foreground hover:text-foreground text-sm flex items-center gap-1"
                            >
                                ← {backLabel || 'Back'}
                            </Link>
                        )}
                        <Link to="/dashboard" className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                                <TrendingUp className="w-5 h-5 text-primary-foreground" />
                            </div>
                            <span className="text-xl font-bold text-foreground">TradeX</span>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                to={link.href}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isActive(link.href)
                                    ? 'bg-primary/10 text-primary'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                                    }`}
                            >
                                <link.icon className="w-4 h-4" />
                                {link.label}
                            </Link>
                        ))}
                    </nav>

                    {/* User section */}
                    <div className="flex items-center gap-3">
                        {/* Desktop user info */}
                        <div className="hidden sm:flex items-center gap-3">
                            <div className="w-9 h-9 bg-card rounded-full flex items-center justify-center border border-border">
                                <User className="w-5 h-5 text-muted-foreground" />
                            </div>
                            <div className="hidden lg:block">
                                <p className="text-sm font-medium text-foreground">{user?.name}</p>
                                <p className="text-xs text-muted-foreground">{user?.email}</p>
                            </div>
                        </div>

                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={logout}
                            className="hidden sm:flex text-muted-foreground hover:text-foreground hover:bg-card"
                        >
                            <LogOut className="w-4 h-4 mr-2" />
                            Logout
                        </Button>

                        {/* Mobile menu button */}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden text-muted-foreground"
                        >
                            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </Button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {mobileMenuOpen && (
                    <div className="md:hidden border-t border-border py-4 animate-in slide-in-from-top-2">
                        <nav className="flex flex-col gap-1">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    to={link.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive(link.href)
                                        ? 'bg-primary/10 text-primary'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                                        }`}
                                >
                                    <link.icon className="w-5 h-5" />
                                    {link.label}
                                </Link>
                            ))}
                            <div className="border-t border-border my-2" />
                            <div className="flex items-center gap-3 px-4 py-2">
                                <div className="w-9 h-9 bg-card rounded-full flex items-center justify-center border border-border">
                                    <User className="w-5 h-5 text-muted-foreground" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-foreground">{user?.name}</p>
                                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                onClick={() => { logout(); setMobileMenuOpen(false); }}
                                className="mx-4 mt-2 justify-start text-muted-foreground hover:text-foreground"
                            >
                                <LogOut className="w-4 h-4 mr-2" />
                                Logout
                            </Button>
                        </nav>
                    </div>
                )}
            </div>
        </header>
    );
}
