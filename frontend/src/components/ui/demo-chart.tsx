"use client"

import { useState, useEffect, useRef } from "react"
import { TrendingUp, TrendingDown } from "lucide-react"

// Demo chart with static data - no API calls, always works
export default function DemoChart() {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [hoveredPrice, setHoveredPrice] = useState<number | null>(null)

    // Static demo data for BTC (realistic INR prices)
    const demoData = [
        { time: '9 AM', price: 8745000 },
        { time: '10 AM', price: 8752000 },
        { time: '11 AM', price: 8768000 },
        { time: '12 PM', price: 8755000 },
        { time: '1 PM', price: 8790000 },
        { time: '2 PM', price: 8812000 },
        { time: '3 PM', price: 8795000 },
        { time: '4 PM', price: 8820000 },
        { time: '5 PM', price: 8845000 },
        { time: '6 PM', price: 8838000 },
        { time: '7 PM', price: 8860000 },
        { time: '8 PM', price: 8875000 },
    ]

    const currentPrice = demoData[demoData.length - 1].price
    const startPrice = demoData[0].price
    const priceChange = currentPrice - startPrice
    const priceChangePercent = ((priceChange / startPrice) * 100).toFixed(2)
    const isPositive = priceChange >= 0

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        // Clear and set dimensions
        const width = canvas.width
        const height = canvas.height
        ctx.clearRect(0, 0, width, height)

        const padding = { top: 20, right: 20, bottom: 40, left: 70 }
        const chartWidth = width - padding.left - padding.right
        const chartHeight = height - padding.top - padding.bottom

        // Find min/max
        const prices = demoData.map(d => d.price)
        const minPrice = Math.min(...prices) * 0.999
        const maxPrice = Math.max(...prices) * 1.001
        const priceRange = maxPrice - minPrice

        // Draw grid
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
        ctx.lineWidth = 0.5

        for (let i = 0; i <= 4; i++) {
            const y = padding.top + (chartHeight / 4) * i
            ctx.beginPath()
            ctx.moveTo(padding.left, y)
            ctx.lineTo(width - padding.right, y)
            ctx.stroke()

            const price = maxPrice - (i / 4) * priceRange
            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
            ctx.font = '11px Inter, system-ui, sans-serif'
            ctx.textAlign = 'right'
            ctx.fillText(`₹${(price / 100000).toFixed(1)}L`, padding.left - 8, y + 4)
        }

        // Create gradient
        const gradient = ctx.createLinearGradient(0, padding.top, 0, height - padding.bottom)
        gradient.addColorStop(0, isPositive ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)')
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')

        // Draw area fill
        ctx.beginPath()
        ctx.moveTo(padding.left, height - padding.bottom)

        demoData.forEach((point, i) => {
            const x = padding.left + (i / (demoData.length - 1)) * chartWidth
            const y = padding.top + chartHeight - ((point.price - minPrice) / priceRange) * chartHeight
            ctx.lineTo(x, y)
        })

        ctx.lineTo(width - padding.right, height - padding.bottom)
        ctx.closePath()
        ctx.fillStyle = gradient
        ctx.fill()

        // Draw line
        ctx.beginPath()
        demoData.forEach((point, i) => {
            const x = padding.left + (i / (demoData.length - 1)) * chartWidth
            const y = padding.top + chartHeight - ((point.price - minPrice) / priceRange) * chartHeight

            if (i === 0) ctx.moveTo(x, y)
            else ctx.lineTo(x, y)
        })

        ctx.strokeStyle = isPositive ? 'rgba(34, 197, 94, 1)' : 'rgba(239, 68, 68, 1)'
        ctx.lineWidth = 2.5
        ctx.shadowColor = isPositive ? 'rgba(34, 197, 94, 0.5)' : 'rgba(239, 68, 68, 0.5)'
        ctx.shadowBlur = 8
        ctx.stroke()
        ctx.shadowBlur = 0

        // Draw points
        demoData.forEach((point, i) => {
            const x = padding.left + (i / (demoData.length - 1)) * chartWidth
            const y = padding.top + chartHeight - ((point.price - minPrice) / priceRange) * chartHeight

            ctx.beginPath()
            ctx.arc(x, y, 3, 0, Math.PI * 2)
            ctx.fillStyle = isPositive ? 'rgba(34, 197, 94, 1)' : 'rgba(239, 68, 68, 1)'
            ctx.fill()
        })

        // Time labels
        demoData.forEach((point, i) => {
            if (i % 3 === 0 || i === demoData.length - 1) {
                const x = padding.left + (i / (demoData.length - 1)) * chartWidth
                ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'
                ctx.font = '10px Inter, system-ui, sans-serif'
                ctx.textAlign = 'center'
                ctx.fillText(point.time, x, height - 15)
            }
        })
    }, [])

    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current
        if (!canvas) return

        const rect = canvas.getBoundingClientRect()
        const x = e.clientX - rect.left
        const padding = { left: 70, right: 20 }
        const chartWidth = canvas.width - padding.left - padding.right

        if (x >= padding.left && x <= canvas.width - padding.right) {
            const index = Math.round(((x - padding.left) / chartWidth) * (demoData.length - 1))
            if (index >= 0 && index < demoData.length) {
                setHoveredPrice(demoData[index].price)
            }
        }
    }

    return (
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-border bg-secondary/30">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isPositive ? 'bg-primary/20' : 'bg-destructive/20'
                            }`}>
                            {isPositive ? (
                                <TrendingUp className="w-5 h-5 text-primary" />
                            ) : (
                                <TrendingDown className="w-5 h-5 text-destructive" />
                            )}
                        </div>
                        <div>
                            <h3 className="font-semibold text-foreground">Bitcoin <span className="text-sm text-muted-foreground">BTC/INR</span></h3>
                            <div className="flex items-center gap-2">
                                <span className="text-lg font-bold text-foreground">
                                    {hoveredPrice
                                        ? `₹${hoveredPrice.toLocaleString('en-IN')}`
                                        : `₹${currentPrice.toLocaleString('en-IN')}`
                                    }
                                </span>
                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${isPositive
                                        ? 'bg-primary/20 text-primary'
                                        : 'bg-destructive/20 text-destructive'
                                    }`}>
                                    {isPositive ? '↑' : '↓'} {priceChangePercent}%
                                </span>
                            </div>
                        </div>
                    </div>
                    <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded">Demo Data</span>
                </div>
            </div>

            {/* Chart */}
            <div className="p-4 bg-background">
                <canvas
                    ref={canvasRef}
                    width={700}
                    height={250}
                    className="w-full h-[200px]"
                    onMouseMove={handleMouseMove}
                    onMouseLeave={() => setHoveredPrice(null)}
                />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-2 p-4 bg-secondary/30 border-t border-border">
                <div className="text-center">
                    <div className="text-xs text-muted-foreground">Open</div>
                    <div className="text-sm font-medium text-foreground">₹87.45L</div>
                </div>
                <div className="text-center">
                    <div className="text-xs text-muted-foreground">High</div>
                    <div className="text-sm font-medium text-primary">₹88.75L</div>
                </div>
                <div className="text-center">
                    <div className="text-xs text-muted-foreground">Low</div>
                    <div className="text-sm font-medium text-destructive">₹87.45L</div>
                </div>
                <div className="text-center">
                    <div className="text-xs text-muted-foreground">Volume</div>
                    <div className="text-sm font-medium text-foreground">₹125Cr</div>
                </div>
            </div>
        </div>
    )
}
