<template>
  <div class="container">
    <h1>Deelnemerselectie</h1>

    <input type="file" accept=".csv" @change="verwerkCSV" />
    
    <form @submit.prevent="verzendFormulier">
      <label>
        Voornaam:
        <input v-model="form.voornaam" type="text" required />
      </label>
      <label>
        Achternaam:
        <input v-model="form.achternaam" type="text" required />
      </label>
      <label>
        E-mail:
        <input v-model="form.email" type="email" required />
      </label>

      <fieldset>
        <legend>Selecteer maximaal 10 deelnemers:</legend>
        <div v-for="(d, i) in deelnemers" :key="i">
          <label>
            <input type="checkbox" :value="d.naam" v-model="form.selectie" />
            {{ d.naam }}
          </label>
        </div>
      </fieldset>

      <p class="error" v-if="foutmelding">{{ foutmelding }}</p>

      <button type="submit">Verstuur selectie</button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import Papa from 'papaparse';

const deelnemers = ref([]);
const foutmelding = ref('');

const form = ref({
  voornaam: '',
  achternaam: '',
  email: '',
  selectie: [],
});

function verwerkCSV(e) {
  const file = e.target.files[0];
  Papa.parse(file, {
    header: true,
    complete: (result) => {
      deelnemers.value = result.data.filter(r => r.naam); // kolom 'naam' vereist
    },
  });
}

async function verzendFormulier() {
  if (form.value.selectie.length === 0) {
    foutmelding.value = 'Selecteer minstens 1 deelnemer.';
    return;
  }
  if (form.value.selectie.length > 10) {
    foutmelding.value = 'Je mag maximaal 10 deelnemers selecteren.';
    return;
  }

  foutmelding.value = '';

  const payload = {
    voornaam: form.value.voornaam,
    achternaam: form.value.achternaam,
    email: form.value.email,
    deelnemers: form.value.selectie.join(', '),
  };

  const res = await fetch('/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (res.ok) {
    alert('Inzending opgeslagen!');
    form.value = { voornaam: '', achternaam: '', email: '', selectie: [] };
  } else {
    alert('Er ging iets mis.');
  }
}
</script>

<style>
.container {
  max-width: 700px;
  margin: auto;
  font-family: sans-serif;
}
input[type="text"], input[type="email"] {
  width: 100%;
  padding: 8px;
  margin-bottom: 10px;
}
fieldset {
  margin: 20px 0;
}
.error {
  color: red;
}
</style>