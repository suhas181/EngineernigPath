import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ArrowLeft, Compass } from 'lucide-react';

export function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center text-white font-sans px-6 relative overflow-hidden">
      {/* Decorative glowing orbs */}
      <div className="absolute top-1/4 left-1/4 h-[300px] w-[300px] rounded-full bg-blue-500/8 blur-[100px] -z-10" />
      <div className="absolute bottom-1/4 right-1/4 h-[250px] w-[250px] rounded-full bg-indigo-500/8 blur-[80px] -z-10" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[200px] w-[200px] rounded-full bg-purple-500/5 blur-[60px] -z-10" />

      <div className="text-center space-y-8 max-w-lg">
        {/* Animated 404 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <h1 className="text-[120px] md:text-[160px] font-extrabold font-heading leading-none bg-gradient-to-b from-white/90 to-white/10 text-transparent bg-clip-text select-none">
            404
          </h1>
        </motion.div>

        {/* Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-3"
        >
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium">
            <Compass className="h-4 w-4" />
            <span>Page Not Found</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold font-heading">
            You've wandered off the path
          </h2>
          <p className="text-muted-foreground text-base leading-relaxed">
            The page you're looking for doesn't exist or has been moved. Let's get you back to building your career.
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2"
        >
          <Link
            to="/dashboard"
            className="bg-primary text-primary-foreground font-semibold px-6 py-3 rounded-xl transition duration-200 hover:opacity-90 shadow-lg glow-primary flex items-center space-x-2"
          >
            <Home className="h-4 w-4" />
            <span>Go to Dashboard</span>
          </Link>
          <button
            onClick={() => window.history.back()}
            className="bg-white/5 border border-white/10 hover:bg-white/10 font-semibold px-6 py-3 rounded-xl transition duration-200 flex items-center space-x-2 text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Go Back</span>
          </button>
        </motion.div>
      </div>
    </div>
  );
}

export default NotFound;
