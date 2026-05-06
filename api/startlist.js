export default async function handler(req, res) {
  const { event, year } = req.query;

  if (!event || !year) {
    return res.status(400).json({ error: 'event en year zijn verplicht' });
  }

  try {
    const response = await fetch(
      `https://tourmanager-scraper.onrender.com/startlist_favorites/${event}/${year}`
    );

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Scraper niet beschikbaar' });
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Kon startlist niet ophalen' });
  }
}
