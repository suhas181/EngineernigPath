import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Compass, FileText, Briefcase, MessageSquare, GraduationCap, ArrowRight, Zap, Target } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

export function LandingPage() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const features = [
    {
      icon: <Compass className="h-6 w-6 text-blue-400" />,
      title: 'Personalized Roadmaps',
      description: 'AI-generated step-by-step learning paths tailored to your specific career goals.',
    },
    {
      icon: <FileText className="h-6 w-6 text-purple-400" />,
      title: 'AI Resume Analyzer',
      description: 'Upload your resume and get an instant ATS score review with actionable suggestions.',
    },
    {
      icon: <Briefcase className="h-6 w-6 text-green-400" />,
      title: 'Internship Portal',
      description: 'Discover verified jobs and internships with smart alerts based on your profile.',
    },
    {
      icon: <MessageSquare className="h-6 w-6 text-pink-400" />,
      title: 'AI Career Mentor',
      description: 'Get 24/7 career advice, project ideas, and interview strategy recommendations.',
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden text-white font-sans">
      {/* Navigation Header */}
      <header className="glass-panel sticky top-0 z-50 px-6 py-4 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center space-x-2">
          <GraduationCap className="h-8 w-8 text-blue-500" />
          <span className="font-heading font-bold text-2xl tracking-tight bg-gradient-to-r from-blue-400 to-indigo-500 text-transparent bg-clip-text">
            EngineerPath
          </span>
        </div>
        <nav className="flex items-center space-x-4">
          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="bg-primary text-primary-foreground font-semibold px-5 py-2 rounded-xl transition duration-200 hover:opacity-90 shadow-md glow-primary text-sm flex items-center space-x-1"
            >
              <span>Go to Dashboard</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium hover:text-blue-400 transition">
                Sign In
              </Link>
              <Link
                to="/signup"
                className="bg-primary text-primary-foreground font-semibold px-5 py-2 rounded-xl transition duration-200 hover:opacity-90 shadow-md glow-primary text-sm"
              >
                Get Started
              </Link>
            </>
          )}
        </nav>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 pt-20 pb-32 grid lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-7 space-y-8 text-left">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium"
          >
            <Zap className="h-4 w-4 fill-current" />
            <span>AI-Powered Career OS for Engineering Students</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-6xl font-extrabold font-heading leading-tight tracking-tight"
          >
            Navigate Your Career from{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500">
              College to Placement
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-muted-foreground max-w-xl"
          >
            Stop wasting time searching across dozens of websites. EngineerPath brings roadmaps, projects, resumes, and internships together into one cohesive platform guided by AI.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap gap-4 pt-4"
          >
            <Link
              to={isAuthenticated ? '/dashboard' : '/signup'}
              className="bg-primary text-primary-foreground font-semibold px-8 py-4 rounded-xl transition duration-200 hover:opacity-90 shadow-lg glow-primary flex items-center space-x-2 text-base"
            >
              <span>Build Your Path Now</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
            <a
              href="#features"
              className="glass-button bg-white/5 border border-white/10 hover:bg-white/10 font-semibold px-8 py-4 rounded-xl transition duration-200 flex items-center space-x-2 text-base"
            >
              <span>Explore Features</span>
            </a>
          </motion.div>
        </div>

        {/* Hero Interactive Widget Graphic */}
        <div className="lg:col-span-5 relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="glass-panel rounded-3xl p-6 shadow-2xl relative z-10 select-none overflow-hidden glow-accent"
          >
            <div className="flex items-center justify-between pb-6 border-b border-white/5">
              <div className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-indigo-400" />
                <span className="font-heading font-semibold text-sm">Active Learning Path: SDE</span>
              </div>
              <div className="text-xs bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full font-semibold">
                35% Complete
              </div>
            </div>

            <div className="space-y-4 pt-6">
              {[
                { title: 'HTML & CSS Foundations', status: 'Completed', color: 'bg-green-500' },
                { title: 'JavaScript & DOM Manipulation', status: 'Completed', color: 'bg-green-500' },
                { title: 'React components and state hooks', status: 'In Progress', color: 'bg-blue-400 animate-pulse' },
                { title: 'Node.js backend APIs', status: 'Locked', color: 'bg-white/10' },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-white/5 border border-white/5 transition hover:border-white/10"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`h-2.5 w-2.5 rounded-full ${item.color}`} />
                    <span className="text-sm font-medium">{item.title}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{item.status}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Decorative glowing backdrops */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[350px] w-[350px] rounded-full bg-indigo-500/10 blur-[80px] -z-10" />
          <div className="absolute top-10 left-10 h-[200px] w-[200px] rounded-full bg-blue-500/10 blur-[60px] -z-10" />
        </div>
      </main>

      {/* Features Grid Section */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-24 border-t border-white/5 relative">
        <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
          <h2 className="text-3xl md:text-4xl font-bold font-heading">
            Everything You Need, Structured for Success
          </h2>
          <p className="text-muted-foreground text-base">
            No more jumping between YouTube, LeetCode, and job boards. EngineerPath acts as your central command center.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="glass-card rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:border-white/15"
            >
              <div className="h-12 w-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 mb-6">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold font-heading mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default LandingPage;
