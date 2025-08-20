<template>
  <svg ref="svg"></svg>
</template>

<script setup>
import * as d3 from 'd3'
import { onMounted, watch, ref, onBeforeUnmount } from 'vue'

defineProps({
  data: {
    type: Array,
    required: true
  },
  xColumn: {
    type: String,
    required: true
  },
  yColumn: {
    type: String,
    required: true
  },
  width: {
    type: Number,
    default: 600
  },
  height: {
    type: Number,
    default: 400
  },
  margin: {
    type: Object,
    default: () => ({ top: 24, right: 60, bottom: 48, left: 60 })
  },
  topNLabels: {
    type: Number,
    default: 10
  },
  labelOffset: {
    type: Number,
    default: 8
  },
  xLabel: { type: String, default: '' }, // nieuw
  yLabel: { type: String, default: '' }  // nieuw
})

const svg = ref(null)
let resizeObserver

const drawScatter = () => {
  const { height, margin, data, xColumn, yColumn, topNLabels, labelOffset, xLabel, yLabel } = __props

  // reset svg
  d3.select(svg.value).selectAll('*').remove()

  const filteredData = data.filter(d =>
    d[xColumn] !== null &&
    d[yColumn] !== null &&
    d[xColumn] > 0 &&
    d[yColumn] > 0
  )

  const width = svg.value.clientWidth

  const innerWidth = width - margin.left - margin.right
  const innerHeight = height - margin.top - margin.bottom

  const g = d3.select(svg.value)
    .attr('width', width)
    .attr('height', height)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`)

  // scales
function roundExtent(extent, step = 500) {
  const [min, max] = extent
  return [
    Math.floor(min / step) * step,
    Math.ceil(max / step) * step
  ]
}

const xExtent = d3.extent(filteredData, d => +d[xColumn])
const x = d3.scaleLinear()
    .domain(roundExtent(xExtent, 500))
    .range([0, innerWidth])

// Gebruik voor y-as (als numeriek)
const yExtent = d3.extent(filteredData, d => +d[yColumn])
const y = d3.scaleLinear()
    .domain(roundExtent(yExtent, 300))  // bv afronden op 10
    .range([innerHeight, 0])

  // kleurenschaal
  const colorScale = d3.scaleOrdinal()
    .domain([6, 3, 1, 0])
    .range(["black", "black", "black", "lightgrey"]) // 10 verschillende kleuren

  // axes
  g.append('g')
    .attr('transform', `translate(0,${innerHeight})`)
    .attr('class', 'axis axis-x')
    .call(d3.axisBottom(x).ticks(4).tickSize(-innerHeight))

  g.append('g')
    .attr('class', 'axis axis-y')
    .call(d3.axisLeft(y).ticks(4).tickSize(-innerWidth))

  d3.selectAll(".axis").selectAll(".domain").remove();

  // === Axis labels ===
  if (xLabel) {
    g.append('text')
      .attr('class', 'axis axis-label x-axis-label')
      .attr('x', innerWidth / 2)
      .attr('y', innerHeight + margin.bottom - 5)
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .text(xLabel)
  }

  if (yLabel) {
    g.append('text')
      .attr('class', 'axis axis-label y-axis-label')
      .attr('x', -innerHeight / 2)
      .attr('y', -margin.left + 15)
      .attr('transform', 'rotate(-90)')
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .text(yLabel)
  }

  // points
  g.selectAll('circle')
    .data(filteredData)
    .enter()
    .append('circle')
    .attr('cx', d => x(d[xColumn]))
    .attr('cy', d => y(d[yColumn]))
    .attr('r', 5)
    .attr('fill', d => colorScale(d.fav_points))  // <- hier
    .attr('opacity', 0.8)
    .attr('stroke', "white")
    .each(function (d) {
      if (d.fav_points > 0) d3.select(this).raise()
    })

  // === labels (top N en fav_points > 0) ===
  const labelCandidates = [
    ...filteredData
      .sort((a, b) => d3.descending(a[xColumn], b[xColumn]))
      .slice(0, topNLabels),
    ...filteredData.filter(d => d.fav_points > 0)
  ]

  const uniqueCandidates = Array.from(new Set(labelCandidates)) // dubbele verwijderen

  const labelNodes = uniqueCandidates.map(d => {
    const anchorX = x(d[xColumn]) + labelOffset
    const anchorY = y(d[yColumn]) - labelOffset
    return { x: anchorX, y: anchorY, anchorX, anchorY, data: d }
  })

  function formatRiderName(fullName) {
    const parts = fullName.trim().split(' ')
    if (parts.length < 2) return fullName

    const firstName = parts.pop()
    const lastName = parts.join(' ').toLowerCase()

    // Capitalize eerste letter na spaties en speciale tekens
    const capitalizedLastName = lastName.replace(/(^|\s|-)(\p{L})/gu, (_, sep, letter) =>
      sep + letter.toLocaleUpperCase()
    )

    return `${capitalizedLastName}`
  }

  const labels = g.selectAll('.label')
    .data(labelNodes)
    .enter()
    .append('text')
    .attr('class', 'label')
    .text(d => formatRiderName(d.data.rider_name))
    .attr('font-size', '0.8rem')
    .attr('fill', 'black')
    .attr('text-anchor', 'start')
    .attr('fill', d => colorScale(d.data.fav_points))
    .attr('dy', '0.35em')

  // meet bbox van labels en sla op
  labels.each(function (d) {
    const bbox = this.getBBox()
    d.bbox = { width: bbox.width, height: bbox.height }
  })

  labels.each(function (d) {
    if (d.data.fav_points > 0) d3.select(this).raise()
  })

  // force simulation
  d3.forceSimulation(labelNodes)
    .force('anchorX', d3.forceX(d => d.anchorX).strength(0.2))
    .force('anchorY', d3.forceY(d => d.anchorY).strength(0.2))
    .force('collide', d3.forceCollide(24))
    .stop()
    .tick(100) // simulatie meteen uit laten trillen

  // update labels positie
  labels
    .attr('x', d => d.x)
    .attr('y', d => d.y)

  // teken lijntjes
  g.selectAll('.label-line')
    .data(labelNodes)
    .enter()
    .append('line')
    .attr('class', 'label-line')
    .attr('x1', d => x(d.data[xColumn]))
    .attr('y1', d => y(d.data[yColumn]))
    .attr('x2', d => d.x)
    .attr('y2', d => d.y)
    .attr('stroke', '#999')
    .attr('stroke-width', 0.5)
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
  () => [__props.data, __props.xColumn, __props.yColumn, __props.topNLabels, __props.labelOffset],
  drawScatter,
  { deep: true }
)
</script>

<style scoped>
::v-deep(.axis) {
  font-family: var(--fontSans);
  font-weight: 300;
  font-size: 0.8rem;
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

.label-line {
  pointer-events: none;
}
</style>
