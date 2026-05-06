import { config } from 'dotenv';
config();

import express from 'express';
import submit from './api/submit.js';
import inzendingen from './api/inzendingen.js';
import adminLogin from './api/admin-login.js';
import startlist from './api/startlist.js';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.all('/api/submit', submit);
app.all('/api/inzendingen', inzendingen);
app.all('/api/admin-login', adminLogin);
app.all('/api/startlist', startlist);

app.listen(3001, () => console.log('Dev API: http://localhost:3001/api'));
