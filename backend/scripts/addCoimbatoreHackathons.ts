import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Find the owner/admin user to attach as creator
  let creator = await prisma.user.findFirst({
    where: { role: { in: ['OWNER', 'ADMIN'] } },
    orderBy: { createdAt: 'asc' },
  });

  if (!creator) {
    console.error('❌ No OWNER or ADMIN user found. Please seed users first.');
    process.exit(1);
  }

  console.log(`✅ Using creator: ${creator.name} (${creator.email})`);

  const hackathons = [
    {
      title: "Hack It On '26",
      organization: 'KPR Institute of Engineering and Technology',
      category: 'Hackathons',
      subCategory: 'College Hackathon',
      description:
        "Hack It On is KPR Institute's flagship annual hackathon held in Coimbatore. Students across disciplines compete to build innovative tech solutions in 24 hours. Open to all streams — CS, IT, ECE, and more. Form a team and hack your way to glory!",
      requirements: [
        'Team of 2–4 students',
        'Laptop with development environment',
        'Valid college ID card',
        'Problem statement selection before event',
      ],
      benefits: [
        'Cash prizes worth ₹1,00,000+',
        'Certificates for all participants',
        'Networking with industry mentors',
        'Featured on KPRIET official website',
      ],
      startDate: new Date('2026-11-14T09:00:00+05:30'),
      endDate: new Date('2026-11-15T09:00:00+05:30'),
      applicationDeadline: new Date('2026-11-05T23:59:00+05:30'),
      duration: '24 hours',
      mode: 'Offline',
      location: 'KPR Institute of Engineering and Technology, Coimbatore, Tamil Nadu',
      registrationUrl: 'https://unstop.com',
      price: 0,
      paymentType: 'Free',
      certificateAvailable: true,
      spots: 200,
      createdById: creator.id,
    },
    {
      title: 'National Level AI Hackathon – Horizon 2026',
      organization: 'KPR Institute of Engineering and Technology',
      category: 'Hackathons',
      subCategory: 'AI / ML Hackathon',
      description:
        'Horizon is a national-level AI & Machine Learning hackathon organised by KPRIET, Coimbatore. Participants solve real-world problems using AI, ML, and Data Science. This is one of the most prestigious student hackathons in Tamil Nadu, attracting teams from colleges across India.',
      requirements: [
        'Team of 2–4 members',
        'Knowledge of Python / AI / ML preferred',
        'Laptop and internet access',
        'Pre-submission of abstract before the event',
      ],
      benefits: [
        'Winner prize of ₹50,000',
        'Runner-up ₹25,000',
        'Best use of AI award ₹10,000',
        'E-certificates for all participants',
        'Mentoring from AI industry experts',
      ],
      startDate: new Date('2026-12-06T09:00:00+05:30'),
      endDate: new Date('2026-12-07T09:00:00+05:30'),
      applicationDeadline: new Date('2026-11-25T23:59:00+05:30'),
      duration: '24 hours',
      mode: 'Offline',
      location: 'KPR Institute of Engineering and Technology, Coimbatore – 641 407',
      registrationUrl: 'https://kpriet.ac.in',
      price: 0,
      paymentType: 'Free',
      certificateAvailable: true,
      spots: 300,
      createdById: creator.id,
    },
    {
      title: 'U & ME Hackathon',
      organization: 'Coimbatore Institute of Technology (CIT)',
      category: 'Hackathons',
      subCategory: 'Open Innovation',
      description:
        "U & ME Hackathon is an open-innovation event hosted by CIT Coimbatore. It focuses on collaboration between students from different backgrounds — engineering, design, and management — to co-create solutions for societal problems. The event is known for its inclusive culture and strong problem-statement diversity.",
      requirements: [
        'Inter-disciplinary team of 3–5 members',
        'At least one non-CS/IT member preferred',
        'Problem domain selection at registration',
        'Prototype/MVP to be presented at the finale',
      ],
      benefits: [
        'Cash prizes up to ₹75,000',
        'Certificates of participation and achievement',
        'Incubation support for top ideas',
        'Exposure to CIT startup ecosystem',
      ],
      startDate: new Date('2026-11-22T10:00:00+05:30'),
      endDate: new Date('2026-11-23T10:00:00+05:30'),
      applicationDeadline: new Date('2026-11-10T23:59:00+05:30'),
      duration: '24 hours',
      mode: 'Offline',
      location: 'Coimbatore Institute of Technology, Civil Aerodrome Post, Coimbatore – 641 014',
      registrationUrl: 'https://unstop.com',
      price: 0,
      paymentType: 'Free',
      certificateAvailable: true,
      spots: 150,
      createdById: creator.id,
    },
    {
      title: 'TNWISE Hackathon 2026',
      organization: 'TANCAM × Kalaignar Karunanidhi Institute of Technology (KIT)',
      category: 'Hackathons',
      subCategory: 'Government / State-Level',
      description:
        "TNWISE (Tamil Nadu Women in Science and Engineering) Hackathon is a government-backed event organised by TANCAM in association with KIT Coimbatore. It aims to promote women in STEM by creating a platform for innovation. Open to all students, but encourages women-led teams. Solve real state-level challenges in healthcare, agriculture, and smart cities.",
      requirements: [
        'Team of 2–4 students',
        'Women-led teams given priority in judging',
        'Problem statement based on Tamil Nadu state challenges',
        'Abstract submission required at registration',
      ],
      benefits: [
        'State-level recognition and trophies',
        'Cash prizes up to ₹2,00,000 total pool',
        'TANCAM certificate of excellence',
        'Opportunity to pitch to StartupTN incubators',
        'Mentors from government and industry',
      ],
      startDate: new Date('2026-12-13T09:00:00+05:30'),
      endDate: new Date('2026-12-14T17:00:00+05:30'),
      applicationDeadline: new Date('2026-11-30T23:59:00+05:30'),
      duration: '32 hours',
      mode: 'Offline',
      location: 'Kalaignar Karunanidhi Institute of Technology (KIT), Coimbatore – 641 402',
      registrationUrl: 'https://tancam.in',
      price: 0,
      paymentType: 'Free',
      certificateAvailable: true,
      spots: 250,
      createdById: creator.id,
    },
    {
      title: 'IDEA Hackathon 2026',
      organization: 'Dr. Mahalingam College of Engineering and Technology (MCET)',
      category: 'Hackathons',
      subCategory: 'Innovation & Entrepreneurship',
      description:
        'IDEA Hackathon by MCET Pollachi (Coimbatore district) is an innovation-driven hackathon focused on entrepreneurship and sustainable development. Participants are challenged to propose and prototype solutions to local and global SDG challenges. Mentors from the industry guide teams throughout the event.',
      requirements: [
        'Team of 2–5 members',
        'Ideation deck to be submitted before the event',
        'Working prototype preferred at finale',
        'Open to all engineering and arts students',
      ],
      benefits: [
        'Winner takes ₹30,000 cash prize',
        'Best Innovation Award ₹15,000',
        'Participation certificates',
        'Incubation referral letter from MCET',
        'Media coverage in local press',
      ],
      startDate: new Date('2026-11-29T09:00:00+05:30'),
      endDate: new Date('2026-11-30T09:00:00+05:30'),
      applicationDeadline: new Date('2026-11-18T23:59:00+05:30'),
      duration: '24 hours',
      mode: 'Offline',
      location: 'Dr. Mahalingam College of Engineering and Technology, Pollachi, Coimbatore District – 642 003',
      registrationUrl: 'https://drmcet.ac.in',
      price: 0,
      paymentType: 'Free',
      certificateAvailable: true,
      spots: 120,
      createdById: creator.id,
    },
  ];

  console.log(`\n🚀 Inserting ${hackathons.length} Coimbatore hackathons...\n`);

  for (const hackathon of hackathons) {
    const created = await prisma.opportunity.create({ data: hackathon });
    console.log(`  ✅ Added: "${created.title}" by ${created.organization}`);
  }

  console.log('\n🎉 All Coimbatore hackathons added successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
