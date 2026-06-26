import pool from './_db.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { event, year } = req.query;

  const conditions = [];
  const params = [];
  if (event) {
    params.push(event);
    conditions.push(`event_id = $${params.length}`);
  }
  if (year) {
    params.push(year);
    conditions.push(`event_year = $${params.length}`);
  }

  const where = conditions.length ? ` WHERE ${conditions.join(' AND ')}` : '';

  try {
    const result = await pool.query(
      `SELECT * FROM inzendingen${where} ORDER BY tijdstip DESC`,
      params
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Kan inzendingen niet ophalen' });
  }
}
