require('dotenv').config();

const { Client } = require('pg');

async function createDatabase() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    process.exit(1);
  }

  const match = dbUrl.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/([^?]+)/);
  if (!match) {
    process.exit(1);
  }

  const [, user, password, host, port, dbName] = match;

  // Kết nối tới database 'postgres' mặc định để tạo database mới
  const client = new Client({
    host,
    port: Number(port),
    user,
    password,
    database: 'postgres', // kết nối tới postgres default trước
  });

  try {
    await client.connect();
    const result = await client.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [dbName]
    );

    if (result.rowCount > 0) {
      console.log(`Database '${dbName}' already exists.`);
    } else {
      await client.query(`CREATE DATABASE "${dbName}"`);
      console.log(`Database '${dbName}' created successfully!`);
    }
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

createDatabase();
