require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: { rejectUnauthorized: false }
});

client.connect()
  .then(() => {
    console.log('✅ Connected to production database');
    return client.query(`
      CREATE TABLE IF NOT EXISTS payment_cards (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        bank_name VARCHAR(255) NOT NULL,
        card_number VARCHAR(4) NOT NULL,
        expiry_date VARCHAR(5) NOT NULL,
        ccv VARCHAR(3),
        stripe_payment_method_id VARCHAR(255) UNIQUE NOT NULL,
        is_default BOOLEAN DEFAULT false,
        is_active BOOLEAN DEFAULT true,
        nickname VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `);
  })
  .then(() => {
    console.log('✅ payment_cards table created');
    return client.query('CREATE INDEX IF NOT EXISTS idx_payment_cards_user_id ON payment_cards(user_id);');
  })
  .then(() => {
    console.log('✅ Indexes created');
    console.log('🎉 Setup complete!');
  })
  .catch(err => {
    console.error('❌ Error:', err.message);
  })
  .finally(() => {
    client.end();
  });
