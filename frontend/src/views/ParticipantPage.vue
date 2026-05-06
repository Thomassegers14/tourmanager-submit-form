<template>
  <main>
    <PageHeader
      :title="'Wielrenner Selectie'"
      :subtitle="eventName.replaceAll('-', ' ')"
      :maxPoints="maxPoints"
      :maxRenners="maxRenners"
    />
    <Rules :maxPoints="maxPoints" :maxRenners="maxRenners" />
    <DeelnemerForm :maxPoints="maxPoints" :maxRenners="maxRenners" />
  </main>
</template>

<script setup>
import PageHeader from '../components/PageHeader.vue'
import Rules from '../components/Rules.vue'
import DeelnemerForm from '../components/ParticipantForm.vue'

const maxPoints = 10
const maxRenners = 12
const eventName = 'Giro d\'Italia-2026'
</script>