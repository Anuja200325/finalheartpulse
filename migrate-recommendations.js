import pg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const { Pool } = pg;
dotenv.config();

async function migrateRecommendations() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });

  try {
    console.log('Starting migration...');
    
    // Begin transaction
    await pool.query('BEGIN');
    
    // Drop the existing health_recommendations table
    console.log('Dropping health_recommendations table...');
    await pool.query('DROP TABLE IF EXISTS health_recommendations');
    
    // Create the table with the new schema
    console.log('Creating health_recommendations table with new schema...');
    await pool.query(`
      CREATE TABLE health_recommendations (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        category TEXT NOT NULL,
        severity TEXT NOT NULL,
        read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
      )
    `);
    
    // Seed initial data
    console.log('Seeding initial recommendations...');
    
    await pool.query(`
      INSERT INTO health_recommendations (user_id, title, description, category, severity)
      VALUES
        (1, 'Heart Rate Alert', 'Your heart rate has been slightly elevated. Consider some relaxation techniques.', 'heart', 'moderate'),
        (1, 'Oxygen Level Status', 'Great oxygen levels! Keep up the good work.', 'oxygen', 'low'),
        (1, 'Blood Pressure Update', 'Your blood pressure is within normal range. Maintain your healthy lifestyle.', 'blood-pressure', 'low')
    `);
    
    // Commit the transaction
    await pool.query('COMMIT');
    
    console.log('Migration completed successfully!');
  } catch (err) {
    // Rollback in case of error
    await pool.query('ROLLBACK');
    console.error('Error during migration:', err);
  } finally {
    // Release the pool
    await pool.end();
  }
}

migrateRecommendations().catch(console.error);