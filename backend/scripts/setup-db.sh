#!/bin/bash

# Script tự động setup database PostgreSQL
echo "🔧 Setting up database..."

# Đọc .env
if [ -f ".env" ]; then
  export $(grep -v '^#' .env | xargs)
fi

# Parse DATABASE_URL để lấy thông tin kết nối
# Format: postgresql://user:password@host:port/dbname?schema=public
DB_URL="${DATABASE_URL}"
DB_USER=$(echo $DB_URL | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p')
DB_PASS=$(echo $DB_URL | sed -n 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/p')
DB_HOST=$(echo $DB_URL | sed -n 's/.*@\([^:]*\):.*/\1/p')
DB_PORT=$(echo $DB_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
DB_NAME=$(echo $DB_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')

echo "📋 Database info:"
echo "  Host: $DB_HOST:$DB_PORT"
echo "  User: $DB_USER"
echo "  Database: $DB_NAME"
echo ""

# Tạo database nếu chưa tồn tại
echo "📦 Creating database '$DB_NAME' if not exists..."
PGPASSWORD=$DB_PASS psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -tc "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'" | grep -q 1 || \
PGPASSWORD=$DB_PASS psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -c "CREATE DATABASE $DB_NAME"

if [ $? -eq 0 ]; then
  echo "✅ Database ready!"
else
  echo "❌ Failed to create database. Check your PostgreSQL credentials in .env"
  echo ""
  echo "📝 Try manually:"
  echo "   psql -U postgres"
  echo "   CREATE DATABASE $DB_NAME;"
  exit 1
fi

echo ""
echo "🔄 Running Prisma migrations..."
npx prisma migrate dev --name init

echo ""
echo "🌱 Seeding database..."
npm run db:seed

echo ""
echo "🎉 Setup complete!"
echo "📧 Login: demo@example.com"
echo "🔑 Password: password123"
