import Link from 'next/link';
import Image from 'next/image';
import { Code, Briefcase, Award, Monitor, Compass, Search, Filter, Bookmark, Send, TrendingUp } from 'lucide-react';

export default function Home() {
  const categories = [
    {
      name: 'Hackathons',
      icon: <Code className="w-8 h-8 text-indigo-400" />,
      description: 'Compete, build, and win in intense coding competitions.',
      href: '/explore?category=Hackathons',
    },
    {
      name: 'Internships',
      icon: <Briefcase className="w-8 h-8 text-emerald-400" />,
      description: 'Gain real-world experience and kickstart your career.',
      href: '/explore?category=Internships',
    },
    {
      name: 'Certifications',
      icon: <Award className="w-8 h-8 text-amber-400" />,
      description: 'Validate your skills with industry-recognized credentials.',
      href: '/explore?category=Certifications',
    },
    {
      name: 'Workstations',
      icon: <Monitor className="w-8 h-8 text-rose-400" />,
      description: 'Access high-end gear and spaces for your creative projects.',
      href: '/explore?category=Workstations',
    },
    {
      name: 'Other Programs',
      icon: <Compass className="w-8 h-8 text-cyan-400" />,
      description: 'Discover fellowships, open-source programs, and more.',
      href: '/explore?category=Other Programs',
    },
  ];

  const features = [
    {
      title: 'Discover Opportunities',
      description: 'Find the best programs tailored for students in one centralized platform.',
      icon: <Search className="w-6 h-6 text-white" />,
    },
    {
      title: 'Easy Filtering',
      description: 'Quickly find what you need by mode, payment, date, and categories.',
      icon: <Filter className="w-6 h-6 text-white" />,
    },
    {
      title: 'Save Opportunities',
      description: 'Bookmark your favorite programs and apply to them when you are ready.',
      icon: <Bookmark className="w-6 h-6 text-white" />,
    },
    {
      title: 'Apply Easily',
      description: 'Streamlined application process designed specifically for students.',
      icon: <Send className="w-6 h-6 text-white" />,
    },
    {
      title: 'Track Applications',
      description: 'Keep track of all your applications and their current status.',
      icon: <TrendingUp className="w-6 h-6 text-white" />,
    },
  ];

  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-[400px] bg-indigo-500/20 blur-[120px] rounded-full pointer-events-none" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Official Brand Badge */}
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-white/10 bg-white/[0.04] backdrop-blur-md mb-8 hover:border-indigo-500/40 transition-all shadow-xl shadow-indigo-500/5 group">
            <div className="relative w-6 h-6 rounded-lg overflow-hidden border border-white/15 bg-[#060713] p-0.5 shrink-0 group-hover:scale-105 transition-transform">
              <Image
                src="/logo-icon.png"
                alt="Studentz Certification"
                width={24}
                height={24}
                className="object-contain w-full h-full"
                priority
              />
            </div>
            <span className="text-xs sm:text-sm font-semibold tracking-wide text-zinc-300">
              Studentz Certification <span className="text-indigo-400 font-medium">· One Platform. Every Opportunity.</span>
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6">
            Discover Opportunities.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-200 to-zinc-500">
              Build Your Future.
            </span>
          </h1>
          <p className="mt-4 text-xl md:text-2xl text-zinc-400 max-w-3xl mx-auto mb-10">
            Find hackathons, internships, certifications, workstations and programs designed to help students grow.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/explore"
              className="px-8 py-4 text-base font-semibold text-black bg-white rounded-full hover:bg-zinc-200 transition-all hover:scale-105 active:scale-95"
            >
              Explore Opportunities
            </Link>
            <Link
              href="/about"
              className="px-8 py-4 text-base font-semibold text-white bg-white/10 rounded-full hover:bg-white/20 backdrop-blur-md transition-all border border-white/10"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-zinc-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Explore by Category</h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">
              Everything you need to level up your career, organized exactly how you want it.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {categories.map((category) => (
              <Link
                key={category.name}
                href={category.href}
                className="glass-card rounded-2xl p-6 flex flex-col items-center text-center group hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  {category.icon}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{category.name}</h3>
                <p className="text-sm text-zinc-400">{category.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why StudentzCert Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Why StudentzCert?</h2>
            <p className="text-xl text-zinc-400 max-w-2xl">
              We built this platform to solve the exact problems students face when looking for opportunities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="flex gap-4 items-start">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center border border-white/5">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-zinc-400">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-transparent to-zinc-900/80" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center glass-card rounded-3xl p-12 border border-white/10">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to take the next step?</h2>
          <p className="text-xl text-zinc-400 mb-10 max-w-2xl mx-auto">
            Join thousands of students who are already finding and applying to the best opportunities out there.
          </p>
          <Link
            href="/explore"
            className="inline-block px-10 py-5 text-lg font-bold text-black bg-white rounded-full hover:bg-zinc-200 transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(255,255,255,0.3)]"
          >
            Start Exploring Today
          </Link>
        </div>
      </section>
    </div>
  );
}
