import { ref } from 'vue';

const form = ref({
  voornaam: '',
  achternaam: '',
  email: '',
  selectie: []
});

const submitted = ref(false);
const submittedData = ref({ voornaam: '', achternaam: '', riders: [], totalPoints: 0 });

export function useFormState() {
  return { form, submitted, submittedData };
}
