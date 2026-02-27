import { PrismaClient, Priority, WorkspaceRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create demo user
  const passwordHash = await bcrypt.hash('password123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: {
      name: 'Demo User',
      email: 'demo@example.com',
      passwordHash,
      avatar: '',
    },
  });
  console.log(`✅ Created user: ${user.email}`);

  // Create workspace
  const workspace = await prisma.workspace.create({
    data: {
      name: 'My Workspace',
      icon: '🏠',
      color: '#3b82f6',
      members: {
        create: {
          userId: user.id,
          role: WorkspaceRole.owner,
        },
      },
    },
  });
  console.log(`✅ Created workspace: ${workspace.name}`);

  // Create space
  const space = await prisma.space.create({
    data: {
      name: 'Personal Tasks',
      icon: '📋',
      color: '#6366f1',
      workspaceId: workspace.id,
      order: 0,
    },
  });
  console.log(`✅ Created space: ${space.name}`);

  // Create columns
  const columns = await Promise.all([
    prisma.column.create({ data: { name: 'To Do', color: '#6b7280', order: 0, spaceId: space.id } }),
    prisma.column.create({ data: { name: 'In Progress', color: '#3b82f6', order: 1, spaceId: space.id } }),
    prisma.column.create({ data: { name: 'Review', color: '#f59e0b', order: 2, spaceId: space.id } }),
    prisma.column.create({ data: { name: 'Done', color: '#10b981', order: 3, spaceId: space.id } }),
  ]);
  console.log(`✅ Created ${columns.length} columns`);

  // Create sample tasks
  await Promise.all([
    prisma.task.create({
      data: {
        title: 'Research Kanban libraries',
        description: 'Compare dnd-kit with react-beautiful-dnd',
        priority: Priority.high,
        order: 0,
        columnId: columns[0].id,
        tags: ['research'],
      },
    }),
    prisma.task.create({
      data: {
        title: 'Design UI mockups',
        description: 'Create Figma designs for the task board',
        priority: Priority.medium,
        order: 1,
        columnId: columns[0].id,
        dueDate: new Date('2026-03-01'),
        tags: ['design', 'ui'],
      },
    }),
    prisma.task.create({
      data: {
        title: 'Implement drag and drop',
        description: 'Setup dnd-kit context and sortable components',
        priority: Priority.urgent,
        order: 0,
        columnId: columns[1].id,
        tags: ['frontend', 'feature'],
      },
    }),
    prisma.task.create({
      data: {
        title: 'Review PR #42',
        description: 'Check authentication flow implementation',
        priority: Priority.low,
        order: 0,
        columnId: columns[2].id,
        tags: ['review'],
      },
    }),
    prisma.task.create({
      data: {
        title: 'Setup project structure',
        description: 'Initialize React + TypeScript + Tailwind project',
        priority: Priority.medium,
        order: 0,
        columnId: columns[3].id,
        tags: ['setup'],
      },
    }),
  ]);
  console.log('✅ Created sample tasks');
  console.log('\n🎉 Seed completed!');
  console.log('📧 Login: demo@example.com');
  console.log('🔑 Password: password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
