import { motion } from "framer-motion";
import { ShoppingBag, BookOpen, Users, Star } from "lucide-react";
import { Link } from "react-router-dom";

const floatingCards = [
  {
    icon: <ShoppingBag size={18} className="text-indigo-400" />,
    title: "2,400+ Listings",
    sub: "Books, gadgets & more",
    delay: 0,
  },
  {
    icon: <Users size={18} className="text-violet-400" />,
    title: "Verified Students",
    sub: "Campus-only community",
    delay: 0.15,
  },
  {
    icon: <BookOpen size={18} className="text-sky-400" />,
    title: "Save on Textbooks",
    sub: "Up to 80% cheaper",
    delay: 0.3,
  },
  {
    icon: <Star size={18} className="text-amber-400" />,
    title: "Trusted Sellers",
    sub: "Rated by peers",
    delay: 0.45,
  },
];

const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex relative overflow-hidden">

      {/* Layered radial glow background */}
<div className="absolute inset-0 -z-10 pointer-events-none">
  <div className="absolute inset-0 bg-slate-50 dark:bg-[#030712]" />
  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(99,102,241,0.22),transparent_65%)]" />
</div>
      {/* ── Left: Form slot ── */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full lg:w-1/2 px-6 py-12">
        {children}
      </div>

      {/* ── Right: Decorative Panel ── */}
      <div className="relative z-10 hidden lg:flex flex-col items-center justify-center w-1/2 px-12">

        {/* Hero text */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 bg-indigo-50 dark:bg-white/10 border border-indigo-100 dark:border-white/20 rounded-full px-4 py-1.5 text-xs text-indigo-600 dark:text-indigo-300 font-medium mb-5">
            <span className="w-1.5 h-1.5 bg-indigo-500 dark:bg-indigo-400 rounded-full animate-pulse" />
            Your Campus Marketplace
          </div>
          <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white leading-tight">
            Buy & Sell<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-500 dark:from-indigo-400 dark:to-violet-400">
              Within Campus
            </span>
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-3 max-w-xs mx-auto">
            Connect with fellow students. Trade textbooks, gadgets, notes and more — securely.
          </p>
        </motion.div>

        {/* Floating stat cards */}
        <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
          {floatingCards.map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut", delay: 0.3 + card.delay }}
              className="bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-slate-200/80 dark:border-white/10 rounded-2xl p-4 shadow-sm hover:bg-white/80 dark:hover:bg-white/10 transition-colors"
            >
              <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-3">
                {card.icon}
              </div>
              <p className="text-slate-800 dark:text-white text-sm font-semibold">{card.title}</p>
              <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">{card.sub}</p>
            </motion.div>
          ))}
        </div>

        {/* Decorative ring */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.5 }}
          className="absolute bottom-16 right-16 w-48 h-48 rounded-full border border-indigo-300/30 dark:border-indigo-500/20 flex items-center justify-center pointer-events-none"
        >
          <div className="w-32 h-32 rounded-full border border-violet-300/30 dark:border-violet-500/20 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-400/20 to-violet-400/20 blur-sm" />
          </div>
        </motion.div>

      </div>

    </div>
  );
};

export default AuthLayout;
