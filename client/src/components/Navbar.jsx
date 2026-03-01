import { MenuIcon, XIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";
import { navLinks } from "../data/navLinks";

const Navbar = () => {
  const [openMobileMenu, setOpenMobileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("max-md:overflow-hidden", openMobileMenu);
  }, [openMobileMenu]);

  return (
    <nav
      className={`flex items-center justify-between fixed z-50 top-0 w-full px-6 md:px-16 lg:px-24 xl:px-32 py-4 transition-all duration-300 ${
        openMobileMenu
          ? ""
          : scrolled
          ? "backdrop-blur-md "
          : "backdrop-blur"
      }`}
    >
      {/* Logo */}
      <Link to="/" className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
        re<span className="text-indigo-600 dark:text-indigo-400">zell</span>
      </Link>

      {/* Desktop links */}
      <div className="hidden md:flex items-center gap-8 lg:gap-9 text-sm font-medium text-slate-600 dark:text-slate-300">
        {navLinks.map((link) => (
          <a
            key={link.name}
            href={link.href}
            className="hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            {link.name}
          </a>
        ))}
      </div>

      {/* Mobile full-screen menu */}
      <div
        className={`fixed inset-0 flex flex-col items-center justify-center gap-6 text-lg font-medium bg-white/90 dark:bg-black/90 backdrop-blur-md md:hidden transition-transform duration-300 ${
          openMobileMenu ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {navLinks.map((link) => (
          <a
            key={link.name}
            href={link.href}
            onClick={() => setOpenMobileMenu(false)}
            className="text-slate-700 dark:text-slate-200"
          >
            {link.name}
          </a>
        ))}
        <Link
          to="/login"
          onClick={() => setOpenMobileMenu(false)}
          className="text-slate-600 dark:text-slate-300"
        >
          Sign in
        </Link>
        <Link
          to="/register"
          onClick={() => setOpenMobileMenu(false)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-md transition"
        >
          Join Rezell
        </Link>
        <button
          className="absolute top-5 right-6 size-10 flex items-center justify-center bg-indigo-600 text-white rounded-md"
          onClick={() => setOpenMobileMenu(false)}
        >
          <XIcon size={20} />
        </button>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <Link
          to="/login"
          className="hidden md:block hover:bg-slate-100 dark:hover:bg-slate-800 transition px-4 py-2 border border-indigo-600 rounded-md text-sm"
        >
          Sign in
        </Link>
        <Link
          to="/register"
          className="hidden md:block px-4 py-2 bg-indigo-600 hover:bg-indigo-700 transition text-white rounded-md text-sm"
        >
          Join Rezell
        </Link>
        <button
          onClick={() => setOpenMobileMenu(!openMobileMenu)}
          className="md:hidden"
        >
          <MenuIcon size={24} />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;