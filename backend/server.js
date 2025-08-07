import express from 'express';
import pool from './db.js';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();
app.use(cors({
  origin: ['http://localhost:5173', 'https://tourmanager-submit-form-1.onrender.com'],
  credentials: true
}))
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// POST /submit
app.post('/submit', async (req, res) => {
  const { voornaam, achternaam, email, selectie } = req.body;

  if (!Array.isArray(selectie)) {
    return res.status(400).send('Ongeldige selectie');
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
})

// GET /inzendingen
app.get('/inzendingen', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM inzendingen ORDER BY tijdstip DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Kan inzendingen niet ophalen' });
  }
})

app.post('/admin-login', (req, res) => {
  const { password } = req.body;

  if (password === process.env.ADMIN_PASSWORD) {
    res.status(200).json({ success: true });
  } else {
    res.status(401).json({ message: 'Ongeldig wachtwoord' });
  }

  console.log('Ontvangen wachtwoord:', password);
  console.log('Verwacht wachtwoord:', process.env.ADMIN_PASSWORD);
})

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server draait op poort ${PORT}`))