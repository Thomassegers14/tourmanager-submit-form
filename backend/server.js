import express from 'express';
import pool from './db.js';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// POST /submit
app.post('/submit', async (req, res) => {
  const { voornaam, achternaam, email } = req.body;
  const selectie = req.body.selectie

  if (!Array.isArray(selectie)) {
    return res.status(400).send('Ongeldige selectie')
  }

  const rider_ids = selectie.map(r => r.rider_id)
  const rider_names = selectie.map(r => r.rider_name)

  console.log('Geselecteerde renners:', rider_ids, rider_names)

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
});

// GET /inzendingen
app.get('https://tourmanager-submit-form.onrender.com/inzendingen', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM inzendingen ORDER BY tijdstip DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Kan inzendingen niet ophalen' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server draait op poort ${PORT}`));