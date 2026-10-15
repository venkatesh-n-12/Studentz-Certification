import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing database...');
  await prisma.savedOpportunity.deleteMany();
  await prisma.application.deleteMany();
  await prisma.opportunity.deleteMany();
  await prisma.user.deleteMany();

  console.log('Seeding users...');
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('password123', salt);

  const owner = await prisma.user.create({
    data: {
      name: 'System Owner',
      email: 'venkiuthen@gmail.com',
      passwordHash,
      role: 'OWNER',
      status: 'ACTIVE',
    }
  });

  const admin = await prisma.user.create({
    data: {
      name: 'College Admin',
      email: 'admin@studentzcert.com',
      passwordHash,
      role: 'ADMIN',
      status: 'ACTIVE',
    }
  });

  const student = await prisma.user.create({
    data: {
      name: 'John Student',
      email: 'student@studentzcert.com',
      passwordHash,
      role: 'STUDENT',
      status: 'ACTIVE',
    }
  });

  console.log('Seeding opportunities...');
  const now = new Date();
  
  const nextWeek = new Date(now);
  nextWeek.setDate(now.getDate() + 7);

  const nextMonth = new Date(now);
  nextMonth.setMonth(now.getMonth() + 1);

  await prisma.opportunity.createMany({
    data: [
      {
        title: 'Global Hackathon 2026',
        organization: 'Tech Innovators',
        category: 'HACKATHON',
        description: 'Join the biggest virtual hackathon of the year and win amazing prizes.',
        requirements: ['Basic programming', 'Team of 4 max'],
        benefits: ['Prizes worth $10000', 'Swag'],
        startDate: nextWeek,
        endDate: nextMonth,
        applicationDeadline: nextWeek,
        mode: 'ONLINE',
        price: 0,
        paymentType: 'FREE',
        createdById: admin.id,
      },
      {
        title: 'Software Engineering Intern',
        organization: 'StartupX',
        category: 'INTERNSHIP',
        description: 'Paid summer internship for pre-final year students.',
        requirements: ['React', 'Node.js'],
        benefits: ['Stipend', 'Pre-placement offer'],
        startDate: nextMonth,
        applicationDeadline: nextWeek,
        mode: 'HYBRID',
        location: 'Bangalore, India',
        paymentType: 'STIPEND',
        createdById: owner.id,
      },
      {
        title: 'AWS Cloud Practitioner Certification',
        organization: 'AWS Academy',
        category: 'CERTIFICATION',
        description: 'Complete guide to AWS Cloud Practitioner exam.',
        requirements: ['None'],
        benefits: ['Global Certification'],
        startDate: now,
        applicationDeadline: nextMonth,
        mode: 'ONLINE',
        price: 100,
        paymentType: 'PAID',
        certificateAvailable: true,
        createdById: admin.id,
      }
    ]
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
