<template>
  <button id="toggle-darkmode" class="button-darkmode"><Eclipse class="icon" /><span>darkmode</span></button>
  <main>
    <PageHeader
      :title="'Wielrenner Selectie'"
      :subtitle="eventName.replaceAll('-', ' ')"
      :maxPoints="maxPoints"
      :maxRenners="maxRenners"
    />
    <Rules
      :maxPoints="maxPoints"
      :maxRenners="maxRenners"
      />
    <DeelnemerForm
      :maxPoints="maxPoints"
      :maxRenners="maxRenners"
    />
  </main>
</template>

<script setup>
import { Eclipse } from 'lucide-vue-next';
import PageHeader from './components/PageHeader.vue'
import Rules from './components/Rules.vue'
import DeelnemerForm from './components/DeelnemerForm.vue'

const maxPoints = 10
const maxRenners = 12
const eventName = 'Tour De France-2025'

</script>