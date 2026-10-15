import { CheckCircle, Target, Users, Zap } from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="min-h-screen pt-12 pb-24">
      {/* Hero */}
      <section className="text-center mb-20 px-4">
        <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6">About StudentzCert</h1>
        <p className="text-xl text-zinc-400 max-w-3xl mx-auto">
          Studentz Certification is a student-focused platform that helps students discover valuable opportunities such as hackathons, internships, certifications, workstations and other programs.
        </p>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24">
        
        {/* Mission */}
        <section className="flex flex-col md:flex-row gap-12 items-center">
          <div className="flex-1">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-6">
              <Target className="w-8 h-8 text-indigo-400" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-6">Our Mission</h2>
            <p className="text-lg text-zinc-300 leading-relaxed">
              We believe every student deserves access to the right opportunities at the right time. Our mission is to bridge the gap between ambitious students and the programs that can shape their careers. We aim to build the most comprehensive, easy-to-use discovery platform for the next generation of builders, creators, and leaders.
            </p>
          </div>
          <div className="flex-1 glass-card rounded-3xl p-8 border-indigo-500/20">
            <h3 className="text-xl font-semibold text-white mb-4">What Students Can Discover</h3>
            <ul className="space-y-4">
              {[
                'High-energy Hackathons and coding competitions',
                'Valuable Internships to gain real-world experience',
                'Industry-recognized Certifications to validate skills',
                'Premium Workstations for creative and heavy computing projects',
                'Fellowships, open-source programs, and exclusive communities'
              ].map((item, i) => (
                <li key={i} className="flex items-start">
                  <CheckCircle className="w-6 h-6 mr-3 text-indigo-400 shrink-0" />
                  <span className="text-zinc-300">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Why we built this */}
        <section className="flex flex-col md:flex-row-reverse gap-12 items-center">
          <div className="flex-1">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 flex items-center justify-center mb-6">
              <Zap className="w-8 h-8 text-rose-400" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-6">Why We Built StudentzCert</h2>
            <div className="space-y-4 text-lg text-zinc-300 leading-relaxed">
              <p>
                As students ourselves, we faced a major problem: opportunities are scattered all over the internet. Finding a hackathon meant checking five different websites, and looking for an internship meant scrolling through endless noisy job boards.
              </p>
              <p>
                We built StudentzCert to solve this fragmentation. We wanted a premium, centralized dashboard where we could filter, discover, and save exactly what we needed, without the clutter. It is built by students, for students.
              </p>
            </div>
          </div>
          <div className="flex-1 w-full h-[400px] glass-card rounded-3xl relative overflow-hidden flex items-center justify-center border-rose-500/20">
             <div className="absolute inset-0 bg-gradient-to-tr from-rose-500/10 to-transparent"></div>
             <div className="text-center z-10 p-8">
               <h3 className="text-3xl font-bold text-white mb-2">Built for Speed</h3>
               <p className="text-zinc-400">Stop searching. Start applying.</p>
             </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="text-center bg-zinc-900/50 rounded-3xl p-12 border border-white/5">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-6 mx-auto">
            <Users className="w-8 h-8 text-indigo-400" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Empowering Every Student</h2>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto mb-10">
            Whether you are looking to win your next hackathon, land an impactful internship, or earn industry certifications, StudentzCert brings everything under one roof.
          </p>
          <Link
            href="/explore"
            className="inline-block px-8 py-4 bg-white text-black font-bold rounded-full hover:bg-zinc-200 transition-colors"
          >
            Explore Opportunities
          </Link>
        </section>

      </div>
    </div>
  );
}
