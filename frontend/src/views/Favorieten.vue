<template>
  <h1>Methodologie <span class="grey">favorieten en tiers</span></h1>
  <p class="intro">
    Voor elke koers wordt een score berekend die
    verschillende prestatie-indicatoren afkomstig van renners samenbrengt.
    Deze indicatoren worden berekend aan de hand van Procyclingstats-data.
  </p>

  <!-- Sorteer controls -->
  <div class="controls">
    <label for="sort-select">Sorteer op</label>
    <select class="select-outline" id="sort-select" v-model="sortColumn">
      <option v-for="col in xColumns" :key="col" :value="col">
        {{ columnLabels[col] }}
      </option>
    </select>
  </div>

  <!-- Dumbbell plot -->
  <div ref="container" class="plot-container">
    <DumbbellPlot
      :data="startlist"
      :xColumns="['combined_score', 'gc_score', 'classic_score', 'sprinter_score']"
      yColumn="rider_name"
      xLabel="Combined score en profielscores"
      yLabel="Renners"
      :height="480"
      :width="containerWidth"
      :sortColumn="sortColumn"
    />
  </div>

  <section>
    <h3 class="section-title">Profielscores</h3>
    <ul>
      <li>
        <strong>GC-score</strong> — legt de nadruk op meerjarige en seizoensgebonden GC-prestaties:
        <br />
        <small><code>GC = w₁·log(uci_points) + w₂·log(pcs_gc_points_season) + w₃·log(pcs_gc_points) − v₁·log(pcs_rank) − v₂·log(event_rank)</code></small>
      </li>
      <li>
        <strong>Allround-score</strong> — weerspiegelt het <em>hele seizoen</em> en recente vorm (laatste 60 dagen):
        <br />
        <small><code>ALLROUND = a₁·log(pcs_points_season) + a₂·log(pcs_points_last_60d) + a₃·log(uci_points) − b₁·log(pcs_rank) − b₂·log(event_rank)</code></small>
      </li>
      <li>
        <strong>Sprinter-score</strong> — richt zich op meerjarige en seizoensgebonden sprintprestaties:
        <br />
        <small><code>SPR = s₁·log(pcs_sprint_points_season) + s₂·log(pcs_sprint_points) + s₃·log(uci_points) − c₁·log(pcs_rank) − c₂·log(event_rank)</code></small>
      </li>
    </ul>

    <p>
      Voor alle componenten worden bijkomende transformaties toegepast: <em>log-transformatie</em> (dempt scheefheid),
      <em>winsorizing</em> (1–99%) en <em>standaardisatie</em>. Deze Profielscores worden met een extra weging
      samengeteld, zodat GC meer doorweegt op de uiteindelijke score aangezien er meer punten mee te verdienen zijn:
      <br />
      <code>combined_score = w₁ · GC + w₂ · ALLROUND + w₃ · SPR</code>
    </p>

    <!-- Scrollytelling scatterplot -->
    <div class="scrolly-container">
      <div class="graphic" ref="graphic">
        <ScatterPlot
          :data="startlist"
          :xColumn="activeStep.x"
          :yColumn="activeStep.y"
          :xLabel="activeStep.xLabel"
          :yLabel="activeStep.yLabel"
          :topNLabels="10"
          :labelOffset="12"
        />
      </div>

      <div class="steps">
        <div
          v-for="(step, index) in steps"
          :key="index"
          class="step"
          :class="{ active: index === activeIndex }"
          ref="stepRefs"
        >
        <div>
          <h3 class="step-title">{{ step.title }}</h3>
          <p>{{ step.text }}</p>
        </div>
        </div>
      </div>
    </div>

  </section>

  <section>
    <h3 class="section-title">Selectie en tiers</h3>
    <p>
      Voor elke koers worden de <strong>top 15</strong> renners op <code>combined_score</code> geselecteerd en ingedeeld
      in drie tiers:
    </p>
    <ul>
      <li><span class="badge badge-outline">6 punten</span>&emsp;<strong>Tier 1</strong>: 2–3 absolute topfavorieten.</li>
      <li><span class="badge badge-outline">3 punten</span>&emsp;<strong>Tier 2</strong>: directe uitdagers.</li>
      <li><span class="badge badge-outline">1 punt</span>&emsp;<strong>Tier 3</strong>: overige kanshebbers binnen de top 15.</li>
    </ul>
  </section>

  <section>
    <h3 class="section-title">Teamregel</h3>
    <p>
      Om de hiërarchie realistisch te houden, geldt in <strong>Tier&nbsp;1 maximaal één renner per team</strong>:
      indien meerdere ploegmaats in Tier&nbsp;1 vallen, blijft de best scorende renner in Tier&nbsp;1 en worden de
      anderen naar Tier&nbsp;2 verplaatst.
    </p>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue"
import { useIntersectionObserver } from "@vueuse/core"

import DumbbellPlot from "../components/DumbbellPlot.vue"
import ScatterPlot from "../components/Scatterplot.vue"
import { useStartlist } from '../data/getStartlist.js';

const { startlist, fetchStartlist } = useStartlist();

const steps = [
  {
    title: "Seizoensvorm",
    text: "De score is gebaseerd op renners die dit seizoen in vorm zijn én de afgelopen 60 dagen sterke prestaties hebben geleverd.",
    x: "pcs_points_season",
    y: "pcs_points_last_60d",
    xLabel: "PCS punten dit seizoen",
    yLabel: "PCS punten laatste 60 dagen"
  },
  {
    title: "Algemeen klassement",
    text: "Het eindklassement telt zwaar mee. Daarom krijgen renners die goed presteren in het GC-klassement de meeste gewichtspunten.",
    x: "pcs_gc_points",
    y: "pcs_gc_points_season",
    xLabel: "GC PCS punten (3 jaar)",
    yLabel: "GC PCS punten dit seizoen"
  },
  {
    title: "Sprinters",
    text: "Sprinters kunnen veel punten scoren in sprintetappes, dus hun prestaties worden ook meegenomen in de berekening.",
    x: "pcs_sprint_points",
    y: "pcs_sprint_points_season",
    xLabel: "Sprint PCS punten (3 jaar)",
    yLabel: "Sprint PCS punten dit seizoen"
  }
]

const activeIndex = ref(0)
const stepRefs = ref([])

const xColumns = ["combined_score", "gc_score", "classic_score", "sprinter_score"]
const sortColumn = ref(xColumns[0]) // default

const columnLabels = {
  combined_score: "Totaalscore",
  gc_score: "GC-score",
  classic_score: "Allround-score",
  sprinter_score: "Sprinterscore"
}

// Dynamische breedte van de container
const container = ref(null)
const containerWidth = ref(600)

const updateWidth = () => {
  if (container.value) {
    containerWidth.value = container.value.clientWidth
  }
}

onMounted(() => {
  updateWidth()
  window.addEventListener("resize", updateWidth)

  fetchStartlist('vuelta-a-espana', 2025)

  stepRefs.value.forEach((el, index) => {
    if (!el) return
    useIntersectionObserver(el, ([entry]) => {
      if (entry.isIntersecting) {
        activeIndex.value = index
      }
    }, { threshold: 0.5 })
  })
})

onBeforeUnmount(() => {
  window.removeEventListener("resize", updateWidth)
})

const activeStep = computed(() => steps[activeIndex.value])
</script>

<style scoped>
.controls {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem 0;
  gap: 0.5rem;
}

.plot-container {
  width: 100%;
}

.scrolly-container {
  position: relative;
  width: 100%;
}

.graphic {
  position: sticky;
  top: 0; /* blijft bovenaan vastkleven */
  height: 100vh; /* vult de hele viewport */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 0;
}

.graphic > svg {
  width: 100%;
  height: 60vh;
}

.steps {
  position: relative;
  z-index: 1;
}

.step {
  height: 100vh; /* elke step vult de viewport */
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.step > div {
  max-width: 600px;
  background: var(--background);
  padding: 2rem;
  /* text-align: center; */
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

.step.active > div {
  border: 1px solid var(--border);
}

.step-title {
  color: var(--primary);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  text-transform: uppercase;
  letter-spacing: var(--tracking-spaced);
}

</style>
