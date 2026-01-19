import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useWalletStore } from '../store/walletStore';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import {
    Wallet,
    Plus,
    ArrowLeft,
    AlertCircle,
    CheckCircle,
    Loader2,
    IndianRupee,
} from 'lucide-react';

export default function WalletPage() {
    const { wallet, isLoading, error, fetchWallet, addMoney, clearError } = useWalletStore();
    const [amount, setAmount] = useState<string>('');
    const [successMessage, setSuccessMessage] = useState<string>('');

    useEffect(() => {
        fetchWallet();
    }, [fetchWallet]);

    const handleAddMoney = async (e: React.FormEvent) => {
        e.preventDefault();
        clearError();
        setSuccessMessage('');

        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount <= 0 || numAmount > 10000) {
            return;
        }

        const result = await addMoney(numAmount);
        if (result.success) {
            setSuccessMessage(result.message);
            setAmount('');
            setTimeout(() => setSuccessMessage(''), 3000);
        }
    };

    const quickAmounts = [100, 500, 1000, 5000, 10000];

    return (
        <main className="min-h-screen bg-background">
            {/* Header */}
            <Navbar />

            {/* Main Content */}
            <section className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    {/* Back Link */}
                    <Link
                        to="/dashboard"
                        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Dashboard
                    </Link>

                    {/* Page Title */}
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                            <Wallet className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                                Your Wallet
                            </h1>
                            <p className="text-muted-foreground text-sm">
                                Manage your virtual trading balance
                            </p>
                        </div>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-8">
                        {/* Balance Card */}
                        <div className="relative">
                            <div className="absolute -inset-1 bg-primary/20 rounded-2xl blur-xl" />
                            <div className="relative bg-card rounded-2xl border border-border p-6 sm:p-8">
                                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                                    <IndianRupee className="w-4 h-4" />
                                    <span className="text-sm font-medium">Available Balance</span>
                                </div>

                                {isLoading && !wallet ? (
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span>Loading...</span>
                                    </div>
                                ) : wallet ? (
                                    <>
                                        <p className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
                                            ₹{wallet.availableBalance.toLocaleString('en-IN', {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            })}
                                        </p>
                                        <div className="flex flex-wrap gap-4 text-sm">
                                            <div className="flex items-center gap-2">
                                                <span className="text-muted-foreground">Locked:</span>
                                                <span className="text-foreground font-medium">
                                                    ₹{wallet.lockedBalance.toLocaleString('en-IN', {
                                                        minimumFractionDigits: 2,
                                                    })}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-muted-foreground">Currency:</span>
                                                <span className="text-primary font-medium">
                                                    {wallet.currency}
                                                </span>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-muted-foreground">
                                        <p className="text-4xl font-bold text-foreground mb-2">₹0.00</p>
                                        <p className="text-sm">Add money to start trading</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Add Money Card */}
                        <div className="bg-card rounded-2xl border border-border p-6 sm:p-8">
                            <div className="flex items-center gap-2 mb-6">
                                <Plus className="w-5 h-5 text-primary" />
                                <h2 className="text-lg font-semibold text-foreground">Add Money</h2>
                            </div>

                            <form onSubmit={handleAddMoney} className="space-y-6">
                                {/* Amount Input */}
                                <div>
                                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                                        Enter Amount (₹1 - ₹10,000)
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                                            ₹
                                        </span>
                                        <input
                                            type="number"
                                            min="1"
                                            max="10000"
                                            step="0.01"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            placeholder="0.00"
                                            className="w-full pl-8 pr-4 py-3 bg-input border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                        />
                                    </div>
                                </div>

                                {/* Quick Amount Buttons */}
                                <div>
                                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                                        Quick Select
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {quickAmounts.map((quickAmt) => (
                                            <button
                                                key={quickAmt}
                                                type="button"
                                                onClick={() => setAmount(quickAmt.toString())}
                                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${amount === quickAmt.toString()
                                                    ? 'bg-primary text-primary-foreground'
                                                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                                                    }`}
                                            >
                                                ₹{quickAmt.toLocaleString()}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Error Message */}
                                {error && (
                                    <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
                                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                        <span>{error}</span>
                                    </div>
                                )}

                                {/* Success Message */}
                                {successMessage && (
                                    <div className="flex items-center gap-2 p-3 bg-primary/10 border border-primary/20 rounded-lg text-primary text-sm">
                                        <CheckCircle className="w-4 h-4 flex-shrink-0" />
                                        <span>{successMessage}</span>
                                    </div>
                                )}

                                {/* Submit Button */}
                                <Button
                                    type="submit"
                                    disabled={isLoading || !amount || parseFloat(amount) <= 0 || parseFloat(amount) > 10000}
                                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-3"
                                >
                                    {isLoading ? (
                                        <span className="flex items-center gap-2">
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Processing...
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            <Plus className="w-4 h-4" />
                                            Add ₹{amount || '0'}
                                        </span>
                                    )}
                                </Button>
                            </form>

                            <p className="text-xs text-muted-foreground mt-4 text-center">
                                Virtual money for practice trading only
                            </p>
                        </div>
                    </div>

                    {/* Info Section */}
                    <div className="mt-8 bg-card/50 rounded-2xl border border-border p-6">
                        <h3 className="text-lg font-semibold text-foreground mb-4">
                            About Virtual Trading
                        </h3>
                        <div className="grid sm:grid-cols-3 gap-4 text-sm">
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <CheckCircle className="w-4 h-4 text-primary" />
                                </div>
                                <div>
                                    <p className="font-medium text-foreground">Risk-Free Practice</p>
                                    <p className="text-muted-foreground">Learn to trade without risking real money</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <CheckCircle className="w-4 h-4 text-primary" />
                                </div>
                                <div>
                                    <p className="font-medium text-foreground">Real Market Data</p>
                                    <p className="text-muted-foreground">Trade with live cryptocurrency prices</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <CheckCircle className="w-4 h-4 text-primary" />
                                </div>
                                <div>
                                    <p className="font-medium text-foreground">Unlimited Funds</p>
                                    <p className="text-muted-foreground">Add up to ₹10,000 at a time</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
