import { Database } from 'bun:sqlite';
import path from 'path';
import fs from 'fs';

// Ensure the data directory exists
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'shiori.db');

// Use Bun's built-in SQLite support
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
`);

// Enable WAL mode for better performance
db.exec('PRAGMA journal_mode = WAL;');

// Enable foreign keys
db.exec('PRAGMA foreign_keys = ON;');

// Create wrapper functions to maintain API compatibility with better-sqlite3
const wrapperDb = {
  prepare: (sql: string) => {
    const stmt = db.prepare(sql);
    return {
      run: (...params: any[]) => stmt.run(...params),
      get: (...params: any[]) => stmt.get(...params),
      all: (...params: any[]) => stmt.all(...params),
    };
  },
  exec: (sql: string) => db.exec(sql),
  // Add transaction support
  transaction: (fn: Function) => {
    db.exec('BEGIN TRANSACTION;');
    try {
      const result = fn();
      db.exec('COMMIT;');
      return result;
    } catch (error) {
      db.exec('ROLLBACK;');
      throw error;
    }
  }
};

export default wrapperDb;
