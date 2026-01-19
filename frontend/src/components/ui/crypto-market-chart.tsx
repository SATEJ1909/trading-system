"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import { TrendingUp, TrendingDown, RefreshCw, Bookmark, Clock } from "lucide-react"

// Interface for crypto data points
interface CryptoDataPoint {
    timestamp: number
    open: number
    high: number
    low: number
    close: number
    volume: number
}

// Interface for CoinGecko market chart response
interface CoinGeckoOHLC {
    0: number // timestamp
    1: number // open
    2: number // high
    3: number // low
    4: number // close
}

// Props interface
interface CryptoMarketChartProps {
    coinId?: string
    symbol?: string
    name?: string
    onBuy?: () => void
    onSell?: () => void
    onTrade?: () => void
}

// Main component
export default function CryptoMarketChart({
    coinId = "bitcoin",
    symbol = "BTC",
    name = "Bitcoin",
    onBuy,
    onSell,
    onTrade,
}: CryptoMarketChartProps) {
    // State for chart data and settings
    const [chartData, setChartData] = useState<CryptoDataPoint[]>([])
    const [hoveredPoint, setHoveredPoint] = useState<CryptoDataPoint | null>(null)
    const [chartType, setChartType] = useState<"candlestick" | "line" | "area">("candlestick")
    const [timeframe, setTimeframe] = useState<"1" | "7" | "30" | "365">("7")
    const [isLoading, setIsLoading] = useState(true)
    const [currentPrice, setCurrentPrice] = useState(0)
    const [priceChange, setPriceChange] = useState(0)
    const [priceChangePercent, setPriceChangePercent] = useState(0)
    const [showTooltip, setShowTooltip] = useState(false)
    const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })
    const [error, setError] = useState<string | null>(null)
    const [marketData, setMarketData] = useState({
        volume24h: 0,
        marketCap: 0,
        high24h: 0,
        low24h: 0,
    })

    // Refs for canvas elements
    const candleChartRef = useRef<HTMLCanvasElement>(null)
    const lineChartRef = useRef<HTMLCanvasElement>(null)
    const areaChartRef = useRef<HTMLCanvasElement>(null)
    const chartContainerRef = useRef<HTMLDivElement>(null)

    // Fetch OHLC data from CoinGecko
    const fetchOHLCData = useCallback(async () => {
        setIsLoading(true)
        setError(null)

        try {
            // Fetch OHLC data
            const ohlcResponse = await fetch(
                `https://api.coingecko.com/api/v3/coins/${coinId}/ohlc?vs_currency=inr&days=${timeframe}`
            )

            if (!ohlcResponse.ok) {
                throw new Error("Failed to fetch OHLC data")
            }

            const ohlcData: CoinGeckoOHLC[] = await ohlcResponse.json()

            // Transform to our format
            const transformedData: CryptoDataPoint[] = ohlcData.map((d) => ({
                timestamp: d[0],
                open: d[1],
                high: d[2],
                low: d[3],
                close: d[4],
                volume: 0, // OHLC endpoint doesn't include volume
            }))

            setChartData(transformedData)

            // Calculate price change
            if (transformedData.length > 0) {
                const latestPoint = transformedData[transformedData.length - 1]
                const firstPoint = transformedData[0]
                setCurrentPrice(latestPoint.close)
                setPriceChange(latestPoint.close - firstPoint.open)
                setPriceChangePercent(((latestPoint.close - firstPoint.open) / firstPoint.open) * 100)
            }

            // Fetch current market data
            const marketResponse = await fetch(
                `https://api.coingecko.com/api/v3/coins/${coinId}?localization=false&tickers=false&community_data=false&developer_data=false`
            )

            if (marketResponse.ok) {
                const marketInfo = await marketResponse.json()
                setMarketData({
                    volume24h: marketInfo.market_data?.total_volume?.inr || 0,
                    marketCap: marketInfo.market_data?.market_cap?.inr || 0,
                    high24h: marketInfo.market_data?.high_24h?.inr || 0,
                    low24h: marketInfo.market_data?.low_24h?.inr || 0,
                })
                setCurrentPrice(marketInfo.market_data?.current_price?.inr || currentPrice)
                setPriceChangePercent(marketInfo.market_data?.price_change_percentage_24h || priceChangePercent)
            }
        } catch (err) {
            console.error("Error fetching crypto data:", err)
            setError("Failed to load chart data. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }, [coinId, timeframe])

    // Initialize data on component mount and when timeframe changes
    useEffect(() => {
        fetchOHLCData()

        // Auto-refresh every 60 seconds
        const interval = setInterval(fetchOHLCData, 60000)
        return () => clearInterval(interval)
    }, [fetchOHLCData])

    // Draw candlestick chart
    useEffect(() => {
        if (!chartData.length || !candleChartRef.current) return

        const canvas = candleChartRef.current
        const ctx = canvas.getContext("2d")
        if (!ctx) return

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        // Set dimensions
        const width = canvas.width
        const height = canvas.height
        const padding = { top: 20, right: 60, bottom: 30, left: 80 }
        const chartWidth = width - padding.left - padding.right
        const chartHeight = height - padding.top - padding.bottom

        // Find min and max values
        const minPrice = Math.min(...chartData.map((d) => d.low)) * 0.998
        const maxPrice = Math.max(...chartData.map((d) => d.high)) * 1.002
        const priceRange = maxPrice - minPrice

        // Draw background grid
        ctx.strokeStyle = "rgba(255, 255, 255, 0.1)"
        ctx.lineWidth = 0.5

        // Horizontal grid lines
        for (let i = 0; i <= 5; i++) {
            const y = padding.top + (chartHeight / 5) * i
            ctx.beginPath()
            ctx.moveTo(padding.left, y)
            ctx.lineTo(width - padding.right, y)
            ctx.stroke()

            // Price labels
            const price = maxPrice - (i / 5) * priceRange
            ctx.fillStyle = "rgba(255, 255, 255, 0.7)"
            ctx.font = "10px Inter, system-ui, sans-serif"
            ctx.textAlign = "right"
            ctx.fillText(`₹${price.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`, padding.left - 10, y + 4)
        }

        // Draw candles
        const candleWidth = Math.max(2, (chartWidth / chartData.length) * 0.7)
        const spacing = (chartWidth / chartData.length) * 0.3

        chartData.forEach((dataPoint, i) => {
            const x = padding.left + i * (candleWidth + spacing) + spacing / 2

            // Calculate y positions
            const openY = padding.top + chartHeight - ((dataPoint.open - minPrice) / priceRange) * chartHeight
            const closeY = padding.top + chartHeight - ((dataPoint.close - minPrice) / priceRange) * chartHeight
            const highY = padding.top + chartHeight - ((dataPoint.high - minPrice) / priceRange) * chartHeight
            const lowY = padding.top + chartHeight - ((dataPoint.low - minPrice) / priceRange) * chartHeight

            // Determine if bullish or bearish
            const isBullish = dataPoint.close > dataPoint.open

            // Draw wick
            ctx.beginPath()
            ctx.strokeStyle = isBullish ? "rgba(34, 197, 94, 0.9)" : "rgba(239, 68, 68, 0.9)"
            ctx.lineWidth = 1
            ctx.moveTo(x + candleWidth / 2, highY)
            ctx.lineTo(x + candleWidth / 2, lowY)
            ctx.stroke()

            // Draw candle body
            ctx.fillStyle = isBullish ? "rgba(34, 197, 94, 0.4)" : "rgba(239, 68, 68, 0.4)"
            ctx.strokeStyle = isBullish ? "rgba(34, 197, 94, 0.9)" : "rgba(239, 68, 68, 0.9)"

            const candleHeight = Math.max(1, Math.abs(closeY - openY))
            const yStart = isBullish ? closeY : openY

            ctx.shadowColor = isBullish ? "rgba(34, 197, 94, 0.5)" : "rgba(239, 68, 68, 0.5)"
            ctx.shadowBlur = 4
            ctx.fillRect(x, yStart, candleWidth, candleHeight)
            ctx.strokeRect(x, yStart, candleWidth, candleHeight)
            ctx.shadowBlur = 0

            // Time labels (show only a few)
            if (i % Math.ceil(chartData.length / 6) === 0) {
                const date = new Date(dataPoint.timestamp)
                let timeLabel = ""

                if (timeframe === "1") {
                    timeLabel = date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
                } else {
                    timeLabel = date.toLocaleDateString("en-IN", { month: "short", day: "numeric" })
                }

                ctx.fillStyle = "rgba(255, 255, 255, 0.7)"
                ctx.font = "10px Inter, system-ui, sans-serif"
                ctx.textAlign = "center"
                ctx.fillText(timeLabel, x + candleWidth / 2, height - padding.bottom / 2)
            }
        })
    }, [chartData, chartType, timeframe])

    // Draw line chart
    useEffect(() => {
        if (!chartData.length || !lineChartRef.current) return

        const canvas = lineChartRef.current
        const ctx = canvas.getContext("2d")
        if (!ctx) return

        ctx.clearRect(0, 0, canvas.width, canvas.height)

        const width = canvas.width
        const height = canvas.height
        const padding = { top: 20, right: 60, bottom: 30, left: 80 }
        const chartWidth = width - padding.left - padding.right
        const chartHeight = height - padding.top - padding.bottom

        const minPrice = Math.min(...chartData.map((d) => d.low)) * 0.998
        const maxPrice = Math.max(...chartData.map((d) => d.high)) * 1.002
        const priceRange = maxPrice - minPrice

        // Draw grid
        ctx.strokeStyle = "rgba(255, 255, 255, 0.1)"
        ctx.lineWidth = 0.5

        for (let i = 0; i <= 5; i++) {
            const y = padding.top + (chartHeight / 5) * i
            ctx.beginPath()
            ctx.moveTo(padding.left, y)
            ctx.lineTo(width - padding.right, y)
            ctx.stroke()

            const price = maxPrice - (i / 5) * priceRange
            ctx.fillStyle = "rgba(255, 255, 255, 0.7)"
            ctx.font = "10px Inter, system-ui, sans-serif"
            ctx.textAlign = "right"
            ctx.fillText(`₹${price.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`, padding.left - 10, y + 4)
        }

        // Draw line
        ctx.beginPath()
        ctx.strokeStyle = "rgba(59, 130, 246, 0.9)"
        ctx.lineWidth = 2

        chartData.forEach((dataPoint, i) => {
            const x = padding.left + i * (chartWidth / (chartData.length - 1))
            const y = padding.top + chartHeight - ((dataPoint.close - minPrice) / priceRange) * chartHeight

            if (i === 0) {
                ctx.moveTo(x, y)
            } else {
                ctx.lineTo(x, y)
            }

            if (i % Math.ceil(chartData.length / 6) === 0) {
                const date = new Date(dataPoint.timestamp)
                let timeLabel = timeframe === "1"
                    ? date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
                    : date.toLocaleDateString("en-IN", { month: "short", day: "numeric" })

                ctx.fillStyle = "rgba(255, 255, 255, 0.7)"
                ctx.font = "10px Inter, system-ui, sans-serif"
                ctx.textAlign = "center"
                ctx.fillText(timeLabel, x, height - padding.bottom / 2)
            }
        })

        ctx.shadowColor = "rgba(59, 130, 246, 0.5)"
        ctx.shadowBlur = 10
        ctx.stroke()
        ctx.shadowBlur = 0
    }, [chartData, chartType, timeframe])

    // Draw area chart
    useEffect(() => {
        if (!chartData.length || !areaChartRef.current) return

        const canvas = areaChartRef.current
        const ctx = canvas.getContext("2d")
        if (!ctx) return

        ctx.clearRect(0, 0, canvas.width, canvas.height)

        const width = canvas.width
        const height = canvas.height
        const padding = { top: 20, right: 60, bottom: 30, left: 80 }
        const chartWidth = width - padding.left - padding.right
        const chartHeight = height - padding.top - padding.bottom

        const minPrice = Math.min(...chartData.map((d) => d.low)) * 0.998
        const maxPrice = Math.max(...chartData.map((d) => d.high)) * 1.002
        const priceRange = maxPrice - minPrice

        // Grid
        ctx.strokeStyle = "rgba(255, 255, 255, 0.1)"
        ctx.lineWidth = 0.5

        for (let i = 0; i <= 5; i++) {
            const y = padding.top + (chartHeight / 5) * i
            ctx.beginPath()
            ctx.moveTo(padding.left, y)
            ctx.lineTo(width - padding.right, y)
            ctx.stroke()

            const price = maxPrice - (i / 5) * priceRange
            ctx.fillStyle = "rgba(255, 255, 255, 0.7)"
            ctx.font = "10px Inter, system-ui, sans-serif"
            ctx.textAlign = "right"
            ctx.fillText(`₹${price.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`, padding.left - 10, y + 4)
        }

        // Gradient
        const gradient = ctx.createLinearGradient(0, padding.top, 0, height - padding.bottom)
        gradient.addColorStop(0, "rgba(59, 130, 246, 0.4)")
        gradient.addColorStop(1, "rgba(59, 130, 246, 0)")

        // Area
        ctx.beginPath()
        ctx.moveTo(padding.left, height - padding.bottom)

        chartData.forEach((dataPoint, i) => {
            const x = padding.left + i * (chartWidth / (chartData.length - 1))
            const y = padding.top + chartHeight - ((dataPoint.close - minPrice) / priceRange) * chartHeight
            ctx.lineTo(x, y)

            if (i % Math.ceil(chartData.length / 6) === 0) {
                const date = new Date(dataPoint.timestamp)
                let timeLabel = timeframe === "1"
                    ? date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
                    : date.toLocaleDateString("en-IN", { month: "short", day: "numeric" })

                ctx.fillStyle = "rgba(255, 255, 255, 0.7)"
                ctx.font = "10px Inter, system-ui, sans-serif"
                ctx.textAlign = "center"
                ctx.fillText(timeLabel, x, height - padding.bottom / 2)
            }
        })

        ctx.lineTo(width - padding.right, height - padding.bottom)
        ctx.closePath()
        ctx.fillStyle = gradient
        ctx.fill()

        // Line on top
        ctx.beginPath()
        chartData.forEach((dataPoint, i) => {
            const x = padding.left + i * (chartWidth / (chartData.length - 1))
            const y = padding.top + chartHeight - ((dataPoint.close - minPrice) / priceRange) * chartHeight
            if (i === 0) ctx.moveTo(x, y)
            else ctx.lineTo(x, y)
        })

        ctx.strokeStyle = "rgba(59, 130, 246, 0.9)"
        ctx.lineWidth = 2
        ctx.shadowColor = "rgba(59, 130, 246, 0.5)"
        ctx.shadowBlur = 10
        ctx.stroke()
        ctx.shadowBlur = 0
    }, [chartData, chartType, timeframe])

    // Handle mouse move for tooltip
    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!chartData.length || !chartContainerRef.current) return

        const rect = chartContainerRef.current.getBoundingClientRect()
        const x = e.clientX - rect.left

        let canvas: HTMLCanvasElement | null = null
        switch (chartType) {
            case "candlestick": canvas = candleChartRef.current; break
            case "line": canvas = lineChartRef.current; break
            case "area": canvas = areaChartRef.current; break
        }

        if (!canvas) return

        const padding = { left: 80, right: 60 }
        const chartWidth = canvas.width - padding.left - padding.right

        if (x >= padding.left && x <= canvas.width - padding.right) {
            const dataIndex = Math.min(
                Math.floor(((x - padding.left) / chartWidth) * chartData.length),
                chartData.length - 1
            )

            if (dataIndex >= 0) {
                setHoveredPoint(chartData[dataIndex])
                setShowTooltip(true)
                setTooltipPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top })
            }
        } else {
            setShowTooltip(false)
        }
    }

    const formatPrice = (price: number) => {
        return `₹${price.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    }

    const formatLargeNumber = (num: number) => {
        if (num >= 1e12) return `₹${(num / 1e12).toFixed(2)}T`
        if (num >= 1e9) return `₹${(num / 1e9).toFixed(2)}B`
        if (num >= 1e7) return `₹${(num / 1e7).toFixed(2)}Cr`
        if (num >= 1e5) return `₹${(num / 1e5).toFixed(2)}L`
        return `₹${num.toLocaleString("en-IN")}`
    }

    const formatDate = (timestamp: number) => {
        const date = new Date(timestamp)
        if (timeframe === "1") {
            return date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
        }
        return `${date.toLocaleDateString("en-IN", { month: "short", day: "numeric" })} ${date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}`
    }

    const timeframeLabels: Record<string, string> = {
        "1": "24H",
        "7": "7D",
        "30": "1M",
        "365": "1Y",
    }

    return (
        <div className="w-full bg-card rounded-2xl border border-border shadow-xl overflow-hidden">
            {/* Header */}
            <div className="p-4 sm:p-6 bg-secondary/30 border-b border-border">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${priceChangePercent >= 0 ? 'bg-primary/20' : 'bg-destructive/20'
                            }`}>
                            {priceChangePercent >= 0 ? (
                                <TrendingUp className="h-5 w-5 text-primary" />
                            ) : (
                                <TrendingDown className="h-5 w-5 text-destructive" />
                            )}
                        </div>
                        <div>
                            <h2 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
                                {name}
                                <span className="text-sm font-normal text-muted-foreground">{symbol}/INR</span>
                            </h2>
                            <div className="flex items-center mt-1 gap-2">
                                <span className="text-lg sm:text-xl font-semibold text-foreground">
                                    {formatPrice(currentPrice)}
                                </span>
                                <span className={`px-2 py-0.5 rounded text-sm font-medium ${priceChangePercent >= 0
                                        ? "bg-primary/20 text-primary"
                                        : "bg-destructive/20 text-destructive"
                                    }`}>
                                    {priceChangePercent >= 0 ? "↑" : "↓"} {Math.abs(priceChangePercent).toFixed(2)}%
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={fetchOHLCData}
                            disabled={isLoading}
                            className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-colors"
                            title="Refresh data"
                        >
                            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                        </button>
                        <div className="flex gap-1 bg-secondary/50 rounded-lg p-1">
                            {(["1", "7", "30", "365"] as const).map((tf) => (
                                <button
                                    key={tf}
                                    onClick={() => setTimeframe(tf)}
                                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${timeframe === tf
                                            ? "bg-primary text-primary-foreground"
                                            : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                                        }`}
                                >
                                    {timeframeLabels[tf]}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Chart type selector */}
                <div className="mt-4 flex gap-2">
                    {(["candlestick", "line", "area"] as const).map((type) => (
                        <button
                            key={type}
                            onClick={() => setChartType(type)}
                            className={`flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${chartType === type
                                    ? "bg-secondary text-foreground border-b-2 border-primary"
                                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                                }`}
                        >
                            <Clock className="w-4 h-4 mr-1.5" />
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Chart container */}
            <div
                ref={chartContainerRef}
                className="relative p-4 h-[350px] sm:h-[400px] w-full bg-background"
                onMouseMove={handleMouseMove}
                onMouseLeave={() => setShowTooltip(false)}
            >
                {isLoading ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                ) : error ? (
                    <div className="absolute inset-0 flex items-center justify-center text-destructive">
                        <p>{error}</p>
                    </div>
                ) : (
                    <>
                        <canvas
                            ref={candleChartRef}
                            width={800}
                            height={400}
                            className={`w-full h-full ${chartType === "candlestick" ? "block" : "hidden"}`}
                        />
                        <canvas
                            ref={lineChartRef}
                            width={800}
                            height={400}
                            className={`w-full h-full ${chartType === "line" ? "block" : "hidden"}`}
                        />
                        <canvas
                            ref={areaChartRef}
                            width={800}
                            height={400}
                            className={`w-full h-full ${chartType === "area" ? "block" : "hidden"}`}
                        />

                        {/* Tooltip */}
                        {showTooltip && hoveredPoint && (
                            <div
                                className="absolute z-10 bg-popover border border-border rounded-lg shadow-lg p-3 text-sm pointer-events-none"
                                style={{
                                    left: `${Math.min(tooltipPosition.x, 600)}px`,
                                    top: `${Math.max(tooltipPosition.y - 120, 10)}px`,
                                }}
                            >
                                <div className="font-semibold mb-2 text-foreground">{formatDate(hoveredPoint.timestamp)}</div>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                                    <span className="text-muted-foreground">Open:</span>
                                    <span className="text-right text-foreground">{formatPrice(hoveredPoint.open)}</span>
                                    <span className="text-muted-foreground">High:</span>
                                    <span className="text-right text-primary">{formatPrice(hoveredPoint.high)}</span>
                                    <span className="text-muted-foreground">Low:</span>
                                    <span className="text-right text-destructive">{formatPrice(hoveredPoint.low)}</span>
                                    <span className="text-muted-foreground">Close:</span>
                                    <span className={`text-right ${hoveredPoint.close >= hoveredPoint.open ? "text-primary" : "text-destructive"}`}>
                                        {formatPrice(hoveredPoint.close)}
                                    </span>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Market stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 sm:p-6 bg-secondary/30 border-t border-border">
                <div className="bg-card rounded-xl p-3 sm:p-4 border border-border">
                    <div className="text-muted-foreground text-xs sm:text-sm">24h Volume</div>
                    <div className="text-foreground font-semibold mt-1 text-sm sm:text-base">
                        {formatLargeNumber(marketData.volume24h)}
                    </div>
                </div>
                <div className="bg-card rounded-xl p-3 sm:p-4 border border-border">
                    <div className="text-muted-foreground text-xs sm:text-sm">Market Cap</div>
                    <div className="text-foreground font-semibold mt-1 text-sm sm:text-base">
                        {formatLargeNumber(marketData.marketCap)}
                    </div>
                </div>
                <div className="bg-card rounded-xl p-3 sm:p-4 border border-border">
                    <div className="text-muted-foreground text-xs sm:text-sm">24h High</div>
                    <div className="text-primary font-semibold mt-1 text-sm sm:text-base">
                        {formatPrice(marketData.high24h)}
                    </div>
                </div>
                <div className="bg-card rounded-xl p-3 sm:p-4 border border-border">
                    <div className="text-muted-foreground text-xs sm:text-sm">24h Low</div>
                    <div className="text-destructive font-semibold mt-1 text-sm sm:text-base">
                        {formatPrice(marketData.low24h)}
                    </div>
                </div>
            </div>

            {/* Action buttons */}
            <div className="p-4 sm:p-6 bg-card border-t border-border flex flex-wrap gap-3 justify-center">
                <button
                    onClick={onBuy}
                    className="px-5 sm:px-6 py-2.5 sm:py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-xl transition-all transform hover:scale-105 shadow-lg flex items-center gap-2"
                >
                    <TrendingUp className="w-4 h-4" />
                    Buy {symbol}
                </button>
                <button
                    onClick={onSell}
                    className="px-5 sm:px-6 py-2.5 sm:py-3 bg-destructive hover:bg-destructive/90 text-destructive-foreground font-medium rounded-xl transition-all transform hover:scale-105 shadow-lg flex items-center gap-2"
                >
                    <TrendingDown className="w-4 h-4" />
                    Sell {symbol}
                </button>
                <button
                    onClick={onTrade}
                    className="px-5 sm:px-6 py-2.5 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all transform hover:scale-105 shadow-lg flex items-center gap-2"
                >
                    <RefreshCw className="w-4 h-4" />
                    Trade
                </button>
                <button className="px-5 sm:px-6 py-2.5 sm:py-3 bg-secondary hover:bg-secondary/80 text-foreground font-medium rounded-xl transition-all transform hover:scale-105 shadow-lg flex items-center gap-2">
                    <Bookmark className="w-4 h-4" />
                    Watchlist
                </button>
            </div>
        </div>
    )
}
