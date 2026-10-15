import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const existingUser = await prisma.user.findUnique({
    where: { email: 'venkiuthen@gmail.com' }
  });

  if (!existingUser) {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);
    await prisma.user.create({
      data: {
        name: 'System Owner',
        email: 'venkiuthen@gmail.com',
        passwordHash,
        role: 'OWNER',
        status: 'ACTIVE',
      }
    });
    console.log('Created new owner venkiuthen@gmail.com');
  } else {
    await prisma.user.update({
      where: { email: 'venkiuthen@gmail.com' },
      data: { role: 'OWNER' }
    });
    console.log('Ensured venkiuthen@gmail.com is OWNER');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
