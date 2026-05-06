import { ref } from 'vue';

export function useStartlist() {
  const startlist = ref([]);

  const fetchStartlist = async (event, year) => {
    try {
      const res = await fetch(`/api/startlist?event=${event}&year=${year}`);
      if (!res.ok || !res.headers.get('content-type')?.includes('application/json')) {
        console.warn('Startlist API niet beschikbaar — gebruik vercel dev voor lokale ontwikkeling');
        return;
      }
      startlist.value = await res.json();
    } catch (err) {
      console.error(err);
    }
  };

  return { startlist, fetchStartlist };
}
