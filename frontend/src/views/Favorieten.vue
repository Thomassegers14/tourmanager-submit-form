<template>
<h1>Methodologie <span class="grey">favorieten en tiers</span></h1>
<p class="intro">
  Voor elke koers wordt een score berekend die
  verschillende prestatie-indicatoren afkomstig van renners samenbrengt.
  Deze indicatoren worden berekend aan de hand van Procyclingstats-data.
</p>

<div class="controls">
  <label for="sort-select">Sorteer op</label>
  <select class="select-outline" id="sort-select" v-model="sortColumn">
    <option v-for="col in xColumns" :key="col" :value="col">
           {{ columnLabels[col] }}
    </option>
  </select>
</div>

  <div class="plot-container">
    <DumbbellPlot
      :data="data"
      :xColumns="['combined_score', 'gc_score', 'classic_score', 'sprinter_score']"
      yColumn="rider_name"
      xLabel="Combined score en profielscores"
      yLabel="Renners"
      :height='480'
      :width="600"
      :sortColumn="sortColumn"

    />
  </div>

<section>

  <h3 class="section-title">Profielscores</h3>
  <ul>
    <li>
      <strong>GC-score</strong> — legt de nadruk op meerjarige en seizoensgebonden GC-prestaties:
      <br>
      <small><code>GC = w₁·log(uci_points) + w₂·log(pcs_gc_points_season) + w₃·log(pcs_gc_points) − v₁·log(pcs_rank) − v₂·log(event_rank)</code></small>
    </li>
    <li>
      <strong>Allround-score</strong> — weerspiegelt het <em>hele seizoen</em> en recente vorm (laatste 60 dagen):
      <br>
      <small><code>ALLROUND = a₁·log(pcs_points_season) + a₂·log(pcs_points_last_60d) + a₃·log(uci_points) − b₁·log(pcs_rank) − b₂·log(event_rank)</code></small>
    </li>
    <li>
      <strong>Sprinter-score</strong> — richt zich op meerjarige en seizoensgebonden sprintprestaties:
      <br>
      <small><code>SPR = s₁·log(pcs_sprint_points_season) + s₂·log(pcs_sprint_points) + s₃·log(uci_points) − c₁·log(pcs_rank) − c₂·log(event_rank)</code></small>
    </li>
  </ul>

  <p>
    Voor alle componenten worden bijkomende transformaties toegepast: <em>log-transformatie</em> (dempt scheefheid),
    <em>winsorizing</em> (1–99%) en <em>standaardisatie</em>. Deze Profielscores worden met een extra weging samengeteld, zodat GC meer doorweegt op de uiteindelijke score aangezien er meer punten mee te verdienen zijn:
    <br>
    <code>combined_score = w₁ · GC + w₂ · ALLROUND + w₃ · SPR</code>
  </p>

    <div class="scatter-container">
    <ScatterPlot v-for="(config, index) in plots" :key="index" :data="data" :xColumn="config.x" :yColumn="config.y"
      :xLabel="config.xLabel" :yLabel="config.yLabel" :topNLabels="10" :labelOffset="12" :height="config.height" />
  </div>

</section>
<section>
  <h3 class="section-title">Selectie en tiers</h3>
  <p>
    Voor elke koers worden de <strong>top 15</strong> renners op <code>combined_score</code> geselecteerd en ingedeeld in drie tiers:
  </p>
  <ul>
    <li><span class="badge badge-outline">6 punten</span>&emsp;<strong>Tier 1</strong>: 2–3 absolute topfavorieten.</li>
    <li><span class="badge badge-outline">3 punten</span>&emsp;<strong>Tier 2</strong>: directe uitdagers.</li>
    <li><span class="badge badge-outline">1 punt</span>&emsp;<strong>Tier 3</strong>: overige kanshebbers binnen de top 15.</li>
  </ul>
  <p>
    De grenzen tussen tiers worden primair bepaald door de <em>grootste score-sprongen</em> binnen de top 15; 
    bij onduidelijkheid worden percentielen gebruikt (≈33% en 66%) zodat altijd drie tiers ontstaan.
  </p>

</section>
<section>

  <h3 class="section-title">Teamregel</h3>
  <p>
    Om de hiërarchie realistisch te houden, geldt in <strong>Tier&nbsp;1 maximaal één renner per team</strong>:
    indien meerdere ploegmaats in Tier&nbsp;1 vallen, blijft de best scorende renner in Tier&nbsp;1 en worden de anderen naar
    Tier&nbsp;2 verplaatst.
  </p>
</section>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import data from '../data/startlist-vuelta-a-espana-2025.json'
import DumbbellPlot from '../components/DumbbellPlot.vue'
import ScatterPlot from '../components/Scatterplot.vue'

const xColumns = ['combined_score', 'gc_score', 'classic_score', 'sprinter_score']
const sortColumn = ref(xColumns[0]) // default

const columnLabels = {
  combined_score: "Totaalscore",
  gc_score: "GC-score",
  classic_score: "Allround-score",
  sprinter_score: "Sprinterscore"
}

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
  { x: 'pcs_points_season', y: 'pcs_points_last_60d', xLabel: "Aantal pcs punten seizoen", yLabel: "Aantal pcs punten laatste 60 dagen", height: 400 },
  { x: 'pcs_gc_points', y: 'pcs_gc_points_season', xLabel: "Aantal GC pcs punten laatste 3 jaar", yLabel: "Aantal GC pcs punten seizoen", height: 400 },
  { x: 'pcs_sprint_points', y: 'pcs_sprint_points_season', xLabel: "Aantal sprint pcs punten laatste 3 jaar", yLabel: "Aantal sprint pcs punten seizoen", height: 400 },
]
</script>

<style scoped>

.controls {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 1rem 0;
    gap: 0.5rem;
}

.plot-container{
  display: flex;
    justify-content: center;
    align-items: center;
    padding: 1rem 0;
}

.plot-container > *{
  width: 100%;
  max-width: 800px;
}

.scatter-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 0.5rem;
  padding: 1rem 0;
}

.scatter-container>* {
  width: 100%;
}
</style>
