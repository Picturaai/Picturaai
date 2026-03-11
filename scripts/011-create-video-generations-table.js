// Migration: Create video_generations table for tracking video generation usage
import { neon } from '@neondatabase/serverless'
import 'dotenv/config'

const sql = neon(process.env.DATABASE_URL!)

async function createVideoGenerationsTable() {
  console.log('Creating video_generations table...')
  
  try {
    // Create the video_generations table
    await sql`
      CREATE TABLE IF NOT EXISTS video_generations (
        id SERIAL PRIMARY KEY,
        developer_id VARCHAR(64) NOT NULL,
        prompt TEXT NOT NULL,
        video_url TEXT NOT NULL,
        model VARCHAR(128) NOT NULL DEFAULT 'replicate',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `
    console.log('✅ video_generations table created successfully')
    
    // Add index for faster queries
    await sql`
      CREATE INDEX IF NOT EXISTS idx_video_generations_developer_date 
      ON video_generations(developer_id, created_at)
    `
    console.log('✅ Index created successfully')
    
  } catch (error) {
    console.error('❌ Error creating table:', error)
    process.exit(1)
  }
  
  console.log('✅ Migration completed!')
  process.exit(0)
}

createVideoGenerationsTable()
