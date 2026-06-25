import { useEffect, useRef, useState } from 'react'

interface NumberTickerProps {
  value: number
  prefix?: string
  suffix?: string
  duration?: number
  className?: string
  decimals?: number
}

export default function NumberTicker({
  value,
  prefix = '',
  suffix = '',
  duration = 800,
  className = '',
  decimals = 2,
}: NumberTickerProps) {
  const [displayValue, setDisplayValue] = useState(0)
  const containerRef = useRef<HTMLSpanElement>(null)
  const hasAnimated = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated.current) {
            hasAnimated.current = true
            const startTime = performance.now()
            const startValue = 0

            const animate = (currentTime: number) => {
              const elapsed = currentTime - startTime
              const progress = Math.min(elapsed / duration, 1)
              const eased = 1 - Math.pow(1 - progress, 3)
              const current = startValue + (value - startValue) * eased
              setDisplayValue(current)

              if (progress < 1) {
                requestAnimationFrame(animate)
              }
            }

            requestAnimationFrame(animate)
          }
        })
      },
      { threshold: 0.3 }
    )

    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    return () => observer.disconnect()
  }, [value, duration])

  const formatted = displayValue.toLocaleString('en-GB', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })

  return (
    <span ref={containerRef} className={className}>
      {prefix}{formatted}{suffix}
    </span>
  )
}
