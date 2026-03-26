import { MenuIcon, XIcon, Plus, LogOut, Package, MessageCircle, Settings } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";
import { navLinks } from "@/data/navLinks";
import { useAuth } from "@/context/AuthContext";
import { getAvatarUrl } from "@/shared/utils/avatar";
import { authAPI } from "@/shared/services/api";
import toast from "react-hot-toast";

const Navbar = () => {
  const [openMobileMenu, setOpenMobileMenu] = useState(false);
  const [openUserMenu,   setOpenUserMenu]   = useState(false);
  const [scrolled, setScrolled]             = useState(false);
  const userMenuRef = useRef(null);

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("max-md:overflow-hidden", openMobileMenu);
  }, [openMobileMenu]);

  // Close user menu when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target))
        setOpenUserMenu(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = async () => {
    try {
      await authAPI.logout();
    } catch {/* ignore */}
    logout();
    navigate("/login");
    toast.success("Logged out");
  };

  const initials = user
    ? `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase()
    : "";
  const avatarUrl = getAvatarUrl(user);

  return (
    <nav
      className={`flex items-center justify-between fixed z-50 top-0 w-full px-6 md:px-16 lg:px-24 xl:px-32 py-4 transition-all duration-300 ${
        openMobileMenu ? "" : scrolled ? "backdrop-blur-md " : "backdrop-blur"
      }`}
    >
      {/* Logo */}
      <Link to="/" className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
        re<span className="text-indigo-600 dark:text-indigo-400">zell</span>
      </Link>

      {/* Desktop links */}
      <div className="hidden md:flex items-center gap-8 lg:gap-9 text-sm font-medium text-slate-600 dark:text-slate-300">
        {navLinks.map((link) => (
          link.href.startsWith("/") ? (
            <Link
              key={link.name}
              to={link.href}
              className="hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              {link.name}
            </Link>
          ) : (
            <a
              key={link.name}
              href={link.href}
              className="hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              {link.name}
            </a>
          )
        ))}
      </div>

      {/* Mobile full-screen menu */}
      <div
        className={`fixed inset-0 flex flex-col items-center justify-center gap-6 text-lg font-medium bg-white/90 dark:bg-black/90 backdrop-blur-md md:hidden transition-transform duration-300 ${
          openMobileMenu ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {navLinks.map((link) => (
          link.href.startsWith("/") ? (
            <Link
              key={link.name}
              to={link.href}
              onClick={() => setOpenMobileMenu(false)}
              className="text-slate-700 dark:text-slate-200"
            >
              {link.name}
            </Link>
          ) : (
            <a
              key={link.name}
              href={link.href}
              onClick={() => setOpenMobileMenu(false)}
              className="text-slate-700 dark:text-slate-200"
            >
              {link.name}
            </a>
          )
        ))}
        {user ? (
          <>
            <Link to="/create" onClick={() => setOpenMobileMenu(false)} className="text-indigo-600 dark:text-indigo-400 font-semibold">
              + Post Listing
            </Link>
            <Link to="/my-listings" onClick={() => setOpenMobileMenu(false)} className="text-slate-600 dark:text-slate-300">
              My Listings
            </Link>
            <Link to="/chats" onClick={() => setOpenMobileMenu(false)} className="text-slate-600 dark:text-slate-300">
              Messages
            </Link>
            <Link to="/settings" onClick={() => setOpenMobileMenu(false)} className="text-slate-600 dark:text-slate-300">
              Settings
            </Link>
            <button onClick={() => { handleLogout(); setOpenMobileMenu(false); }} className="text-red-500 cursor-pointer">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" onClick={() => setOpenMobileMenu(false)} className="text-slate-600 dark:text-slate-300">
              Sign in
            </Link>
            <Link
              to="/register"
              onClick={() => setOpenMobileMenu(false)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-md transition"
            >
              Join Rezell
            </Link>
          </>
        )}
        <button
          className="absolute top-5 right-6 size-10 flex items-center justify-center bg-indigo-600 text-white rounded-md cursor-pointer"
          onClick={() => setOpenMobileMenu(false)}
        >
          <XIcon size={20} />
        </button>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        <ThemeToggle />

        {user ? (
          <>
            {/* Post button */}
            <Link
              to="/create"
              className="hidden md:flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-md transition"
            >
              <Plus size={15} /> Post
            </Link>

            {/* Avatar / user menu */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setOpenUserMenu((v) => !v)}
                className="hidden md:flex items-center justify-center w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 text-sm font-bold hover:ring-2 hover:ring-indigo-400 transition cursor-pointer"
                title={`${user.firstName} ${user.lastName}`}
              >
                {avatarUrl ? (
                  <img src={avatarUrl} alt="" className="w-9 h-9 rounded-full object-cover" />
                ) : initials}
              </button>

              {openUserMenu && (
                <div className="absolute right-0 top-12 w-48 bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl shadow-lg py-1.5 z-50">
                  <div className="px-4 py-2 border-b border-slate-100 dark:border-white/10">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-xs text-slate-400 truncate">{user.email}</p>
                  </div>
                  <Link
                    to={`/profile/${user._id}`}
                    onClick={() => setOpenUserMenu(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition"
                  >
                    <Package size={14} /> My Profile
                  </Link>
                  <Link
                    to="/my-listings"
                    onClick={() => setOpenUserMenu(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition"
                  >
                    <Package size={14} /> My Listings
                  </Link>
                  <Link
                    to="/chats"
                    onClick={() => setOpenUserMenu(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition"
                  >
                    <MessageCircle size={14} /> Messages
                  </Link>
                  <Link
                    to="/settings"
                    onClick={() => setOpenUserMenu(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition"
                  >
                    <Settings size={14} /> Settings
                  </Link>
                  <div className="border-t border-slate-100 dark:border-white/10 my-1" />
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition cursor-pointer"
                  >
                    <LogOut size={14} /> Logout
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
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
          </>
        )}

        <button onClick={() => setOpenMobileMenu(!openMobileMenu)} className="md:hidden">
          <MenuIcon size={24} />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;