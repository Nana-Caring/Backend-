// Simple production database connection test
require('dotenv').config();
const { Pool } = require('pg');

async function testConnection() {
  console.log('🔗 Testing production database connection...');
  
  const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    const client = await pool.connect();
    console.log('✅ Connected successfully!');
    
    // Test query
    const result = await client.query('SELECT NOW() as current_time');
    console.log('⏰ Current database time:', result.rows[0].current_time);
    
    // Check if payment_cards table exists
    const tableExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'payment_cards'
      );
    `);
    
    console.log('📋 payment_cards table exists:', tableExists.rows[0].exists);
    
    if (!tableExists.rows[0].exists) {
      console.log('\n🛠️  Creating payment_cards table...');
      
      await client.query(`
        CREATE TABLE payment_cards (
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
      
      console.log('✅ payment_cards table created!');
      
      // Create indexes
      await client.query('CREATE INDEX idx_payment_cards_user_id ON payment_cards(user_id);');
      await client.query('CREATE INDEX idx_payment_cards_stripe_payment_method_id ON payment_cards(stripe_payment_method_id);');
      console.log('✅ Indexes created!');
    }
    
    client.release();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

testConnection();
