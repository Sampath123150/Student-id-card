const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'idcarddb',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432,
});

const initializeDB = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS students (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        roll_no VARCHAR(50) UNIQUE NOT NULL,
        class_name VARCHAR(100) NOT NULL,
        department VARCHAR(100) NOT NULL,
        institution_type VARCHAR(50) NOT NULL,
        photo_url VARCHAR(500) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Database initialized successfully.");
  } catch (error) {
    console.error("Error initializing the database:", error);
  }
};

module.exports = {
  pool,
  initializeDB,
};
