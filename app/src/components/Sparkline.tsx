interface SparklineProps {
  data?: number[]
  className?: string
}

export default function Sparkline({ data, className = '' }: SparklineProps) {
  const defaultData = [65, 59, 80, 81, 56, 72, 85, 78, 82, 88, 75, 92]
  const points = data || defaultData
  const width = 120
  const height = 40
  const max = Math.max(...points)
  const min = Math.min(...points)
  const range = max - min || 1

  const coordinates = points.map((val, i) => {
    const x = (i / (points.length - 1)) * width
    const y = height - ((val - min) / range) * (height - 4) - 2
    return `${x},${y}`
  })

  return (
    <svg width={width} height={height} className={className}>
      <polyline
        points={coordinates.join(' ')}
        fill="none"
        stroke="#D31111"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
