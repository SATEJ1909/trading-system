
import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useAuthStore } from "../store/authStore"
import { Button } from "@/components/ui/button"
import {
    Menu,
    X,
    TrendingUp,
    ArrowRight,
    LineChart,
    Shield,
    Zap,
    BookOpen,
    Bell,
    PieChart,
    BarChart3,
    Target,
    Twitter,
    Linkedin,
    Github,
    Youtube,
} from "lucide-react"

export default function LandingPage() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const { isAuthenticated, checkAuth } = useAuthStore()
    const [marketData, setMarketData] = useState([
        { symbol: "BTC", price: 98500, change: 2.45 },
        { symbol: "ETH", price: 3450, change: 1.82 },
        { symbol: "SOL", price: 185, change: -0.75 },
        { symbol: "ADA", price: 0.92, change: 3.21 },
    ])

    useEffect(() => {
        checkAuth()
    }, [checkAuth])

    useEffect(() => {
        fetchMarketData()
        const interval = setInterval(fetchMarketData, 60000)
        return () => clearInterval(interval)
    }, [])

    const fetchMarketData = async () => {
        try {
            const response = await fetch(
                "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,cardano&vs_currencies=usd&include_24hr_change=true",
            )
            const data = await response.json()
            // Use mock data as fallback
            setMarketData([
                { symbol: "BTC", price: 98500, change: 2.45 },
                { symbol: "ETH", price: 3450, change: 1.82 },
                { symbol: "SOL", price: 185, change: -0.75 },
                { symbol: "ADA", price: 0.92, change: 3.21 },
            ])
        } catch (error) {
            console.log("[v0] Using mock market data")
        }
    }

    const navItems = [
        { label: "Features", href: "#features" },
        { label: "How It Works", href: "#how-it-works" },
        { label: "Markets", href: "/markets" },
    ]

    // Stats removed - no fake metrics

    const features = [
        {
            icon: LineChart,
            title: "Real-Time Market Data",
            description:
                "Practice with live market data from major exchanges. Experience real market conditions without risking real money.",
        },
        {
            icon: Shield,
            title: "Zero Risk Environment",
            description:
                "Make mistakes and learn from them. Your virtual portfolio protects you while you develop winning strategies.",
        },
        {
            icon: Zap,
            title: "Instant Execution",
            description:
                "Execute trades instantly with our lightning-fast simulator. Experience realistic order fills and market dynamics.",
        },
        {
            icon: BookOpen,
            title: "Learning Resources",
            description:
                "Access comprehensive tutorials, strategy guides, and video courses designed by professional traders.",
        },
        {
            icon: Bell,
            title: "Smart Alerts",
            description:
                "Set custom price alerts and receive notifications when market conditions match your trading criteria.",
        },
        {
            icon: PieChart,
            title: "Portfolio Analytics",
            description:
                "Track your performance with detailed analytics. Identify patterns and optimize your trading strategy.",
        },
    ]

    const steps = [
        {
            step: "01",
            icon: Target,
            title: "Create Your Account",
            description: "Sign up in seconds and receive virtual funds. No credit card required, no hidden fees.",
        },
        {
            step: "02",
            icon: LineChart,
            title: "Learn the Markets",
            description: "Access real-time market data, tutorials, and professional-grade trading tools.",
        },
        {
            step: "03",
            icon: BarChart3,
            title: "Practice Trading",
            description: "Execute trades in a risk-free environment. Test strategies and build confidence.",
        },
        {
            step: "04",
            icon: TrendingUp,
            title: "Track Performance",
            description: "Review detailed analytics and identify patterns to refine your trading approach.",
        },
    ]

    const footerLinks = {
        Product: [
            { label: "Features", href: "#features" },
            { label: "How It Works", href: "#how-it-works" },
            { label: "Changelog", href: "#" },
            { label: "Roadmap", href: "#" },
        ],
        Resources: [
            { label: "Documentation", href: "#" },
            { label: "Tutorials", href: "#" },
            { label: "Blog", href: "#" },
            { label: "Community", href: "#" },
        ],
        Company: [
            { label: "About", href: "#" },
            { label: "Careers", href: "#" },
            { label: "Contact", href: "#" },
            { label: "Press", href: "#" },
        ],
        Legal: [
            { label: "Privacy", href: "#" },
            { label: "Terms", href: "#" },
            { label: "Security", href: "#" },
        ],
    }

    const socialLinks = [
        { icon: Twitter, href: "#", label: "Twitter" },
        { icon: Linkedin, href: "#", label: "LinkedIn" },
        { icon: Github, href: "#", label: "GitHub" },
        { icon: Youtube, href: "#", label: "YouTube" },
    ]

    return (
        <main className="min-h-screen bg-background relative overflow-hidden">
            {/* Animated background gradient orbs */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 -left-20 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-float" />
                <div className="absolute top-40 -right-20 w-80 h-80 bg-primary/15 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
                <div className="absolute bottom-20 left-1/3 w-72 h-72 bg-gradient-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }} />
            </div>

            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 glass-strong border-b border-border/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <a href="/" className="flex items-center gap-2.5 group">
                            <div className="w-9 h-9 bg-gradient-primary rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                                <TrendingUp className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">TradeX</span>
                        </a>

                        <nav className="hidden md:flex items-center gap-8">
                            {navItems.map((item) => (
                                <a
                                    key={item.label}
                                    href={item.href}
                                    className="text-sm font-medium text-muted-foreground hover:text-primary transition-all duration-300 relative group"
                                >
                                    <span className="relative z-10">{item.label}</span>
                                    <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-gradient-primary opacity-0 group-hover:opacity-100 transition-opacity rounded-full" />
                                </a>
                            ))}
                        </nav>

                        <div className="hidden md:flex items-center gap-3">
                            {isAuthenticated ? (
                                <Link to="/dashboard">
                                    <Button className="bg-gradient-primary text-white hover:opacity-90 transition-opacity shadow-lg">Dashboard</Button>
                                </Link>
                            ) : (
                                <>
                                    <Link to="/login">
                                        <Button variant="ghost" className="text-muted-foreground hover:text-foreground hover:bg-muted/50">
                                            Log In
                                        </Button>
                                    </Link>
                                    <Link to="/signup">
                                        <Button className="bg-gradient-primary text-white hover:opacity-90 transition-opacity shadow-lg hover:shadow-xl">Start Free</Button>
                                    </Link>
                                </>
                            )}
                        </div>

                        <button className="md:hidden p-2 text-muted-foreground" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>

                {mobileMenuOpen && (
                    <div className="md:hidden bg-background border-b border-border">
                        <div className="px-4 py-4 space-y-4">
                            {navItems.map((item) => (
                                <a
                                    key={item.label}
                                    href={item.href}
                                    className="block text-muted-foreground hover:text-foreground transition-colors"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    {item.label}
                                </a>
                            ))}
                            <div className="flex flex-col gap-2 pt-4 border-t border-border">
                                {isAuthenticated ? (
                                    <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                                        <Button className="w-full bg-primary text-primary-foreground">Dashboard</Button>
                                    </Link>
                                ) : (
                                    <>
                                        <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                                            <Button variant="ghost" className="w-full justify-start">
                                                Log In
                                            </Button>
                                        </Link>
                                        <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>
                                            <Button className="w-full bg-primary text-primary-foreground">Start Free</Button>
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </header>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div className="space-y-8 animate-slide-up-fade">
                            <div className="inline-flex items-center gap-2.5 px-4 py-2 glass rounded-full border border-primary/30 backdrop-blur-md">
                                <div className="relative flex">
                                    <span className="w-2.5 h-2.5 bg-primary rounded-full animate-pulse-glow" />
                                    <span className="absolute w-2.5 h-2.5 bg-primary rounded-full animate-ping opacity-75" />
                                </div>
                                <span className="text-sm text-primary font-semibold">Now with Real-Time Market Data</span>
                            </div>

                            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight">
                                <span className="bg-gradient-to-r from-foreground via-foreground to-foreground/80 bg-clip-text text-transparent">
                                    Master Trading
                                </span>
                                <br />
                                <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient">
                                    Without The Risk
                                </span>
                            </h1>

                            <p className="text-lg sm:text-xl text-muted-foreground max-w-xl leading-relaxed">
                                Practice trading with real market data and zero financial risk. Build your skills, test strategies, and gain confidence before trading with real money.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 pt-2">
                                <Link to="/signup">
                                    <Button size="lg" className="bg-gradient-primary text-white hover:opacity-90 transition-all duration-300 px-8 py-6 text-base shadow-2xl hover:shadow-primary/25 hover:scale-105 group">
                                        Start Trading Free
                                        <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </Link>
                                <Button size="lg" variant="outline" className="border-2 border-border hover:bg-muted/50 px-8 py-6 text-base backdrop-blur-sm">
                                    View Demo
                                </Button>
                            </div>

                            <div className="flex flex-wrap items-center gap-6 pt-6">
                                <div className="flex items-center gap-2.5">
                                    <div className="relative flex items-center justify-center">
                                        <div className="w-3 h-3 bg-primary rounded-full" />
                                        <span className="absolute w-3 h-3 bg-primary rounded-full animate-ping" />
                                    </div>
                                    <span className="text-sm font-semibold text-primary">Live Market Data</span>
                                </div>
                                <div className="h-4 w-px bg-border" />
                                <div className="flex items-center gap-2">
                                    <Shield className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">Zero Financial Risk</span>
                                </div>
                            </div>
                        </div>

                        <div className="relative animate-scale-in" style={{ animationDelay: '0.2s' }}>
                            {/* Floating glow effect */}
                            <div className="absolute -inset-6 bg-gradient-accent/10 rounded-3xl blur-3xl animate-pulse-glow" />

                            {/* Main chart card */}
                            <div className="relative glass-card rounded-3xl border border-border/50 p-8 shadow-2xl group hover:shadow-primary/10 transition-all duration-500">
                                {/* Decorative gradient border */}
                                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/10 via-transparent to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                <div className="relative h-96 flex flex-col">
                                    {/* Chart Header */}
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center">
                                                <TrendingUp className="w-5 h-5 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-foreground">BTC/USD</h3>
                                                <p className="text-xs text-muted-foreground">Bitcoin</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="px-3 py-1.5 bg-primary/15 text-primary rounded-lg text-sm font-bold border border-primary/30">+2.45%</span>
                                            <div className="flex items-center gap-1.5 px-3 py-1.5 glass rounded-lg">
                                                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                                                <span className="text-xs font-medium text-muted-foreground">Live</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Animated candlestick chart */}
                                    <div className="flex-1 flex items-end gap-1.5 px-4">
                                        {[65, 45, 70, 55, 80, 60, 75, 50, 85, 65, 90, 70, 95, 75, 88, 92, 78].map((h, i) => (
                                            <div key={i} className="flex-1 h-full flex flex-col justify-end items-center">
                                                <div
                                                    className={`w-full rounded-t-md transition-all duration-700 hover:opacity-80 ${i % 3 === 0 ? 'bg-gradient-to-t from-destructive to-destructive/70' : 'bg-gradient-to-t from-primary to-primary/70'
                                                        }`}
                                                    style={{
                                                        height: `${h}%`,
                                                        animationDelay: `${i * 0.08}s`,
                                                        boxShadow: i % 3 === 0 ? '0 8px 16px rgba(244, 63, 94, 0.3)' : '0 8px 16px rgba(16, 185, 129, 0.3)'
                                                    }}
                                                />
                                            </div>
                                        ))}
                                    </div>

                                    {/* Time labels */}
                                    <div className="flex justify-between mt-6 text-xs font-medium text-muted-foreground px-4">
                                        <span>09:00</span>
                                        <span>12:00</span>
                                        <span>15:00</span>
                                        <span className="text-primary">18:00</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Live Markets Section */}
            <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-card/50 to-background">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <span className="text-sm font-medium text-primary mb-4 block">Live Markets</span>
                        <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 text-balance">
                            Practice with Real-Time Market Data
                        </h2>
                        <p className="text-lg text-muted-foreground">
                            Trade with live cryptocurrency prices updated every minute. Experience authentic market conditions without
                            any financial risk.
                        </p>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 bg-card rounded-2xl border border-border p-6 h-96">
                            {/* Trading Line Chart */}
                            <div className="h-full flex flex-col">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-lg font-semibold text-foreground">Portfolio Performance</span>
                                    <div className="flex gap-4 text-sm">
                                        <span className="text-muted-foreground">1D</span>
                                        <span className="text-primary font-medium">1W</span>
                                        <span className="text-muted-foreground">1M</span>
                                        <span className="text-muted-foreground">1Y</span>
                                    </div>
                                </div>
                                <div className="flex-1 relative">
                                    {/* SVG Line Chart */}
                                    <svg className="w-full h-full" viewBox="0 0 400 200" preserveAspectRatio="none">
                                        {/* Grid lines */}
                                        <line x1="0" y1="50" x2="400" y2="50" stroke="#30363d" strokeWidth="1" />
                                        <line x1="0" y1="100" x2="400" y2="100" stroke="#30363d" strokeWidth="1" />
                                        <line x1="0" y1="150" x2="400" y2="150" stroke="#30363d" strokeWidth="1" />
                                        {/* Gradient area */}
                                        <defs>
                                            <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                                <stop offset="0%" stopColor="#22c55e" stopOpacity="0.3" />
                                                <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
                                            </linearGradient>
                                        </defs>
                                        <path
                                            d="M0,150 L30,140 L60,120 L90,130 L120,100 L150,110 L180,80 L210,90 L240,60 L270,70 L300,40 L330,50 L360,30 L400,40 L400,200 L0,200 Z"
                                            fill="url(#chartGradient)"
                                        />
                                        {/* Main line */}
                                        <path
                                            d="M0,150 L30,140 L60,120 L90,130 L120,100 L150,110 L180,80 L210,90 L240,60 L270,70 L300,40 L330,50 L360,30 L400,40"
                                            fill="none"
                                            stroke="#22c55e"
                                            strokeWidth="2"
                                            className="animate-trading-line"
                                        />
                                    </svg>
                                </div>
                                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                                    <span>Mon</span>
                                    <span>Tue</span>
                                    <span>Wed</span>
                                    <span>Thu</span>
                                    <span>Fri</span>
                                    <span>Sat</span>
                                    <span>Sun</span>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-1">
                            <div className="bg-card rounded-2xl border border-border p-6 h-full flex flex-col">
                                <h3 className="text-lg font-semibold text-foreground mb-4">Market Overview</h3>
                                <div className="space-y-3 flex-1">
                                    {marketData.map((market) => (
                                        <div
                                            key={market.symbol}
                                            className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg"
                                        >
                                            <span className="font-medium text-foreground">{market.symbol}</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-foreground">${market.price.toLocaleString()}</span>
                                                <span
                                                    className={`text-xs font-medium ${market.change >= 0 ? "text-primary" : "text-destructive"}`}
                                                >
                                                    {market.change > 0 ? "+" : ""}
                                                    {market.change.toFixed(2)}%
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { name: "Bitcoin", symbol: "BTC", price: "$98,500" },
                            { name: "Ethereum", symbol: "ETH", price: "$3,450" },
                            { name: "Solana", symbol: "SOL", price: "$185" },
                            { name: "Cardano", symbol: "ADA", price: "$0.92" },
                        ].map((crypto) => (
                            <div key={crypto.symbol} className="bg-card rounded-xl border border-border p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-semibold text-foreground">{crypto.name}</h4>
                                    <span className="text-xs font-medium text-primary">{crypto.symbol}</span>
                                </div>
                                <p className="text-xl font-bold text-foreground">{crypto.price}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-24 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <span className="text-sm font-medium text-primary mb-4 block">Features</span>
                        <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 text-balance">
                            Everything You Need to Become a Better Trader
                        </h2>
                        <p className="text-lg text-muted-foreground">
                            Our platform provides professional-grade tools in a risk-free environment, helping you build confidence
                            before trading with real money.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((feature) => (
                            <div
                                key={feature.title}
                                className="group p-6 bg-card rounded-2xl border border-border hover:border-primary/50 transition-all duration-300"
                            >
                                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                                    <feature.icon className="w-6 h-6 text-primary" />
                                </div>
                                <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                                <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <span className="text-sm font-medium text-primary mb-4 block">Getting Started</span>
                        <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 text-balance">
                            Start Trading in 4 Simple Steps
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {steps.map((step, index) => (
                            <div key={step.title} className="relative">
                                <div className="p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-300 h-full">
                                    <div className="flex items-center gap-4 mb-4">
                                        <span className="text-3xl font-bold text-primary/20">{step.step}</span>
                                        <div className="p-2 rounded-lg bg-primary/10">
                                            <step.icon className="w-5 h-5 text-primary" />
                                        </div>
                                    </div>
                                    <h3 className="text-lg font-semibold text-foreground mb-2">{step.title}</h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                                </div>
                                {index < steps.length - 1 && (
                                    <div className="hidden lg:flex absolute top-1/2 -right-4 -translate-y-1/2">
                                        <ArrowRight className="w-5 h-5 text-primary/30" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <div className="relative bg-card rounded-3xl border border-border p-8 lg:p-16 text-center overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent" />
                        <div className="relative">
                            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 text-balance">
                                Start Trading Risk-Free Today
                            </h2>
                            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                                Join thousands of traders practicing with live market data. Master your strategy before trading with
                                real money.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 px-8">
                                    Get Started Free
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="border-border text-foreground hover:bg-card bg-transparent"
                                >
                                    Learn More
                                </Button>
                            </div>
                            <p className="text-sm text-muted-foreground mt-6">No credit card required • Unlimited virtual trading</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-card border-t border-border py-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-12">
                        <div className="col-span-2">
                            <a href="/" className="flex items-center gap-2 mb-4">
                                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                                    <TrendingUp className="w-5 h-5 text-primary-foreground" />
                                </div>
                                <span className="text-xl font-bold text-foreground">TradeX</span>
                            </a>
                            <p className="text-sm text-muted-foreground max-w-xs mb-6">
                                Master trading without the risk. Practice with real market data and build your skills.
                            </p>
                            <div className="flex gap-4">
                                {socialLinks.map((social) => (
                                    <a
                                        key={social.label}
                                        href={social.href}
                                        className="w-9 h-9 bg-secondary rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors"
                                        aria-label={social.label}
                                    >
                                        <social.icon className="w-4 h-4" />
                                    </a>
                                ))}
                            </div>
                        </div>

                        {Object.entries(footerLinks).map(([title, links]) => (
                            <div key={title}>
                                <h4 className="font-semibold text-foreground mb-4 text-sm">{title}</h4>
                                <ul className="space-y-3">
                                    {links.map((link) => (
                                        <li key={link.label}>
                                            <a
                                                href={link.href}
                                                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                            >
                                                {link.label}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                    <div className="pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
                        <p className="text-sm text-muted-foreground">© 2026 TradeX. All rights reserved.</p>
                        <p className="text-sm text-muted-foreground">Made with ❤️ for aspiring traders worldwide</p>
                    </div>
                </div>
            </footer>
        </main>
    )
}
