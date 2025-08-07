import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  password: process.env.ADMIN_PASSWORD,
  port: process.env.DB_PORT,
  ssl: { rejectUnauthorized: false } // Render vereist SSL
})

export default pool;
