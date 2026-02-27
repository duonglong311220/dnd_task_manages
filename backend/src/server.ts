import app from './app';
import { env } from './config/env';
import prisma from './config/prisma';

async function main() {
  // Test DB connection
  await prisma.$connect();
  console.log('✅ Database connected');

  app.listen(env.PORT, () => {
    console.log(`🚀 Server running on http://localhost:${env.PORT}`);
    console.log(`📄 Environment: ${env.NODE_ENV}`);
  });
}

main().catch((err) => {
  console.error('❌ Failed to start server:', err);
  process.exit(1);
});
