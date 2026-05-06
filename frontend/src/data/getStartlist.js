import { ref } from 'vue';

export function useStartlist() {
  const startlist = ref([]);

  const fetchStartlist = async (event, year) => {
    try {
      const res = await fetch(`/api/startlist?event=${event}&year=${year}`);
      startlist.value = await res.json();
    } catch (err) {
      console.error(err);
    }
  };

  return { startlist, fetchStartlist };
}
