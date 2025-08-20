<template>
  <svg ref="svg" style="width: 100%; height: auto;"></svg>
</template>

<script setup>
import * as d3 from 'd3'
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'

const props = defineProps({
  data: { type: Array, required: true },
  xColumns: { type: Array, required: true },
  yColumn: { type: String, required: true },
  width: { type: Number, default: 600 },
  height: { type: Number, default: 400 },
  margin: { type: Object, default: () => ({ top: 24, right: 40, bottom: 40, left: 160 }) },
  yLabel: { type: String, default: '' },
  xLabel: { type: String, default: '' },
  sortColumn: { type: String, default: null }
})

const svg = ref(null)
let resizeObserver

const drawPlot = () => {
  const { height, data, xColumns, yColumn, margin, yLabel, xLabel } = __props
  d3.select(svg.value).selectAll('*').remove()

  const width = svg.value.clientWidth
  const innerWidth = width - margin.left - margin.right
  const innerHeight = height - margin.top - margin.bottom

  const g = d3.select(svg.value)
    .attr('width', width)
    .attr('height', height)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`)

// default kolom = eerste xColumn
const sortField = __props.sortColumn || __props.xColumns[0]

// filter + sorteer: eerst tier, dan sortField
const filteredData = data
  .filter(d => d.fav_points > 0)
  .sort((a, b) =>
    d3.ascending(+a.tier, +b.tier) ||
    d3.descending(+a[sortField], +b[sortField])
  )


  // groepeer per tier
  const tierGroups = d3.groups(filteredData, d => d.tier)

  // maak yDomain met gaps
  let yDomain = []
  tierGroups.forEach(([tier, riders], i) => {
    yDomain.push(...riders.map(d => d[yColumn]))
    if (i < tierGroups.length - 1) yDomain.push(`__gap_${i}__`)
  })

  const x = d3.scaleLinear()
    .domain(d3.extent(filteredData.flatMap(d => xColumns.map(col => +d[col])))).nice()
    .range([0, innerWidth])

  const y = d3.scaleBand()
    .domain(yDomain)
    .range([0, innerHeight])
    .padding(0.5)

  // assen
  g.append('g')
    .attr('class', 'axis axis-x')
    .attr('transform', `translate(0,${innerHeight})`)
    .call(d3.axisBottom(x).ticks(5))

    g.append('g')
    .attr('class', 'axis axis-x')
    .attr('transform', `translate(0,${-12})`)
    .call(d3.axisTop(x).tickSize(-innerHeight).ticks(5))

  g.append('g')
    .attr('class', 'axis axis-y')
    .call(d3.axisLeft(y).tickSize(0).tickFormat(d => d.startsWith('__gap') ? '' : d))
    
    d3.selectAll(".axis").selectAll(".domain").remove();

  // labels
  if (xLabel) {
    g.append('text')
      .attr('x', innerWidth / 2)
      .attr('y', innerHeight + margin.bottom - 5)
      .attr('text-anchor', 'middle')
      .text(xLabel)
  }

  // Achtergrond per tier
  tierGroups.forEach(([tier, riders]) => {
    const first = y(riders[0][yColumn])
    const last = y(riders[riders.length - 1][yColumn])
    if (first !== undefined && last !== undefined) {
      g.append('line')
        .attr('x1', -margin.left)
        .attr('x2', width)
        .attr('y1', first - y.bandwidth() * 1.5)
        .attr('y2', first - y.bandwidth() * 1.5)
        .attr('class', 'tier-line')
        .lower() // achter alle elementen
    }

    // tier label links
    g.append('text')
      .attr('x', - margin.left)
      .attr('y', y(riders[0][yColumn]))
      .attr('class', 'tier-label')
      .text(`Tier ${tier}`)
  })

  // teken lijnen & cirkels
  filteredData.forEach(d => {
    const yPos = y(d[yColumn])
    if (yPos === undefined) return

    const vals = xColumns.map(col => +d[col])
    g.append('line')
      .attr('x1', x(d3.min(vals)))
      .attr('x2', x(d3.max(vals)))
      .attr('y1', yPos + y.bandwidth() / 2)
      .attr('y2', yPos + y.bandwidth() / 2)
      .attr('class', 'dumbbell-line')

    xColumns.forEach((col, i) => {
      g.append('circle')
        .attr('cx', x(+d[col]))
        .attr('cy', yPos + y.bandwidth() / 2)
        .attr('r', '0.35rem')
        .attr('class', col === sortField ? 'dumbbell-dot dumbbell-dot-primary' : 'dumbbell-dot')
    })

    d3.selectAll('.dumbbell-dot-primary').raise()
  })
}


onMounted(async () => {
  await nextTick()
  drawPlot()
  if (svg.value) {
    resizeObserver = new ResizeObserver(drawPlot)
    resizeObserver.observe(svg.value)
  }
})

onBeforeUnmount(() => {
  if (resizeObserver) resizeObserver.disconnect()
})

watch(
  () => [__props.data, __props.xColumns, __props.yColumn, __props.sortColumn],
  drawPlot,
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

::v-deep(.axis-y) {
  color: var(--primary);
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

::v-deep(.tier-label) {
  font-family: var(--fontSans);
  font-weight: 300;
  font-size: 0.8rem;
  text-transform: uppercase;
  fill: var(--muted-foreground);
}

::v-deep(.tier-line) {
    stroke: var(--border);
    stroke-width: 1px;
}

::v-deep(.dumbbell-line) {
    stroke: var(--secondary);
    stroke-width: 1rem;
}

::v-deep(.dumbbell-dot) {
    stroke: white;
    stroke-width: 1px;
    fill: var(--muted-foreground);
    opacity: 1;
}

::v-deep(.dumbbell-dot-primary) {
    fill: var(--primary);
    stroke: var(--primary)
}


</style>
