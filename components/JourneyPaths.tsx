'use client'

import { useEffect, useRef } from 'react'
import * as d3 from 'd3'

interface Journey {
  handle: string | null
  points: { date: string; mood_score: number }[]
}

const PATH_COLORS = [
  '#6366f1',
  '#8b5cf6',
  '#06b6d4',
  '#34d399',
  '#f59e0b',
  '#ec4899',
  '#3b82f6',
]

function generateDemoJourneys(): Journey[] {
  const now = Date.now()
  const day = 86400000

  const templates = [
    { handle: 'alexc', shape: (t: number) => Math.sin(t * Math.PI) * 0.6 + (t - 0.5) * 0.4 },
    { handle: 'sarahk', shape: (t: number) => -0.3 + Math.sin(t * 2.5) * 0.35 + t * 0.5 },
    { handle: null, shape: (t: number) => (Math.random() - 0.5) * 0.6 + Math.sin(t * 4) * 0.3 },
    { handle: 'mikejr', shape: (t: number) => -0.5 + t * 0.9 + Math.sin(t * 6) * 0.15 },
    { handle: 'vera_f', shape: (t: number) => 0.2 + Math.sin(t * 1.5 + 1) * 0.45 },
  ]

  return templates.map(({ handle, shape }) => {
    const points = Array.from({ length: 14 }, (_, i) => {
      const t = i / 13
      const date = new Date(now - (13 - i) * 7 * day).toISOString()
      const mood_score = Math.max(-1, Math.min(1, shape(t) + (Math.random() - 0.5) * 0.15))
      return { date, mood_score }
    })
    return { handle, points }
  })
}

export default function JourneyPaths({ journeys }: { journeys: Journey[] }) {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const data = journeys.length > 0 ? journeys : generateDemoJourneys()

  useEffect(() => {
    const render = () => {
      if (!svgRef.current || !containerRef.current) return

      const width = containerRef.current.clientWidth
      const height = containerRef.current.clientHeight
      if (width === 0 || height === 0) return

      const svg = d3.select(svgRef.current)
      svg.selectAll('*').remove()
      svg.attr('width', width).attr('height', height)

      const defs = svg.append('defs')

      // Glow filter
      const glowFilter = defs.append('filter').attr('id', 'path-glow').attr('x', '-20%').attr('y', '-20%').attr('width', '140%').attr('height', '140%')
      glowFilter.append('feGaussianBlur').attr('in', 'SourceGraphic').attr('stdDeviation', '4').attr('result', 'blur')
      const feMerge = glowFilter.append('feMerge')
      feMerge.append('feMergeNode').attr('in', 'blur')
      feMerge.append('feMergeNode').attr('in', 'SourceGraphic')

      // Padding
      const padX = width * 0.08
      const padYTop = height * 0.15
      const padYBot = height * 0.15

      data.forEach((journey, i) => {
        if (journey.points.length < 2) return
        const color = PATH_COLORS[i % PATH_COLORS.length]

        const dates = journey.points.map(p => new Date(p.date))
        const xScale = d3.scaleTime()
          .domain([d3.min(dates)!, d3.max(dates)!])
          .range([padX, width - padX])

        const yScale = d3.scaleLinear()
          .domain([-1, 1])
          .range([height - padYBot, padYTop])

        const lineGen = d3.line<{ date: string; mood_score: number }>()
          .x(d => xScale(new Date(d.date)))
          .y(d => yScale(d.mood_score))
          .curve(d3.curveCatmullRom.alpha(0.5))

        // Shadow path (thicker, dimmer)
        svg.append('path')
          .datum(journey.points)
          .attr('fill', 'none')
          .attr('stroke', color)
          .attr('stroke-width', 6)
          .attr('stroke-opacity', 0.08)
          .attr('d', lineGen)

        // Main glow path
        const path = svg.append('path')
          .datum(journey.points)
          .attr('fill', 'none')
          .attr('stroke', color)
          .attr('stroke-width', 1.5)
          .attr('stroke-opacity', 0.75)
          .attr('filter', 'url(#path-glow)')
          .attr('d', lineGen)

        const totalLength = (path.node() as SVGPathElement)?.getTotalLength() ?? 1000

        path
          .attr('stroke-dasharray', `${totalLength} ${totalLength}`)
          .attr('stroke-dashoffset', totalLength)
          .transition()
          .duration(2800)
          .delay(i * 400)
          .ease(d3.easeCubicInOut)
          .attr('stroke-dashoffset', 0)

        // Dot at last point
        const last = journey.points[journey.points.length - 1]
        const dotX = xScale(new Date(last.date))
        const dotY = yScale(last.mood_score)

        svg.append('circle')
          .attr('cx', dotX)
          .attr('cy', dotY)
          .attr('r', 4)
          .attr('fill', color)
          .attr('opacity', 0)
          .attr('filter', 'url(#path-glow)')
          .transition()
          .delay(i * 400 + 2800)
          .duration(400)
          .attr('opacity', 1)

        // Handle label
        if (journey.handle) {
          svg.append('text')
            .attr('x', dotX + 10)
            .attr('y', dotY + 4)
            .attr('fill', color)
            .attr('font-size', '11px')
            .attr('font-family', 'var(--font-mono), monospace')
            .attr('opacity', 0)
            .text(`@${journey.handle}`)
            .transition()
            .delay(i * 400 + 3200)
            .duration(500)
            .attr('opacity', 0.7)
        }
      })
    }

    render()

    const observer = new ResizeObserver(render)
    if (containerRef.current) observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [data])

  return (
    <div ref={containerRef} className="absolute inset-0 w-full h-full">
      <svg ref={svgRef} className="w-full h-full" />
    </div>
  )
}
