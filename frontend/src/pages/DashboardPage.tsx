import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useWalletStore } from '../store/walletStore';
import Navbar from '@/components/Navbar';
import DemoChart from '@/components/ui/demo-chart';
import api from '../api/axios';
import {
    LineChart,
    ChevronRight,
    Wallet,
    Clock,
    CheckCircle,
    XCircle,
    Loader2,
    ArrowUpRight,
    ArrowDownRight,
} from 'lucide-react';

interface OrderAsset {
    symbol: string;
    name: string;
}

interface Order {
    _id: string;
    assetId: OrderAsset;
    side: 'BUY' | 'SELL';
    orderType: 'MARKET' | 'LIMIT';
    price: number | null;
    quantity: number;
    filledQuantity: number;
    status: 'OPEN' | 'PARTIAL' | 'FILLED' | 'CANCELLED';
    createdAt: string;
}

export default function DashboardPage() {
    const { user } = useAuthStore();
    const { wallet, fetchWallet } = useWalletStore();
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoadingOrders, setIsLoadingOrders] = useState(true);

    useEffect(() => {
        fetchWallet();
        fetchOrders();
    }, [fetchWallet]);

    const fetchOrders = async () => {
        try {
            setIsLoadingOrders(true);
            console.log('[Dashboard] Fetching orders...');
            const response = await api.get('/wallet/orders');
            console.log('[Dashboard] Orders response:', response.data);
            if (response.data.success) {
                setOrders(response.data.data || []);
                console.log('[Dashboard] Orders set:', response.data.data?.length || 0, 'orders');
            } else {
                console.error('[Dashboard] Orders API returned failure:', response.data);
            }
        } catch (error: any) {
            console.error('[Dashboard] Failed to fetch orders:', error?.response?.data || error.message);
        } finally {
            setIsLoadingOrders(false);
        }
    };

    const quickActions = [
        { icon: LineChart, label: 'Live Markets', description: 'View & trade live assets', href: '/markets' },
        { icon: Wallet, label: 'Virtual Wallet', description: 'Manage your virtual funds', href: '/wallet' },
    ];

    // Calculate stats from orders
    const pendingOrders = orders.filter(o => o.status === 'OPEN' || o.status === 'PARTIAL');
    const completedOrders = orders.filter(o => o.status === 'FILLED');

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'OPEN': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
            case 'PARTIAL': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
            case 'FILLED': return 'bg-primary/10 text-primary border-primary/20';
            case 'CANCELLED': return 'bg-destructive/10 text-destructive border-destructive/20';
            default: return 'bg-muted text-muted-foreground';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'OPEN':
            case 'PARTIAL':
                return <Clock className="w-3 h-3" />;
            case 'FILLED':
                return <CheckCircle className="w-3 h-3" />;
            case 'CANCELLED':
                return <XCircle className="w-3 h-3" />;
            default:
                return null;
        }
    };

    return (
        <main className="min-h-screen bg-background">
            {/* Header */}
            <Navbar />

            {/* Main content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
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
                <div className="grid sm:grid-cols-3 gap-4 mb-8">
                    {/* Virtual Balance Card */}
                    <div className="stat-card stat-card-primary rounded-2xl p-5">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
                                <Wallet className="w-5 h-5 text-primary" />
                            </div>
                            <p className="text-sm text-muted-foreground">Virtual Balance</p>
                        </div>
                        <p className="text-2xl font-bold text-gradient-green">
                            ₹{wallet?.availableBalance?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '0.00'}
                        </p>
                    </div>

                    {/* Open Orders Card */}
                    <div className="stat-card stat-card-warning rounded-2xl p-5">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                                <Clock className="w-5 h-5 text-yellow-500" />
                            </div>
                            <p className="text-sm text-muted-foreground">Open Orders</p>
                        </div>
                        <p className="text-2xl font-bold text-foreground">{pendingOrders.length}</p>
                    </div>

                    {/* Completed Trades Card */}
                    <div className="stat-card stat-card-accent rounded-2xl p-5">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-accent/20 rounded-xl flex items-center justify-center">
                                <CheckCircle className="w-5 h-5 text-accent" />
                            </div>
                            <p className="text-sm text-muted-foreground">Completed Trades</p>
                        </div>
                        <p className="text-2xl font-bold text-foreground">{completedOrders.length}</p>
                    </div>
                </div>

                {/* Quick actions */}
                <div className="mb-8">
                    <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {quickActions.map((action) => (
                            <Link
                                key={action.label}
                                to={action.href}
                                className="group quick-action-card bg-card rounded-2xl border border-border p-5"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                                        <action.icon className="w-5 h-5 text-primary" />
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-300" />
                                </div>
                                <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">{action.label}</h3>
                                <p className="text-sm text-muted-foreground">{action.description}</p>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Recent Orders */}
                <div className="mb-8">
                    <h2 className="text-lg font-semibold text-foreground mb-4">Recent Orders</h2>
                    <div className="bg-card rounded-2xl border border-border overflow-hidden">
                        {isLoadingOrders ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="w-6 h-6 text-primary animate-spin" />
                            </div>
                        ) : orders.length === 0 ? (
                            <div className="text-center py-12">
                                <Clock className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                                <p className="text-muted-foreground">No orders yet</p>
                                <p className="text-sm text-muted-foreground/70">
                                    Place your first order in the{' '}
                                    <Link to="/markets" className="text-primary hover:underline">Markets</Link>
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y divide-border">
                                {orders.slice(0, 5).map((order) => (
                                    <div key={order._id} className="flex items-center justify-between p-4 hover:bg-secondary/20 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${order.side === 'BUY' ? 'bg-primary/10' : 'bg-destructive/10'
                                                }`}>
                                                {order.side === 'BUY' ? (
                                                    <ArrowUpRight className={`w-4 h-4 text-primary`} />
                                                ) : (
                                                    <ArrowDownRight className={`w-4 h-4 text-destructive`} />
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-medium text-foreground">
                                                    {order.side} {order.assetId?.symbol || 'Unknown'}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {order.quantity} units @ {order.price ? `₹${order.price}` : 'Market'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs border ${getStatusColor(order.status)}`}>
                                                {getStatusIcon(order.status)}
                                                {order.status}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                {new Date(order.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                                {orders.length > 5 && (
                                    <div className="p-3 text-center">
                                        <Link to="/markets" className="text-sm text-primary hover:underline">
                                            View all orders →
                                        </Link>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Market Chart */}
                <div className="mb-8">
                    <h2 className="text-lg font-semibold text-foreground mb-4">Market Overview</h2>
                    <DemoChart />
                </div>
            </div>
        </main>
    );
}
