import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting complete opportunities seed...');

  // Ensure owner or admin user exists
  let creator = await prisma.user.findFirst({
    where: { role: { in: ['OWNER', 'ADMIN'] } },
    orderBy: { createdAt: 'asc' },
  });

  if (!creator) {
    console.log('No creator found, finding any user...');
    creator = await prisma.user.findFirst();
  }

  if (!creator) {
    console.error('❌ No user found. Please run user seed first.');
    process.exit(1);
  }

  console.log(`✅ Using creator: ${creator.name} (${creator.email})`);

  // Remove old hackathons containing Coimbatore/Tamil Nadu
  const deletedOld = await prisma.opportunity.deleteMany({
    where: {
      OR: [
        { location: { contains: 'Coimbatore', mode: 'insensitive' } },
        { location: { contains: 'Tamil Nadu', mode: 'insensitive' } },
        { description: { contains: 'Coimbatore', mode: 'insensitive' } },
        { description: { contains: 'Skill Wiz', mode: 'insensitive' } },
      ]
    }
  });
  console.log(`🧹 Cleaned up ${deletedOld.count} old listings.`);

  const now = new Date();
  
  const inDays = (d: number) => {
    const date = new Date(now);
    date.setDate(date.getDate() + d);
    return date;
  };

  const opportunities = [
    // --- HACKATHONS ---
    {
      title: 'Smart India Hackathon (SIH) 2026',
      organization: 'Ministry of Education & AICTE',
      category: 'HACKATHON',
      subCategory: 'National Open Innovation',
      description: 'World’s biggest open innovation hackathon. Students collaborate across disciplines to solve pressing real-world challenges posed by ministries, departments, and leading tech companies.',
      requirements: ['Team of 6 students (at least 1 female teammate mandatory)', 'Valid College ID Card', 'Presentation & Prototype submission'],
      benefits: ['₹1,00,000 Cash Prize per problem statement', 'Direct Mentorship by Central Government Agencies', 'Incubation & Funding Support', 'National Recognition'],
      startDate: inDays(30),
      endDate: inDays(32),
      applicationDeadline: inDays(20),
      duration: '36 Hours',
      mode: 'HYBRID',
      location: 'New Delhi & Designated National Nodal Centers',
      registrationUrl: 'https://sih.gov.in',
      paymentType: 'FREE',
      price: 0,
      certificateAvailable: true,
      spots: 5000,
    },
    {
      title: 'ETHIndia 2026 Web3 Hackathon',
      organization: 'Devfolio & Ethereum Foundation',
      category: 'HACKATHON',
      subCategory: 'Blockchain & Web3',
      description: 'Asia’s largest Ethereum hackathon bringing together thousands of developers, designers, and builders to create decentralized applications, DeFi protocols, and zero-knowledge solutions.',
      requirements: ['Basic Web3 or Solidity knowledge helpful', 'Laptop with development tools', 'Team of 2-4 builders'],
      benefits: ['$50,000+ Total Prize Pool', 'Grants from Top Web3 Foundations', 'Free Hacker Swag & Travel Reimbursements', 'Direct VC & Angel Investor Pitches'],
      startDate: inDays(45),
      endDate: inDays(47),
      applicationDeadline: inDays(25),
      duration: '36 Hours',
      mode: 'HYBRID',
      location: 'KTPO Bangalore & Online',
      registrationUrl: 'https://ethindia.co',
      paymentType: 'FREE',
      price: 0,
      certificateAvailable: true,
      spots: 1500,
    },
    {
      title: 'Google Solution Challenge 2026',
      organization: 'Google Developer Student Clubs (GDSC)',
      category: 'HACKATHON',
      subCategory: 'AI & Social Impact',
      description: 'Invites university students to develop solutions for local community problems using one or more Google technologies, in alignment with the United Nations 17 Sustainable Development Goals.',
      requirements: ['Member of a university Google Developer Student Club', 'Team of 1 to 4 students', 'Uses at least 1 Google technology (Flutter, Firebase, GCP, Gemini)'],
      benefits: ['$3,000 per team member for top finalists', 'Mentorship directly from Google Engineers', 'Global demo day showcase', 'Official Google Swag Packs'],
      startDate: inDays(15),
      endDate: inDays(60),
      applicationDeadline: inDays(10),
      duration: '45 Days',
      mode: 'ONLINE',
      location: 'Global Virtual Event',
      registrationUrl: 'https://developers.google.com/community/gdsc-solution-challenge',
      paymentType: 'FREE',
      price: 0,
      certificateAvailable: true,
      spots: 10000,
    },
    {
      title: 'NASA Space Apps Global Hackathon',
      organization: 'NASA Earth & Space Science Directorate',
      category: 'HACKATHON',
      subCategory: 'Aerospace & Data Science',
      description: 'An international hackathon for coders, scientists, designers, storytellers, makers, and innovators to use NASA’s open space and earth observation data to tackle global challenges.',
      requirements: ['Open to all students and enthusiasts', 'Any technology stack welcome', 'Team submission with video demo'],
      benefits: ['Invitation to a Rocket Launch at Kennedy Space Center for Global Winners', 'NASA Space Apps Official Certificate', 'Access to satellite & geospatial datasets'],
      startDate: inDays(50),
      endDate: inDays(52),
      applicationDeadline: inDays(40),
      duration: '48 Hours',
      mode: 'ONLINE',
      location: 'Worldwide Virtual',
      registrationUrl: 'https://www.spaceappschallenge.org',
      paymentType: 'FREE',
      price: 0,
      certificateAvailable: true,
      spots: 20000,
    },

    // --- INTERNSHIPS ---
    {
      title: 'Frontend Developer Intern (Next.js & React)',
      organization: 'NextGen Tech Labs',
      category: 'INTERNSHIP',
      subCategory: 'Frontend Engineering',
      description: 'Join an agile engineering team building state-of-the-art interactive web platforms. You will develop responsive user interfaces, integrate REST/GraphQL APIs, and write clean, typed code.',
      requirements: ['Proficiency with TypeScript, React, and Next.js', 'Experience with Tailwind CSS', 'Available for full-time 3-month internship'],
      benefits: ['₹25,000/month Monthly Stipend', 'Pre-Placement Offer (PPO) for top performers', 'Flexible remote work hours', '1-on-1 Senior Staff Mentorship'],
      startDate: inDays(14),
      endDate: inDays(104),
      applicationDeadline: inDays(7),
      duration: '3 Months',
      mode: 'ONLINE',
      location: 'Remote (Pan India)',
      registrationUrl: 'https://example.com/careers/frontend-intern',
      paymentType: 'STIPEND',
      price: 25000,
      certificateAvailable: true,
      spots: 5,
    },
    {
      title: 'AI & Machine Learning Research Intern',
      organization: 'Cognitive Dynamics AI',
      category: 'INTERNSHIP',
      subCategory: 'AI / Deep Learning',
      description: 'Work with research scientists on fine-tuning LLMs, retrieval augmented generation (RAG) pipelines, and multimodal computer vision models deployed at scale.',
      requirements: ['Strong Python foundations (PyTorch, Hugging Face, NumPy)', 'Understanding of Transformers and vector databases', 'Final or pre-final year B.Tech/M.Tech in CS/Data Science'],
      benefits: ['₹35,000/month Stipend', 'Access to multi-GPU computing clusters (A100)', 'Co-authorship on research publications', 'MacBook Pro provided for internship'],
      startDate: inDays(20),
      endDate: inDays(180),
      applicationDeadline: inDays(12),
      duration: '6 Months',
      mode: 'HYBRID',
      location: 'Bangalore, Karnataka (or Remote)',
      registrationUrl: 'https://example.com/careers/ai-intern',
      paymentType: 'STIPEND',
      price: 35000,
      certificateAvailable: true,
      spots: 3,
    },
    {
      title: 'Google Summer of Code (GSoC) Contributor',
      organization: 'Google Open Source Programs Office',
      category: 'INTERNSHIP',
      subCategory: 'Open Source Software',
      description: 'A global, online program focused on bringing new contributors into open source software development. Work with mentors on an open source project over a 12+ week period.',
      requirements: ['Enrolled student or open source beginner (18+)', 'Familiarity with Git and project codebase', 'Detailed project proposal submitted to mentor organization'],
      benefits: ['$1,500 – $3,300 USD Contributor Stipend', 'World-class Open Source credential on your resume', 'Mentorship by senior OSS maintainers', 'Global networking opportunities'],
      startDate: inDays(60),
      endDate: inDays(150),
      applicationDeadline: inDays(30),
      duration: '12 Weeks',
      mode: 'ONLINE',
      location: '100% Remote / Virtual',
      registrationUrl: 'https://summerofcode.withgoogle.com',
      paymentType: 'STIPEND',
      price: 150000,
      certificateAvailable: true,
      spots: 1200,
    },
    {
      title: 'Cloud & DevOps Engineering Intern',
      organization: 'CloudPulse Networks',
      category: 'INTERNSHIP',
      subCategory: 'DevOps & Infrastructure',
      description: 'Learn and implement continuous deployment pipelines, container orchestration with Kubernetes, and infrastructure-as-code with Terraform across AWS and GCP environments.',
      requirements: ['Familiarity with Linux command line and Docker', 'Basic networking understanding (DNS, TCP/IP, VPC)', 'Curiosity about site reliability and automation'],
      benefits: ['₹22,000/month Stipend', 'AWS Cloud Certification Exam Reimbursement', 'Letter of Recommendation from CTO', 'Hands-on production cloud environment experience'],
      startDate: inDays(25),
      endDate: inDays(115),
      applicationDeadline: inDays(14),
      duration: '3 Months',
      mode: 'ONLINE',
      location: 'Remote',
      registrationUrl: 'https://example.com/careers/devops-intern',
      paymentType: 'STIPEND',
      price: 22000,
      certificateAvailable: true,
      spots: 4,
    },

    // --- CERTIFICATIONS ---
    {
      title: 'AWS Certified Cloud Practitioner Bootcamp',
      organization: 'Amazon Web Services Training',
      category: 'CERTIFICATION',
      subCategory: 'Cloud Foundations',
      description: 'Master the fundamentals of the AWS Cloud platform, core architecture, security best practices, and billing. Includes interactive virtual labs and mock exam vouchers.',
      requirements: ['Basic computer science literacy', 'Access to browser and broadband connection'],
      benefits: ['50% AWS Certification Exam Discount Voucher', 'Official AWS Completion Badge for LinkedIn', 'Free $100 AWS Sandbox Credits', 'Comprehensive Practice Exam Simulator'],
      startDate: inDays(7),
      endDate: inDays(37),
      applicationDeadline: inDays(5),
      duration: '4 Weeks',
      mode: 'ONLINE',
      location: 'Self-Paced + Live Q&A',
      registrationUrl: 'https://aws.amazon.com/certification/certified-cloud-practitioner',
      paymentType: 'FREE',
      price: 0,
      certificateAvailable: true,
      spots: 2000,
    },
    {
      title: 'Google Cloud Associate Cloud Engineer Prep',
      organization: 'Google Cloud Skills Boost',
      category: 'CERTIFICATION',
      subCategory: 'Cloud Infrastructure',
      description: 'Comprehensive guided learning path to deploy enterprise applications, monitor operations, and manage enterprise solutions on the Google Cloud Platform.',
      requirements: ['Knowledge of command-line tools and operating systems', 'Basic understanding of database and storage types'],
      benefits: ['Free 30-Day Access to Google Cloud Skills Boost labs', 'Verified Google Cloud Skill Badges', 'Discounted Exam Voucher', 'Curated study guides from Google engineers'],
      startDate: inDays(10),
      endDate: inDays(50),
      applicationDeadline: inDays(8),
      duration: '6 Weeks',
      mode: 'ONLINE',
      location: 'Online Platform',
      registrationUrl: 'https://cloud.google.com/learn/certification/cloud-engineer',
      paymentType: 'FREE',
      price: 0,
      certificateAvailable: true,
      spots: 1500,
    },
    {
      title: 'Meta Professional Front-End Developer Specialization',
      organization: 'Meta & Coursera',
      category: 'CERTIFICATION',
      subCategory: 'Full-Stack Development',
      description: 'Learn modern React, JavaScript algorithms, version control, UX design, and prepare for entry-level front-end developer roles through nine practical project-based courses.',
      requirements: ['No prior degree or experience required', 'Dedication of 5-8 hours per week'],
      benefits: ['Official Meta Professional Certificate', 'Access to Meta Career Programs job board', 'Portfolio of 5 finished frontend projects', 'Free financial aid eligibility via Coursera'],
      startDate: inDays(5),
      endDate: inDays(95),
      applicationDeadline: inDays(4),
      duration: '3 Months',
      mode: 'ONLINE',
      location: 'Coursera Virtual Classroom',
      registrationUrl: 'https://www.coursera.org/professional-certificates/meta-front-end-developer',
      paymentType: 'FREE',
      price: 0,
      certificateAvailable: true,
      spots: 5000,
    },
    {
      title: 'Microsoft Certified: Azure AI Fundamentals (AI-900)',
      organization: 'Microsoft Learn Student Hub',
      category: 'CERTIFICATION',
      subCategory: 'Artificial Intelligence',
      description: 'Demonstrate fundamental knowledge of machine learning and artificial intelligence concepts and related Microsoft Azure services. Perfect for starting an AI credential journey.',
      requirements: ['Basic understanding of computing and Internet concepts', 'Interest in Artificial Intelligence'],
      benefits: ['Free Exam Voucher for registered students', 'Official Microsoft Verified Credential', 'Hands-on Azure AI Studio interactive sandbox', 'Lifetime verifiable credential on Microsoft Learn'],
      startDate: inDays(12),
      endDate: inDays(42),
      applicationDeadline: inDays(9),
      duration: '4 Weeks',
      mode: 'ONLINE',
      location: 'Microsoft Learn Virtual',
      registrationUrl: 'https://learn.microsoft.com/certifications/azure-ai-fundamentals',
      paymentType: 'FREE',
      price: 0,
      certificateAvailable: true,
      spots: 3000,
    },

    // --- WORKSTATIONS ---
    {
      title: 'NVIDIA Deep Learning GPU Cloud Workstation Lab',
      organization: 'NVIDIA Inception Academic Network',
      category: 'WORKSTATION',
      subCategory: 'GPU Compute Sandbox',
      description: 'High-performance cloud compute workstations equipped with NVIDIA A100 Tensor Core GPUs, JupyterLab, PyTorch, and TensorRT for student machine learning thesis and heavy model training.',
      requirements: ['Enrolled engineering/research student', 'Submission of brief project/thesis description', 'Academic (.edu/.ac.in) email verification'],
      benefits: ['100 Free GPU Compute Hours on NVIDIA A100', 'Pre-configured CUDA, cuDNN, and LLM libraries', 'High-speed 100GB NVMe storage scratch space', 'Technical support from NVIDIA AI DevRel'],
      startDate: inDays(10),
      endDate: inDays(100),
      applicationDeadline: inDays(8),
      duration: '90 Days Access',
      mode: 'ONLINE',
      location: 'Cloud Virtual Instance',
      registrationUrl: 'https://www.nvidia.com/en-us/deep-learning-ai/education',
      paymentType: 'FREE',
      price: 0,
      certificateAvailable: false,
      spots: 250,
    },
    {
      title: 'High-Performance 3D & Creative Studio Pods',
      organization: 'Studentz Innovation Lab Hub',
      category: 'WORKSTATION',
      subCategory: 'Rendering & Design',
      description: 'Physical creator suites outfitted with dual color-accurate 4K displays, RTX 4090 GPUs, Wacom Cintiq graphics tablets, and full Blender & Unreal Engine 5 production stacks.',
      requirements: ['Student ID from an accredited institution', 'Advance booking reservation via portal', 'Active multimedia/game dev project'],
      benefits: ['24/7 High-Speed Fiber Internet (1 Gbps)', 'Unlimited rendering server access', 'Noise-canceling creator booths', 'Complimentary workspace amenities'],
      startDate: inDays(7),
      endDate: inDays(67),
      applicationDeadline: inDays(5),
      duration: '60 Days Pass',
      mode: 'OFFLINE',
      location: 'Cyber Park Innovation Center, Bangalore',
      registrationUrl: 'https://example.com/workstations/creative-pods',
      paymentType: 'FREE',
      price: 0,
      certificateAvailable: false,
      spots: 40,
    },
    {
      title: 'Student Cloud Sandbox & Kubernetes Cluster',
      organization: 'Cloud Native Computing Foundation (CNCF)',
      category: 'WORKSTATION',
      subCategory: 'Cloud & Infrastructure Sandbox',
      description: 'A multi-node dedicated Kubernetes cluster environment for students to experiment with microservices, Prometheus monitoring, Istio service meshes, and GitOps workflows without incurring cloud bills.',
      requirements: ['Interest in containerization and cloud-native architecture', 'Basic Docker command knowledge'],
      benefits: ['Dedicated 3-node Kubernetes sandbox for 30 days', 'CNCF swag and community forum access', 'Real-world practice for CKAD/CKA certifications', 'Zero credit card required'],
      startDate: inDays(14),
      endDate: inDays(44),
      applicationDeadline: inDays(11),
      duration: '30 Days Access',
      mode: 'ONLINE',
      location: 'Browser-based SSH & Web IDE',
      registrationUrl: 'https://www.cncf.io/students',
      paymentType: 'FREE',
      price: 0,
      certificateAvailable: false,
      spots: 500,
    },

    // --- OTHER PROGRAMS ---
    {
      title: 'Google Developer Groups (GDG) On Campus Lead',
      organization: 'Google Developers',
      category: 'OTHER_PROGRAM',
      subCategory: 'Campus Leadership & Fellowship',
      description: 'Passionate student leaders who want to start or grow a developer community on their university campus. GDG Leads organize workshops, hackathons, and study jams powered by Google technologies.',
      requirements: ['Enrolled in an undergraduate or graduate degree program', 'At least 1 year remaining until graduation', 'Demonstrated passion for building community and helping peers'],
      benefits: ['Exclusive Annual Summit invitation with Google staff', 'Direct access to Google Developer Advocates and experts', 'Official GDG Lead badge, swag kits, and event sponsorship grants', 'Global student leadership alumni network'],
      startDate: inDays(40),
      endDate: inDays(400),
      applicationDeadline: inDays(25),
      duration: '1 Academic Year',
      mode: 'HYBRID',
      location: 'University Campuses Nationwide',
      registrationUrl: 'https://developers.google.com/community/gdsc',
      paymentType: 'FREE',
      price: 0,
      certificateAvailable: true,
      spots: 1000,
    },
    {
      title: 'Microsoft Learn Student Ambassador (MLSA) Program',
      organization: 'Microsoft Worldwide Education',
      category: 'OTHER_PROGRAM',
      subCategory: 'Global Ambassador Community',
      description: 'Be a force for good locally and globally. MLSAs gain technical training, free Azure and Office 365 enterprise credits, LinkedIn Learning subscriptions, and mentor other students.',
      requirements: ['Currently enrolled full-time student (16+)', 'Strong communication and collaborative skills', 'Interest in tech evangelism and sharing knowledge'],
      benefits: ['$150 Monthly Azure Cloud Credits', 'Free Visual Studio Enterprise & GitHub Enterprise access', 'Free Exam Vouchers for Microsoft Certifications', 'Direct career advice from Microsoft recruiters'],
      startDate: inDays(20),
      endDate: inDays(380),
      applicationDeadline: inDays(15),
      duration: '1 Year (Renewable)',
      mode: 'ONLINE',
      location: 'Global Virtual Community',
      registrationUrl: 'https://studentambassadors.microsoft.com',
      paymentType: 'FREE',
      price: 0,
      certificateAvailable: true,
      spots: 2500,
    },
    {
      title: 'GitHub Campus Expert Fellowship',
      organization: 'GitHub Education',
      category: 'OTHER_PROGRAM',
      subCategory: 'Developer Community Leadership',
      description: 'Campus Experts are student leaders who enrich developer technology culture on their campuses. GitHub provides rigorous leadership training, event budget funding, and specialized swag.',
      requirements: ['Enrolled student with active GitHub Student Developer Pack', 'Active contributor to campus technical clubs or societies'],
      benefits: ['Exclusive GitHub Campus Expert Swag Pack & custom avatar', 'Event sponsorship grants up to $1,000 for campus workshops', 'Mentorship directly from GitHub Developer Relations team', 'Featured profile on GitHub Education showcase'],
      startDate: inDays(35),
      endDate: inDays(365),
      applicationDeadline: inDays(20),
      duration: 'Ongoing Fellowship',
      mode: 'ONLINE',
      location: 'Global Online Fellowship',
      registrationUrl: 'https://github.com/community/campus-experts',
      paymentType: 'FREE',
      price: 0,
      certificateAvailable: true,
      spots: 200,
    }
  ];

  console.log(`📦 Inserting ${opportunities.length} top-tier student opportunities...`);

  let count = 0;
  for (const item of opportunities) {
    await prisma.opportunity.create({
      data: {
        ...item,
        createdById: creator.id,
      }
    });
    count++;
  }

  console.log(`🎉 Successfully seeded ${count} diverse opportunities across all 5 categories!`);
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
