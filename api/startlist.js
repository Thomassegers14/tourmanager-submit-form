function parseCSV(text) {
  const lines = text.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  return lines.slice(1).map(line => {
    const values = line.split(',');
    return Object.fromEntries(headers.map((h, i) => [h, values[i]?.trim() ?? '']));
  });
}

export default async function handler(req, res) {
  const { event, year } = req.query;

  if (!event || !year) {
    return res.status(400).json({ error: 'event en year zijn verplicht' });
  }

  const csvUrl = `https://raw.githubusercontent.com/Thomassegers14/tourmanager-scraper/main/data/processed/startlists_favorites/startlist_${event}_${year}.csv`;

  try {
    const response = await fetch(csvUrl);

    if (!response.ok) {
      return res.status(404).json({ error: `Startlist niet gevonden voor ${event} ${year}` });
    }

    const csvText = await response.text();
    const data = parseCSV(csvText);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Kon startlist niet ophalen' });
  }
}
