import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useWalletStore } from '../store/walletStore';
import { Button } from '@/components/ui/button';
import {
    TrendingUp,
    LogOut,
    User,
    Wallet,
    LineChart,
    Bell,
    Settings,
    ChevronRight
} from 'lucide-react';

export default function DashboardPage() {
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();
    const { wallet, fetchWallet } = useWalletStore();

    useEffect(() => {
        fetchWallet();
    }, [fetchWallet]);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const quickActions = [
        { icon: LineChart, label: 'Start Trading', description: 'Practice with live market data', href: '#' },
        { icon: Wallet, label: 'Virtual Wallet', description: 'Manage your virtual funds', href: '/wallet' },
        { icon: Bell, label: 'Price Alerts', description: 'Set custom notifications', href: '#' },
        { icon: Settings, label: 'Settings', description: 'Customize your experience', href: '#' },
    ];

    return (
        <main className="min-h-screen bg-background">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                                <TrendingUp className="w-5 h-5 text-primary-foreground" />
                            </div>
                            <span className="text-xl font-bold text-foreground">TradeX</span>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-card rounded-full flex items-center justify-center border border-border">
                                    <User className="w-5 h-5 text-muted-foreground" />
                                </div>
                                <div className="hidden sm:block">
                                    <p className="text-sm font-medium text-foreground">{user?.name}</p>
                                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleLogout}
                                className="text-muted-foreground hover:text-foreground hover:bg-card"
                            >
                                <LogOut className="w-4 h-4 mr-2" />
                                <span className="hidden sm:inline">Logout</span>
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Welcome section */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-foreground mb-2">
                        Welcome back, {user?.name?.split(' ')[0]}! 👋
                    </h1>
                    <p className="text-muted-foreground">
                        Ready to continue your trading practice? Here's your dashboard overview.
                    </p>
                </div>

                {/* Stats cards */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {[
                        { label: 'Virtual Balance', value: `₹${wallet?.availableBalance?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '0.00'}`, change: '', positive: null },
                        { label: 'Total Profit/Loss', value: '₹0.00', change: '', positive: null },
                        { label: 'Open Positions', value: '0', change: '', positive: null },
                        { label: 'Completed Trades', value: '0', change: '', positive: null },
                    ].map((stat) => (
                        <div key={stat.label} className="bg-card rounded-2xl border border-border p-5">
                            <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                            {stat.change && (
                                <p className={`text-xs mt-1 ${stat.positive ? 'text-primary' : 'text-muted-foreground'}`}>
                                    {stat.change}
                                </p>
                            )}
                        </div>
                    ))}
                </div>

                {/* Quick actions */}
                <div className="mb-8">
                    <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {quickActions.map((action) => (
                            <a
                                key={action.label}
                                href={action.href}
                                className="group bg-card rounded-2xl border border-border p-5 hover:border-primary/50 transition-all duration-300"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                                        <action.icon className="w-5 h-5 text-primary" />
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                </div>
                                <h3 className="font-semibold text-foreground mb-1">{action.label}</h3>
                                <p className="text-sm text-muted-foreground">{action.description}</p>
                            </a>
                        ))}
                    </div>
                </div>

                {/* Placeholder for chart */}
                <div className="bg-card rounded-2xl border border-border p-6">
                    <h2 className="text-lg font-semibold text-foreground mb-4">Market Overview</h2>
                    <div className="h-64 flex items-center justify-center">
                        <div className="text-center">
                            <LineChart className="w-16 h-16 text-primary/20 mx-auto mb-4" />
                            <p className="text-muted-foreground">Trading charts and market data will appear here</p>
                            <p className="text-sm text-muted-foreground/70 mt-1">Coming soon...</p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
