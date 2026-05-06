import pool from './_db.js';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

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

    try {
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL,
        to: email,
        subject: "Bevestiging selectie Giro d'Italia 2026",
        html: buildEmail(voornaam, rider_names),
      });
    } catch (emailErr) {
      console.error('E-mail kon niet worden verstuurd:', emailErr);
    }

    res.status(200).json({ message: 'Inzending opgeslagen' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Databasefout' });
  }
}

function buildEmail(voornaam, riderNames) {
  const riders = riderNames.map(name => `<li style="margin:4px 0">${name}</li>`).join('');
  return `
    <p>Hallo ${voornaam},</p>
    <p>Je selectie voor de <strong>Giro d'Italia 2026</strong> is goed ontvangen!</p>
    <p><strong>Jouw renners:</strong></p>
    <ul>${riders}</ul>
    <p>Succes en veel plezier!</p>
  `;
}
