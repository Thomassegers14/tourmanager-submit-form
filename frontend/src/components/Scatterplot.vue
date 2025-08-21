<template>
  <svg ref="svg"></svg>
</template>

<script setup>
import * as d3 from 'd3'
import { onMounted, watch, ref, onBeforeUnmount } from 'vue'

defineProps({
  data: { type: Array, required: true },
  xColumn: { type: String, required: true },
  yColumn: { type: String, required: true },
  width: { type: Number, default: 600 },
  height: { type: Number, default: 400 },
  margin: { type: Object, default: () => ({ top: 24, right: 24,  bottom: 48, left: 60 }) },
  topNLabels: { type: Number, default: 10 },
  labelOffset: { type: Number, default: 8 },
  xLabel: { type: String, default: '' },
  yLabel: { type: String, default: '' }
})

const svg = ref(null)
let resizeObserver
let g, xAxisG, yAxisG

function roundExtent(extent, step = 500) {
  const [min, max] = extent
  return [
    Math.floor(min / step) * step,
    Math.ceil(max / step) * step
  ]
}

function formatRiderName(fullName) {
  const parts = fullName.trim().split(' ')
  if (parts.length < 2) return fullName
  const firstName = parts.pop()
  const lastName = parts.join(' ').toLowerCase()
  return lastName.replace(/(^|\s|-)(\p{L})/gu, (_, sep, letter) => sep + letter.toLocaleUpperCase())
}

const drawScatter = () => {
  const { margin, data, xColumn, yColumn, topNLabels, labelOffset, xLabel, yLabel } = __props

  const width = svg.value.clientWidth || __props.width
  const height = svg.value.clientHeight || __props.height
  const innerWidth = width - margin.left - margin.right
  const innerHeight = height - margin.top - margin.bottom

  const root = d3.select(svg.value).attr('width', width).attr('height', height)

  if (!g) {
    g = root.append('g').attr('transform', `translate(${margin.left},${margin.top})`)
    xAxisG = g.append('g').attr('class', 'axis x-axis').attr('transform', `translate(0,${innerHeight})`)
    yAxisG = g.append('g').attr('class', 'axis y-axis')
    g.append('text').attr('class', 'x-axis-label')
    g.append('text').attr('class', 'y-axis-label')
  }

  const filteredData = data
  const xExtent = d3.extent(filteredData, d => +d[xColumn])
  const yExtent = d3.extent(filteredData, d => +d[yColumn])

  const x = d3.scaleLinear().domain(roundExtent(xExtent, 500)).range([0, innerWidth])
  const y = d3.scaleLinear().domain(roundExtent(yExtent, 500)).range([innerHeight, 0])

  const t = root.transition().duration(800).ease(d3.easeCubicInOut)

  xAxisG.transition(t).call(d3.axisBottom(x).ticks(4).tickSize(-innerHeight))
  yAxisG.transition(t).call(d3.axisLeft(y).ticks(4).tickSize(-innerWidth))
  root.selectAll(".domain").remove()

  g.select(".x-axis-label")
    .attr('x', innerWidth / 2)
    .attr('y', innerHeight + margin.bottom - 5)
    .attr('text-anchor', 'middle')
    .text(xLabel)

  g.select(".y-axis-label")
    .attr('x', -innerHeight / 2)
    .attr('y', -margin.left + 15)
    .attr('transform', 'rotate(-90)')
    .attr('text-anchor', 'middle')
    .text(yLabel)

  const circles = g.selectAll("circle").data(filteredData, d => d.rider_name)
  circles.join(
    enter => enter.append("circle")
      .attr("cx", d => x(d[xColumn]))
      .attr("cy", d => y(d[yColumn]))
      .attr("r", 5)
      .attr("class", d => d.fav_points > 0 ? "dot dot-primary" : "dot"),
    update => update.transition(t)
      .attr("cx", d => x(d[xColumn]))
      .attr("cy", d => y(d[yColumn])),
    exit => exit.transition(t).remove()
  )

  // === Labels ===
  const labelCandidates = [
    ...filteredData.sort((a, b) => d3.descending(a[xColumn], b[xColumn])).slice(0, topNLabels),
    ...filteredData.filter(d => d.fav_points > 0)
  ]
  const uniqueCandidates = Array.from(new Set(labelCandidates))

  const labelsPrev = g.selectAll('.label').data()
  const labelNodes = uniqueCandidates.map(d => {
    const prev = labelsPrev?.find(l => l.data.rider_name === d.rider_name)
    return {
      x: x(d[xColumn]) + labelOffset,
      y: y(d[yColumn]) - labelOffset,
      x0: prev ? prev.x : x(d[xColumn]) + labelOffset,
      y0: prev ? prev.y : y(d[yColumn]) - labelOffset,
      data: d
    }
  })

  // force layout with boundary clamps
// korte force sim alleen op labels, respecteer cirkelpositie als anker
const sim = d3.forceSimulation(labelNodes)
  .force('x', d3.forceX(d => x(d.data[xColumn]) + labelOffset).strength(0.5))
  .force('y', d3.forceY(d => y(d.data[yColumn]) - labelOffset).strength(0.5))
  .force('collide', d3.forceCollide(28))
  .stop()

for (let i = 0; i < 100; i++) {
  sim.tick()
  // clamp tijdens ticks
  labelNodes.forEach(d => {
    d.x = Math.max(0, Math.min(innerWidth, d.x))
    d.y = Math.max(0, Math.min(innerHeight, d.y))
  })
}


const padding = 60 // minimale afstand van labels tot SVG rand

// clamp labels binnen plot met padding
labelNodes.forEach(d => {
  const padding = 12
  // clamp x binnen SVG
  d.x = Math.max(padding, Math.min(innerWidth - padding, d.x))

  // kies text-anchor afhankelijk van positie
  if (d.x <= padding + 1) {
    d.anchor = 'start'
  } else if (d.x >= innerWidth - padding - 1) {
    d.anchor = 'end'
  } else {
    d.anchor = 'middle'
  }

  // clamp y
  const textHeight = 18
  d.y = Math.max(textHeight / 2, Math.min(innerHeight - textHeight / 2, d.y))
})



  const labels = g.selectAll('.label').data(labelNodes, d => d.data.rider_name)
  labels.join(
    enter => enter.append('text')
      .attr('class', 'label')
      .attr('fill', d => d.data.fav_points > 0 ? 'black' : 'grey')
      .attr('text-anchor', d => d.anchor)
      .text(d => formatRiderName(d.data.rider_name))
      .attr('x', d => d.x0)
      .attr('y', d => d.y0)
      .call(enter => enter.transition(t).attr('x', d => d.x).attr('y', d => d.y)),
    update => update.transition(t).attr('x', d => d.x).attr('y', d => d.y).attr('text-anchor', d => d.anchor)
,
    exit => exit.remove()
  )

  labels.each(function (d) {
    if (d.data.fav_points > 0) d3.select(this).raise()
  })

  const lines = g.selectAll('.label-line').data(labelNodes, d => d.data.rider_name)
  lines.join(
    enter => enter.append('line')
      .attr('class', 'label-line')
      .attr('x1', d => x(d.data[xColumn]))
      .attr('y1', d => y(d.data[yColumn]))
      .attr('x2', d => d.x0)
      .attr('y2', d => d.y0)
      .call(enter => enter.transition(t).attr('x2', d => d.x).attr('y2', d => d.y)),
    update => update.transition(t)
      .attr('x1', d => x(d.data[xColumn]))
      .attr('y1', d => y(d.data[yColumn]))
      .attr('x2', d => d.x)
      .attr('y2', d => d.y),
    exit => exit.remove()
  )
}

onMounted(() => {
  drawScatter()
  resizeObserver = new ResizeObserver(drawScatter)
  resizeObserver.observe(svg.value)
})

onBeforeUnmount(() => {
  if (resizeObserver) resizeObserver.disconnect()
})

watch(
  () => [__props.data, __props.xColumn, __props.yColumn],
  drawScatter,
  { deep: true }
)
</script>

<style scoped>
::v-deep(.axis) {
  font-family: var(--fontSans);
  font-weight: 300;
  font-size: 0.9rem;
  color: var(--muted-foreground);
}

::v-deep(.axis line) {
  stroke: var(--border);
  stroke-dasharray: 2px 1px;
}

::v-deep(.axis-label) {
  font-weight: 300;
  font-size: 0.9rem;
  fill: var(--muted-foreground);
}

::v-deep(.dot) {
    stroke: white;
    stroke-width: 1px;
    fill: var(--muted-foreground);
    opacity: 1;
}

::v-deep(.dot-primary) {
    fill: var(--primary);
    stroke: var(--primary)
}

::v-deep(.label) {
  font-weight: var(--font-weight-light);
}

::v-deep(.label-line) {
  pointer-events: none;
  stroke: var(--border);
}
</style>
