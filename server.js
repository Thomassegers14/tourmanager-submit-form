import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// PostgreSQL client setup
const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } // verplicht op Render
});

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Init tabel als die nog niet bestaat
const initDB = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS inzendingen (
      id SERIAL PRIMARY KEY,
      voornaam TEXT NOT NULL,
      achternaam TEXT NOT NULL,
      email TEXT NOT NULL,
      deelnemers TEXT NOT NULL,
      tijdstip TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
};

initDB();

// POST route
app.post('/submit', async (req, res) => {
  const { voornaam, achternaam, email } = req.body;
  let deelnemers = req.body.deelnemers;

  if (!Array.isArray(deelnemers)) {
    deelnemers = [deelnemers];
  }

  const deelnemersStr = deelnemers.join('; ');

  try {
    await pool.query(
      'INSERT INTO inzendingen (voornaam, achternaam, email, deelnemers) VALUES ($1, $2, $3, $4)',
      [voornaam, achternaam, email, deelnemersStr]
    );
    res.send('<h2>Bedankt! Je inzending is opgeslagen.</h2>');
  } catch (err) {
    console.error(err);
    res.status(500).send('Er is een fout opgetreden bij het opslaan.');
  }
});

app.listen(PORT, () => {
  console.log(`Server draait op http://localhost:${PORT}`);
});