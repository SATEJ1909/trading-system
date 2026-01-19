"use client"

import type React from "react"
import { useId, useMemo } from "react"

interface BackgroundPlusProps {
    className?: string
    plusColor?: string
    plusSize?: number
    fade?: boolean
}

export const BackgroundPlus: React.FC<BackgroundPlusProps> = ({
    className = "",
    plusColor = "#3b82f6",
    plusSize = 40,
    fade = true,
}) => {
    const id = useId()
    const patternId = `plus-pattern-${id}`
    const maskId = `fade-mask-${id}`

    const plusPath = useMemo(() => {
        const armLength = plusSize * 0.4
        const armWidth = plusSize * 0.08
        const center = plusSize / 2
        return `
      M ${center - armWidth} ${center - armLength}
      h ${armWidth * 2}
      v ${armLength - armWidth}
      h ${armLength - armWidth}
      v ${armWidth * 2}
      h ${-(armLength - armWidth)}
      v ${armLength - armWidth}
      h ${-armWidth * 2}
      v ${-(armLength - armWidth)}
      h ${-(armLength - armWidth)}
      v ${-armWidth * 2}
      h ${armLength - armWidth}
      Z
    `
    }, [plusSize])

    return (
        <svg
            className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
            xmlns="http://www.w3.org/2000/svg"
        >
            <defs>
                <pattern
                    id={patternId}
                    patternUnits="userSpaceOnUse"
                    width={plusSize * 2}
                    height={plusSize * 2}
                    x="0"
                    y="0"
                >
                    <path d={plusPath} fill={plusColor} fillOpacity="0.15" />
                </pattern>
                {fade && (
                    <radialGradient id={maskId} cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                        <stop offset="0%" stopColor="white" stopOpacity="1" />
                        <stop offset="100%" stopColor="white" stopOpacity="0" />
                    </radialGradient>
                )}
                {fade && (
                    <mask id={`mask-${maskId}`}>
                        <rect width="100%" height="100%" fill={`url(#${maskId})`} />
                    </mask>
                )}
            </defs>
            <rect
                width="100%"
                height="100%"
                fill={`url(#${patternId})`}
                mask={fade ? `url(#mask-${maskId})` : undefined}
            />
        </svg>
    )
}

export default BackgroundPlus
