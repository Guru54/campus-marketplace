import { Link } from "react-router-dom";
import { navLinks } from "@/data/navLinks";

const Footer = () => (
  <footer className="relative px-6 md:px-16 lg:px-24 xl:px-32 mt-40 w-full text-slate-700 dark:text-slate-300">
    <div className="flex flex-col md:flex-row justify-between w-full gap-10 border-b border-gray-200 dark:border-slate-700 pb-6">

      {/* Brand */}
      <div className="md:max-w-sm">
        <Link to="/" className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          re<span className="text-indigo-600 dark:text-indigo-400">zell</span>
        </Link>
        <p className="mt-4 text-sm leading-relaxed">
          Campus-exclusive resale network. Buy and sell second-hand items with
          verified students from your own campus — no outsiders, no scams.
        </p>
      </div>

      {/* Links */}
      <div className="flex-1 flex items-start md:justify-end gap-16 text-sm">
        <div>
          <h2 className="font-semibold mb-4 text-slate-900 dark:text-white">Product</h2>
          <ul className="space-y-2">
            {navLinks.map((link) => (
              <li key={link.name}>
                <a href={link.href} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                  {link.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="font-semibold mb-4 text-slate-900 dark:text-white">Account</h2>
          <ul className="space-y-2">
            <li><Link to="/login" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">Sign in</Link></li>
            <li><Link to="/register" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">Join Campus</Link></li>
            <li><Link to="/listings" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">Browse</Link></li>
            <li><Link to="/create" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">Sell</Link></li>
          </ul>
        </div>
      </div>
    </div>

    {/* Bottom */}
    <div className="pt-4 pb-5 flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-500">
      <p>© {new Date().getFullYear()} Rezell. All rights reserved.</p>
      <p>
        Designed &amp; Engineered by{" "}
        <span className="text-slate-700 dark:text-slate-300 font-medium">Gurudas Bhardwaj</span>
      </p>
    </div>
  </footer>
);

export default Footer;