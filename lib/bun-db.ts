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
    created_at INTEGER NOT NULL,
    totalBudget REAL,
    currency TEXT DEFAULT 'JPY'
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
  
  CREATE TABLE IF NOT EXISTS packing_items (
    id TEXT PRIMARY KEY,
    itinerary_id TEXT NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    is_packed BOOLEAN NOT NULL DEFAULT 0,
    quantity INTEGER NOT NULL DEFAULT 1,
    notes TEXT,
    is_essential BOOLEAN NOT NULL DEFAULT 0,
    order_index INTEGER NOT NULL,
    FOREIGN KEY (itinerary_id) REFERENCES itineraries(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS budgets (
    id TEXT PRIMARY KEY,
    itinerary_id TEXT NOT NULL,
    category TEXT NOT NULL,
    name TEXT NOT NULL,
    amount REAL NOT NULL,
    notes TEXT,
    event_id TEXT,
    order_index INTEGER NOT NULL,
    FOREIGN KEY (itinerary_id) REFERENCES itineraries(id) ON DELETE CASCADE,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS expenses (
    id TEXT PRIMARY KEY,
    budget_id TEXT NOT NULL,
    itinerary_id TEXT NOT NULL,
    date TEXT NOT NULL,
    amount REAL NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    payment_method TEXT,
    receipt_image TEXT,
    created_at INTEGER NOT NULL,
    FOREIGN KEY (budget_id) REFERENCES budgets(id) ON DELETE CASCADE,
    FOREIGN KEY (itinerary_id) REFERENCES itineraries(id) ON DELETE CASCADE
  );
  
  CREATE TABLE IF NOT EXISTS reservations (
    id TEXT PRIMARY KEY,
    event_id TEXT NOT NULL,
    itinerary_id TEXT NOT NULL,
    type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'notBooked',
    confirmation_number TEXT,
    provider TEXT,
    booking_date TEXT,
    price REAL,
    currency TEXT,
    notes TEXT,
    contact_info TEXT,
    attachment_urls TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
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
      run: (...params: unknown[]) => stmt.run(...params),
      get: (...params: unknown[]) => stmt.get(...params),
      all: (...params: unknown[]) => stmt.all(...params),
    };
  },
  exec: (sql: string) => db.exec(sql),
  // Add transaction support
  transaction<T>(fn: () => T): T {
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
