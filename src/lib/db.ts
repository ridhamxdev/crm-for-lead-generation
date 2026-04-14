import { createClient, type Client } from '@libsql/client';
import path from 'path';
import fs from 'fs';

let _client: Client | null = null;
let _initPromise: Promise<void> | null = null;

function createDbClient(): Client {
  const tursoUrl = process.env.TURSO_DATABASE_URL;
  const tursoToken = process.env.TURSO_AUTH_TOKEN;

  // Production: use Turso cloud SQLite
  if (tursoUrl) {
    return createClient({ url: tursoUrl, authToken: tursoToken ?? undefined });
  }

  // Development: use local SQLite file
  const DB_DIR = path.join(process.cwd(), 'data');
  const DB_PATH = path.join(DB_DIR, 'crm.db');
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
  return createClient({ url: `file:${DB_PATH}` });
}

async function initializeSchema(client: Client): Promise<void> {
  // First, create users table if it doesn't exist
  await client.execute({
    sql: `CREATE TABLE IF NOT EXISTS users (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      name         TEXT NOT NULL,
      email        TEXT NOT NULL UNIQUE,
      password     TEXT NOT NULL,
      created_at   TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now', 'localtime'))
    )`,
    args: [],
  });

  // Check if leads table exists
  const tableCheckResult = await client.execute({
    sql: `SELECT name FROM sqlite_master WHERE type='table' AND name='leads'`,
    args: [],
  });

  if (tableCheckResult.rows.length === 0) {
    // Table doesn't exist, create it with user_id
    await client.execute({
      sql: `CREATE TABLE leads (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id     INTEGER NOT NULL,
        name        TEXT NOT NULL,
        phone       TEXT NOT NULL,
        email       TEXT,
        source      TEXT NOT NULL DEFAULT 'other',
        status      TEXT NOT NULL DEFAULT 'new',
        order_value REAL,
        notes       TEXT,
        address     TEXT,
        created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now', 'localtime')),
        updated_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now', 'localtime')),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )`,
      args: [],
    });
  } else {
    // Table exists, check if user_id column exists
    const columnsResult = await client.execute({
      sql: `PRAGMA table_info(leads)`,
      args: [],
    });

    const hasUserIdColumn = (columnsResult.rows as unknown as Array<{ name: string }>).some(
      (col) => col.name === 'user_id',
    );

    if (!hasUserIdColumn) {
      // Need to migrate the table
      await client.batch(
        [
          // Create a temporary table with the new schema
          {
            sql: `CREATE TABLE leads_new (
              id          INTEGER PRIMARY KEY AUTOINCREMENT,
              user_id     INTEGER NOT NULL DEFAULT 1,
              name        TEXT NOT NULL,
              phone       TEXT NOT NULL,
              email       TEXT,
              source      TEXT NOT NULL DEFAULT 'other',
              status      TEXT NOT NULL DEFAULT 'new',
              order_value REAL,
              notes       TEXT,
              address     TEXT,
              created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now', 'localtime')),
              updated_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now', 'localtime')),
              FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )`,
            args: [],
          },
          // Copy data from old table to new table
          {
            sql: `INSERT INTO leads_new (id, user_id, name, phone, email, source, status, order_value, notes, address, created_at, updated_at)
                  SELECT id, 1, name, phone, email, source, status, order_value, notes, address, created_at, updated_at FROM leads`,
            args: [],
          },
          // Drop old table
          {
            sql: `DROP TABLE leads`,
            args: [],
          },
          // Rename new table
          {
            sql: `ALTER TABLE leads_new RENAME TO leads`,
            args: [],
          },
        ],
        'write',
      );
    }
  }

  // Create trigger for updated_at if it doesn't exist
  await client.execute({
    sql: `CREATE TRIGGER IF NOT EXISTS trg_leads_updated_at
          AFTER UPDATE ON leads FOR EACH ROW
          BEGIN
            UPDATE leads
            SET updated_at = strftime('%Y-%m-%d %H:%M:%S', 'now', 'localtime')
            WHERE id = NEW.id;
          END`,
    args: [],
  });
}

export async function getDb(): Promise<Client> {
  if (!_client) {
    _client = createDbClient();
  }
  if (!_initPromise) {
    _initPromise = initializeSchema(_client);
  }
  await _initPromise;
  return _client;
}

export default getDb;
