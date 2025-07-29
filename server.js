// server.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public')); // voor de HTML

// Zorg dat CSV-bestand bestaat met headers
const csvPath = path.join(__dirname, 'inzendingen.csv');
if (!fs.existsSync(csvPath)) {
  fs.writeFileSync(csvPath, 'Voornaam,Achternaam,E-mail,Deelnemers\n');
}

// POST route
app.post('/submit', (req, res) => {
  const { voornaam, achternaam, email, deelnemers } = req.body;

  const selectie = Array.isArray(deelnemers) ? deelnemers.join('; ') : deelnemers;
  const record = `${voornaam},${achternaam},${email},"${selectie}"\n`;

  fs.appendFile(csvPath, record, (err) => {
    if (err) {
      console.error('Fout bij opslaan:', err);
      return res.status(500).send('Er is iets misgegaan.');
    }
    res.send('<h2>Dank je! Je selectie is ontvangen.</h2>');
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server draait op http://localhost:${PORT}`);
});
