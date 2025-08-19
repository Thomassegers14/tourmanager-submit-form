<template>
  <main>
    <PageHeader
      :title="'Wielrenner Selectie'"
      :subtitle="eventName.replaceAll('-', ' ')"
      :maxPoints="maxPoints"
      :maxRenners="maxRenners"
      :deadline="deadline"
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
const eventName = 'Vuelta a España-2025'
const deadline = new Date('2025-08-23T10:00:00Z')
</script>