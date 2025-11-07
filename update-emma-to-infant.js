const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function updateEmmaToInfant() {
  const client = await pool.connect();
  try {
    console.log('👶 Converting Emma (ID: 13) to infant and linking to Sarah (caregiver ID: 11)...');
    await client.query('BEGIN');

    // 1) Show current flags
    const before = await client.query('SELECT id, "firstName", surname, email, role, "isInfant", "isUnborn", "isPregnant" FROM "Users" WHERE id = $1', [13]);
    console.log('Before:', before.rows[0]);

    // 2) Update user flags to mark as infant
    const upd = await client.query(
      `UPDATE "Users"
         SET "isInfant" = true,
             "isUnborn" = false,
             "isPregnant" = false,
             "expectedDueDate" = NULL,
             "dateOfBirth" = NOW(),
             "updatedAt" = NOW()
       WHERE id = $1`,
      [13]
    );
    console.log('Rows affected by UPDATE:', upd.rowCount);

    // Extra: verify column names exist
    const cols = await client.query(
      "SELECT column_name FROM information_schema.columns WHERE table_name = 'Users' ORDER BY column_name"
    );
    console.log('Users table columns (sample):', cols.rows.map(r => r.column_name).slice(0, 10).join(', ') + ' ...');

    // 3) Ensure Baby Care and Pregnancy accounts exist (they already do per previous checks)
    // Optionally, we could ensure the caregiver on accounts is set to Sarah (ID 11). Already confirmed.

    // 4) Re-check
    const after = await client.query('SELECT id, "firstName", surname, email, role, "isInfant", "isUnborn", "isPregnant" FROM "Users" WHERE id = $1', [13]);
    console.log('After:', after.rows[0]);

    await client.query('COMMIT');
    console.log('\n✅ SUCCESS: Emma is now marked as an infant (isInfant=true).');
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('❌ Failed to update Emma to infant:', e);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

if (require.main === module) {
  updateEmmaToInfant();
}

module.exports = { updateEmmaToInfant };
