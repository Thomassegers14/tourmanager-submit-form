import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// nodig voor ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const csvPath = path.join(__dirname, 'inzendingen.csv');

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Init CSV bestand
if (!fs.existsSync(csvPath)) {
  fs.writeFileSync(csvPath, 'Voornaam,Achternaam,E-mail,Deelnemers\n');
}

// Ontvang formulier
app.post('/submit', (req, res) => {
  const { voornaam, achternaam, email } = req.body;
  let deelnemers = req.body.deelnemers;

  if (!Array.isArray(deelnemers)) {
    deelnemers = [deelnemers]; // voor 1 selectie
  }

  const rij = `${voornaam},${achternaam},${email},"${deelnemers.join('; ')}"\n`;
  fs.appendFileSync(csvPath, rij);
  res.send('<h2>Bedankt! Je inzending is opgeslagen.</h2>');
});

app.listen(PORT, () => {
  console.log(`Server draait op http://localhost:${PORT}`);
});
