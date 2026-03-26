import { Link } from "react-router-dom";
import Marquee from "react-fast-marquee";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { useThemeContext } from "@/context/ThemeContext";
import SectionTitle from "@/shared/components/SectionTitle";
import { featuresData } from "@/data/featuresData";
import { faqsData } from "@/data/faqsData";
import { collegesData } from "@/data/collegesData";

//  FAQ Accordion 
const FaqSection = () => {
  const [openIndex, setOpenIndex] = useState(null);
  const { theme } = useThemeContext();
  return (
    <div id="faq" className="relative max-w-2xl mx-auto flex flex-col items-center justify-center px-4 md:px-0">
      <img
        className="absolute -mb-120 -left-40 -z-10 pointer-events-none"
        src={theme === "dark" ? "/assets/color-splash.svg" : "/assets/color-splash-light.svg"}
        alt=""
        width={1000}
        height={1000}
      />
      <SectionTitle
        text1="FAQ"
        text2="Frequently asked questions"
        text3="Everything you need to know before your first trade on Rezell."
      />
      <div className="mt-8 w-full">
        {faqsData.map((faq, i) => (
          <div
            key={i}
            className="border-b border-slate-300 dark:border-indigo-900 py-4 cursor-pointer w-full"
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-medium">{faq.question}</h3>
              <ChevronDown
                size={18}
                className={`transition-transform duration-300 ${openIndex === i ? "rotate-180" : ""}`}
              />
            </div>
            <p
              className={`text-sm text-slate-600 dark:text-slate-300 transition-all duration-500 ease-in-out max-w-xl ${
                openIndex === i
                  ? "opacity-100 max-h-[500px] translate-y-0 pt-4"
                  : "opacity-0 max-h-0 overflow-hidden -translate-y-2"
              }`}
            >
              {faq.answer}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

//  Home Page 
export default function Home() {
  const { theme } = useThemeContext();

  return (
    <>
      {/*  HERO  */}
      <div className="flex flex-col items-center justify-center text-center px-4 min-h-screen pt-24 bg-[url('/assets/light-hero-gradient.svg')] dark:bg-[url('/assets/dark-hero-gradient.svg')] bg-no-repeat bg-cover">

        {/* Social proof badge */}
        <div className="flex flex-wrap items-center justify-center gap-3 p-1.5 pr-4 rounded-full border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-600/20">
          <div className="flex items-center -space-x-2">
            {[
              "https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=50",
              "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=50",
              "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=50&h=50&auto=format&fit=crop",
            ].map((src, i) => (
              <img key={i} className="size-7 rounded-full ring-2 ring-white dark:ring-black" src={src} alt="student" />
            ))}
          </div>
          
                                         <div className="relative flex h-3.5 w-3.5 items-center justify-center">
                                        <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 animate-ping duration-300" />

                                        <span className="relative inline-flex size-2 rounded-full bg-green-600" />
                                    </div>
                                     <p className="text-xs text-slate-600 dark:text-slate-300"> Trusted by 1,000+ campus students </p>
          
        </div>

        {/* Headline */}
        <h1 className="mt-6 text-5xl md:text-[64px] font-semibold leading-tight max-w-2xl">
          Your campus.{" "}
          <span className="bg-gradient-to-r from-indigo-600 to-violet-500 dark:from-indigo-400 dark:to-violet-300 bg-clip-text text-transparent">
            Your marketplace.
          </span>
        </h1>

        {/* Subtext */}
        <p className="text-base text-slate-600 dark:text-slate-300 max-w-lg mt-4">
          Rezell is a campus-exclusive resale network. Buy second-hand books,
          gadgets, and furniture from verified students at your own college 
          with enforced trust, not assumed.
        </p>

        {/* CTA buttons */}
        <div className="flex items-center gap-4 mt-8">
          <Link
            to="/register"
            className="bg-indigo-600 hover:bg-indigo-700 transition text-white rounded-md px-7 h-11 flex items-center font-medium"
          >
            Join Rezell
          </Link>
          <Link
            to="/listings"
            className="flex items-center gap-2 border border-indigo-900 text-slate-700 dark:text-white rounded-md px-7 h-11 transition hover:border-indigo-500"
          >
            Browse Listings 
          </Link>
        </div>

        {/* Trust micro-proof */}
        <div className="flex flex-wrap justify-center gap-x-5 gap-y-1 mt-5 text-xs text-slate-400">
          <span> Campus verified</span>
          <span> No outsiders</span>
          <span> Real transactions only</span>
        </div>

        {/* College marquee */}
        <h3 className="text-sm text-center text-slate-400 mt-24 pb-6 font-medium">
          Building trust across campuses, including 
        </h3>
        <Marquee
          className="max-w-4xl mx-auto"
          gradient={true}
          speed={30}
          gradientColor={theme === "dark" ? "#030712" : "#fff"}
        >
          <div className="flex items-center">
            {[...collegesData, ...collegesData].map((college, i) => (
              <span
                key={i}
                className="mx-10 text-sm font-semibold text-slate-400 dark:text-slate-500 whitespace-nowrap"
              >
                {college.name}
              </span>
            ))}
          </div>
        </Marquee>
      </div>

      {/*  FEATURES + HOW IT WORKS  */}
      <div id="features" className="relative overflow-hidden py-10">
        {/* Left-center glow */}
        <div className="pointer-events-none absolute left-30 top-1/2 -translate-y-1/2 w-[500px] h-[500px] -translate-x-1/2 rounded-full bg-violet-600/20 dark:bg-violet-600/30 blur-[100px] -z-10" />

        {/* Features */}
        <SectionTitle
          text1="FEATURES"
          text2="Built on enforced trust"
          text3="Every feature in Rezell is engineered to enforce trust — not assume it."
        />
        <div className="flex flex-wrap items-center justify-center gap-6 md:gap-4 mt-10 px-6 md:px-16 lg:px-24 xl:px-32">
          {featuresData.slice(0, 4).map((feature, i) => (
            <motion.div
              key={i}
              className="p-6 rounded-xl space-y-3 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/20 max-w-80 md:max-w-66"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.45, delay: i * 0.08, ease: "easeOut" }}
            >
              <feature.icon className="text-indigo-500 size-8 mt-4" strokeWidth={1.3} />
              <h3 className="text-base font-medium">{feature.title}</h3>
              <p className="text-slate-400 text-sm line-clamp-2">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        {/* How It Works */}
        <div id="how-it-works" className="mt-60">
          <SectionTitle
            text1="HOW IT WORKS"
            text2="Three steps. Zero friction."
            text3="List, negotiate, and close deals — all within your campus network."
          />
          <div className="flex flex-wrap items-center justify-center gap-6 mt-10 px-6 md:px-16 lg:px-24 xl:px-32">
            {[
              {
                step: "01",
                title: "List your item",
                desc: "Post in under 2 minutes. Add price, condition, category, and pickup spot.",
              },
              {
                step: "02",
                title: "Negotiate in-app",
                desc: "Chat with buyers directly. No number sharing. No WhatsApp groups.",
              },
              {
                step: "03",
                title: "Meet & Rate",
                desc: "Pick a campus spot, hand it over, collect payment. Then rate the experience.",
              },
            ].map((s, i) => (
              <motion.div
                key={i}
                className="p-6 rounded-xl space-y-3 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/20 max-w-80 md:max-w-66"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.45, delay: i * 0.1, ease: "easeOut" }}
              >
                <p className="text-4xl font-extrabold text-indigo-300 dark:text-indigo-900 leading-none">
                  {s.step}
                </p>
                <h3 className="text-base font-medium">{s.title}</h3>
                <p className="text-slate-400 text-sm">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/*  FAQ  */}
      <FaqSection />

      {/*  FINAL CTA  */}
      <div className="flex flex-col items-center text-center justify-center mt-28 mb-10 px-4">
        <h3 className="text-3xl font-semibold mt-16 mb-4">Ready to trade smarter?</h3>
        <p className="text-slate-600 dark:text-slate-300 max-w-xl mx-auto">
          Join your campus network. Buy trusted. Sell fast. Rezell.
        </p>
        <div className="flex items-center gap-4 mt-8">
          <Link
            to="/register"
            className="bg-indigo-600 hover:bg-indigo-700 transition text-white rounded-md px-7 h-11 flex items-center font-medium"
          >
            Join Rezell
          </Link>
          <Link
            to="/listings"
            className="border border-indigo-900 text-slate-700 dark:text-white rounded-md px-7 h-11 flex items-center transition hover:border-indigo-500"
          >
            Browse Listings
          </Link>
        </div>
        <p className="mt-4 text-xs text-slate-400">
          Built for students. Designed with system thinking.
        </p>
      </div>
    </>
  );
}
