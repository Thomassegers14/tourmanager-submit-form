<template>
  <h2>Favorieten</h2>
  <p>Hoe worden de favorieten berekend?</p>
  <div class="scatter-container">
    <ScatterPlot
      v-for="(config, index) in plots"
      :key="index"
      :data="data"
      :xColumn="config.x"
      :yColumn="config.y"
      :xLabel="config.xLabel"
      :yLabel="config.yLabel"
      :topNLabels="10"
      :labelOffset="12"
      :height="config.height"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import ScatterPlot from '../components/Scatterplot.vue'
import data from '../data/startlist-tour-de-france-2025.json'

const container = ref(null)
const containerWidth = ref(500) // default waarde

const updateWidth = () => {
  if (container.value) {
    containerWidth.value = container.value.clientWidth / 1.05  // evt. iets kleiner dan container
  }
}

onMounted(() => {
  updateWidth()
  window.addEventListener('resize', updateWidth)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateWidth)
})

const plots = [
  { x: 'pcs_points_season', y: 'pcs_points_last_60d', xLabel: "Aantal pcs punten seizoen", yLabel: "Aantal pcs punten laatste 60 dagen", width: 500, height: 400 },
  { x: 'pcs_gc_points', y: 'pcs_gc_points_season', xLabel: "Aantal GC pcs punten laatste 3 jaar", yLabel: "Aantal GC pcs punten seizoen", width: 500, height: 400 },
  { x: 'pcs_sprint_points', y: 'pcs_sprint_points_season', xLabel: "Aantal sprint pcs punten laatste 3 jaar", yLabel: "Aantal sprint pcs punten seizoen", width: 500, height: 400 },
  { x: 'rank', y: 'combined_score', xLabel: "Rank", yLabel: "Index", width: 500, height: 400 }
]
</script>

<style scoped>
.scatter-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(500px, 1fr));
  gap: 0.5rem;
}

.scatter-container > * {
  width: 100%;
}
</style>
