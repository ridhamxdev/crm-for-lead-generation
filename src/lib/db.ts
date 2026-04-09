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
  await client.batch(
    [
      {
        sql: `CREATE TABLE IF NOT EXISTS leads (
          id          INTEGER PRIMARY KEY AUTOINCREMENT,
          name        TEXT NOT NULL,
          phone       TEXT NOT NULL,
          email       TEXT,
          source      TEXT NOT NULL DEFAULT 'other',
          status      TEXT NOT NULL DEFAULT 'new',
          order_value REAL,
          notes       TEXT,
          address     TEXT,
          created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now', 'localtime')),
          updated_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now', 'localtime'))
        )`,
        args: [],
      },
      {
        sql: `CREATE TRIGGER IF NOT EXISTS trg_leads_updated_at
              AFTER UPDATE ON leads FOR EACH ROW
              BEGIN
                UPDATE leads
                SET updated_at = strftime('%Y-%m-%d %H:%M:%S', 'now', 'localtime')
                WHERE id = NEW.id;
              END`,
        args: [],
      },
    ],
    'write',
  );
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
