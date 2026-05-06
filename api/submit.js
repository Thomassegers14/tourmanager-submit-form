import pool from './_db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { voornaam, achternaam, email, selectie } = req.body;

  if (!Array.isArray(selectie)) {
    return res.status(400).json({ error: 'Ongeldige selectie' });
  }

  const rider_ids = selectie.map(r => r.rider_id);
  const rider_names = selectie.map(r => r.rider_name);

  try {
    await pool.query(
      `INSERT INTO inzendingen (voornaam, achternaam, email, rider_ids, rider_names, tijdstip)
       VALUES ($1, $2, $3, $4, $5, NOW())`,
      [voornaam, achternaam, email, rider_ids, rider_names]
    );
    res.status(200).json({ message: 'Inzending opgeslagen' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Databasefout' });
  }
}
