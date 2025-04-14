import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Ensure the data directory exists
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'shiori.db');
const db = new Database(dbPath);

// Initialize the database with tables if they don't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS itineraries (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS events (
    id TEXT PRIMARY KEY,
    itinerary_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    location TEXT,
    event_date TEXT,
    start_time TEXT,
    end_time TEXT,
    icon TEXT,
    link TEXT,
    order_index INTEGER NOT NULL,
    FOREIGN KEY (itinerary_id) REFERENCES itineraries(id) ON DELETE CASCADE
  );
  
  -- locationカラムが存在しない場合は別のクエリで追加する
`);

export default db;
