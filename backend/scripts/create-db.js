/**
 * Script tạo database PostgreSQL nếu chưa tồn tại
 * Chạy: node scripts/create-db.js
 */

require('dotenv').config();

const { Client } = require('pg');

async function createDatabase() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('❌ DATABASE_URL not found in .env');
    process.exit(1);
  }

  // Parse URL để lấy tên database
  const match = dbUrl.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/([^?]+)/);
  if (!match) {
    console.error('❌ Invalid DATABASE_URL format');
    process.exit(1);
  }

  const [, user, password, host, port, dbName] = match;

  console.log(`📋 Connecting to PostgreSQL at ${host}:${port} as '${user}'...`);

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
    console.log('✅ Connected to PostgreSQL!');

    // Kiểm tra database đã tồn tại chưa
    const result = await client.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [dbName]
    );

    if (result.rowCount > 0) {
      console.log(`✅ Database '${dbName}' already exists.`);
    } else {
      await client.query(`CREATE DATABASE "${dbName}"`);
      console.log(`✅ Database '${dbName}' created successfully!`);
    }
  } catch (err) {
    console.error('❌ Error:', err.message);
    console.error('');
    console.error('💡 Hãy kiểm tra lại .env file:');
    console.error(`   DATABASE_URL="${dbUrl}"`);
    console.error('');
    console.error('💡 Đảm bảo PostgreSQL đang chạy:');
    console.error('   macOS: brew services start postgresql@16');
    console.error('   Linux: sudo service postgresql start');
    console.error('');
    console.error('💡 Tạo database thủ công:');
    console.error(`   psql -U ${user} -c "CREATE DATABASE ${dbName}"`);
    process.exit(1);
  } finally {
    await client.end();
  }
}

createDatabase();
