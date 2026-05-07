import sqlite3 from 'sqlite3';
import path from 'path';

const dbPath = path.join(__dirname, '../../database/inventory.db');

let db: sqlite3.Database;

export async function initializeDatabase(): Promise<void> {
  return new Promise((resolve, reject) => {
    db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        reject(err);
      } else {
        createTables().then(resolve).catch(reject);
      }
    });
  });
}

async function createTables(): Promise<void> {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Products table
      db.run(`
        CREATE TABLE IF NOT EXISTS products (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          category TEXT NOT NULL,
          description TEXT,
          unit_price REAL NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err && !err.message.includes('already exists')) reject(err);
      });

      // Stock table
      db.run(`
        CREATE TABLE IF NOT EXISTS stock (
          id TEXT PRIMARY KEY,
          product_id TEXT NOT NULL,
          quantity INTEGER NOT NULL DEFAULT 0,
          warehouse_location TEXT,
          last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (product_id) REFERENCES products(id)
        )
      `, (err) => {
        if (err && !err.message.includes('already exists')) reject(err);
      });

      // Orders table
      db.run(`
        CREATE TABLE IF NOT EXISTS orders (
          id TEXT PRIMARY KEY,
          order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
          status TEXT NOT NULL,
          total_amount REAL NOT NULL,
          notes TEXT
        )
      `, (err) => {
        if (err && !err.message.includes('already exists')) reject(err);
      });

      // Order items table
      db.run(`
        CREATE TABLE IF NOT EXISTS order_items (
          id TEXT PRIMARY KEY,
          order_id TEXT NOT NULL,
          product_id TEXT NOT NULL,
          quantity INTEGER NOT NULL,
          unit_price REAL NOT NULL,
          FOREIGN KEY (order_id) REFERENCES orders(id),
          FOREIGN KEY (product_id) REFERENCES products(id)
        )
      `, (err) => {
        if (err && !err.message.includes('already exists')) reject(err);
        else resolve();
      });
    });
  });
}

export function getDatabase(): sqlite3.Database {
  return db;
}
