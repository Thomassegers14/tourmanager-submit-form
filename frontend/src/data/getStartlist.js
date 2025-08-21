import { ref } from 'vue';

export function useStartlist() {
  const startlist = ref([]);
  const API_BASE = "https://tourmanager-scraper.onrender.com";

  const fetchStartlist = async (event, year) => {
    try {
      const res = await fetch(`${API_BASE}/startlist_favorites/${event}/${year}`);
      startlist.value = await res.json();
    } catch (err) {
      console.error(err);
    }
  };

  return { startlist, fetchStartlist };
}
