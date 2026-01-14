import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Button } from '@/components/ui/button';
import { TrendingUp, Eye, EyeOff, Mail, Lock, User, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';

export default function SignupPage() {
    const navigate = useNavigate();
    const { signup, isLoading } = useAuthStore();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');

    const passwordRequirements = [
        { label: 'At least 5 characters', met: password.length >= 5 },
        { label: 'Maximum 20 characters', met: password.length > 0 && password.length <= 20 },
    ];

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');

        // Validation
        if (!name || !email || !password || !confirmPassword) {
            setError('Please fill in all fields');
            return;
        }

        if (name.length < 4) {
            setError('Name must be at least 4 characters');
            return;
        }

        if (password.length < 5) {
            setError('Password must be at least 5 characters');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        const result = await signup({ name, email, password });

        if (result.success) {
            navigate('/', { replace: true });
        } else {
            setError(result.message);
        }
    };

    return (
        <main className="min-h-screen bg-background flex">
            {/* Left side - Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/10 via-background to-background p-12 flex-col justify-between relative overflow-hidden">
                {/* Background glow effect */}
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />

                <Link to="/" className="flex items-center gap-2 relative z-10">
                    <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <span className="text-2xl font-bold text-foreground">TradeX</span>
                </Link>

                <div className="space-y-6 relative z-10">
                    <h1 className="text-4xl font-bold text-foreground leading-tight">
                        Start your journey to{' '}
                        <span className="text-primary">confident trading</span>
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-md">
                        Create your free account and get instant access to virtual trading with real market data.
                    </p>

                    <div className="space-y-3">
                        {['No credit card required', 'Unlimited virtual trading', 'Real-time market data'].map((feature) => (
                            <div key={feature} className="flex items-center gap-3">
                                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                                    <CheckCircle2 className="w-4 h-4 text-primary" />
                                </div>
                                <span className="text-muted-foreground">{feature}</span>
                            </div>
                        ))}
                    </div>

                    {/* Mini chart preview */}
                    <div className="bg-card rounded-xl border border-border p-4 max-w-sm">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium text-foreground">Start with $100K</span>
                            <span className="text-xs text-primary">Virtual Funds</span>
                        </div>
                        <div className="flex items-end gap-1 h-12">
                            {[30, 45, 35, 60, 50, 75, 65, 80, 70, 85, 75, 90].map((h, i) => (
                                <div
                                    key={i}
                                    className={`flex-1 rounded-sm ${i % 4 === 0 ? 'bg-destructive/80' : 'bg-primary/80'}`}
                                    style={{ height: `${h}%` }}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 relative z-10">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                        <span className="text-sm text-primary font-medium">Live</span>
                    </div>
                    <div className="h-4 w-px bg-border" />
                    <p className="text-sm text-muted-foreground">
                        Start your trading journey today
                    </p>
                </div>
            </div>

            {/* Right side - Signup Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
                <div className="w-full max-w-md space-y-8">
                    {/* Mobile logo */}
                    <div className="lg:hidden flex justify-center">
                        <Link to="/" className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                                <TrendingUp className="w-6 h-6 text-primary-foreground" />
                            </div>
                            <span className="text-2xl font-bold text-foreground">TradeX</span>
                        </Link>
                    </div>

                    {/* Header */}
                    <div className="text-center lg:text-left">
                        <h2 className="text-3xl font-bold text-foreground">Create account</h2>
                        <p className="mt-2 text-muted-foreground">
                            Already have an account?{' '}
                            <Link to="/login" className="text-primary hover:underline font-medium">
                                Sign in
                            </Link>
                        </p>
                    </div>

                    {/* Error message */}
                    {error && (
                        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl">
                            <p className="text-sm text-destructive">{error}</p>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Name field */}
                        <div className="space-y-2">
                            <label htmlFor="name" className="text-sm font-medium text-foreground">
                                Full Name
                            </label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <input
                                    id="name"
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="John Doe"
                                    className="w-full h-12 pl-12 pr-4 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        {/* Email field */}
                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium text-foreground">
                                Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    className="w-full h-12 pl-12 pr-4 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        {/* Password field */}
                        <div className="space-y-2">
                            <label htmlFor="password" className="text-sm font-medium text-foreground">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Create a password"
                                    className="w-full h-12 pl-12 pr-12 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                    disabled={isLoading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            {/* Password requirements */}
                            {password && (
                                <div className="flex gap-4 mt-2">
                                    {passwordRequirements.map((req) => (
                                        <div key={req.label} className="flex items-center gap-1.5">
                                            <div className={`w-1.5 h-1.5 rounded-full ${req.met ? 'bg-primary' : 'bg-muted-foreground'}`} />
                                            <span className={`text-xs ${req.met ? 'text-primary' : 'text-muted-foreground'}`}>
                                                {req.label}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Confirm password field */}
                        <div className="space-y-2">
                            <label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <input
                                    id="confirmPassword"
                                    type={showPassword ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Confirm your password"
                                    className="w-full h-12 pl-12 pr-4 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                    disabled={isLoading}
                                />
                            </div>
                            {confirmPassword && password !== confirmPassword && (
                                <p className="text-xs text-destructive">Passwords do not match</p>
                            )}
                        </div>

                        {/* Submit button */}
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl font-medium text-base"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    Creating account...
                                </>
                            ) : (
                                <>
                                    Create account
                                    <ArrowRight className="w-5 h-5 ml-2" />
                                </>
                            )}
                        </Button>
                    </form>

                    {/* Footer */}
                    <p className="text-center text-xs text-muted-foreground">
                        By creating an account, you agree to our{' '}
                        <a href="#" className="text-primary hover:underline">Terms of Service</a>
                        {' '}and{' '}
                        <a href="#" className="text-primary hover:underline">Privacy Policy</a>
                    </p>
                </div>
            </div>
        </main>
    );
}
