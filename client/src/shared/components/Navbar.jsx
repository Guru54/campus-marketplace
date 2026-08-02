import { MenuIcon, Plus, LogOut, Package, MessageCircle, Settings, X, ChevronRight, Home, List, User, Shield } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
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
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = openMobileMenu ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [openMobileMenu]);

  // Close menu on route change
  useEffect(() => {
    setOpenMobileMenu(false);
  }, [location.pathname]);

  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target))
        setOpenUserMenu(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = async () => {
    try { await authAPI.logout(); } catch {/* ignore */}
    logout();
    navigate("/login");
    toast.success("Logged out");
    setOpenMobileMenu(false);
  };

  const initials = user
    ? `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase()
    : "";
  const avatarUrl = getAvatarUrl(user);

  const displayLinks = navLinks
    .map((link) => {
      if (user) {
        if (link.name === "Features") return { name: "My Listings", href: "/my-listings" };
        if (link.name === "How it Works") return { name: "Messages", href: "/chats" };
      }
      return link;
    })
    .filter((link) => {
      if (link.href === "/listings" && !user) return false;
      return true;
    });

  // Icon map for nav links
  const linkIcons = {
    "Home": <Home size={18} />,
    "Listings": <List size={18} />,
    "My Listings": <Package size={18} />,
    "Messages": <MessageCircle size={18} />,
  };

  return (
    <>
      <nav
        className={`flex items-center justify-between fixed z-50 top-0 w-full px-6 md:px-16 lg:px-24 xl:px-32 py-4 transition-all duration-300 ${
          scrolled ? "backdrop-blur-md shadow-sm" : "backdrop-blur"
        }`}
      >
        {/* Logo */}
        <Link to="/" className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          re<span className="text-indigo-600 dark:text-indigo-400">zell</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8 lg:gap-9 text-sm font-medium text-slate-600 dark:text-slate-300">
          {displayLinks.map((link) =>
            link.href.startsWith("/") ? (
              <Link key={link.name} to={link.href} className="hover:text-slate-900 dark:hover:text-white transition-colors">
                {link.name}
              </Link>
            ) : (
              <a key={link.name} href={link.href} className="hover:text-slate-900 dark:hover:text-white transition-colors">
                {link.name}
              </a>
            )
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Desktop only: ThemeToggle */}
          <div className="hidden md:block">
            <ThemeToggle />
          </div>

          {user ? (
            <>
              {/* Mobile quick icons */}
              <div className="flex items-center md:hidden">
                <Link
                  to="/listings"
                  className="flex items-center justify-center w-9 h-9 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition"
                >
                  <List size={19} />
                </Link>
                <Link
                  to="/my-listings"
                  className="flex items-center justify-center w-9 h-9 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition"
                >
                  <Package size={19} />
                </Link>
                <Link
                  to="/chats"
                  className="flex items-center justify-center w-9 h-9 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition"
                >
                  <MessageCircle size={19} />
                </Link>
              </div>

              {/* Desktop Post button */}
              <Link
                to="/create"
                className="hidden md:flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-md transition"
              >
                <Plus size={15} /> Post
              </Link>

              {/* Desktop Avatar menu */}
              <div className="relative hidden md:block" ref={userMenuRef}>
                <button
                  onClick={() => setOpenUserMenu((v) => !v)}
                  className="flex items-center justify-center w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 text-sm font-bold hover:ring-2 hover:ring-indigo-400 transition cursor-pointer"
                >
                  {avatarUrl
                    ? <img src={avatarUrl} alt="" className="w-9 h-9 rounded-full object-cover" />
                    : initials}
                </button>

                {openUserMenu && (
                  <div className="absolute right-0 top-12 w-48 bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl shadow-lg py-1.5 z-50">
                    <div className="px-4 py-2 border-b border-slate-100 dark:border-white/10">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{user.firstName} {user.lastName}</p>
                      <p className="text-xs text-slate-400 truncate">{user.email}</p>
                    </div>
                    <Link to={`/profile/${user._id}`} onClick={() => setOpenUserMenu(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition">
                      <User size={14} /> My Profile
                    </Link>
                    <Link to="/my-listings" onClick={() => setOpenUserMenu(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition">
                      <Package size={14} /> My Listings
                    </Link>
                    <Link to="/chats" onClick={() => setOpenUserMenu(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition">
                      <MessageCircle size={14} /> Messages
                    </Link>
                    <Link to="/settings" onClick={() => setOpenUserMenu(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition">
                      <Settings size={14} /> Settings
                    </Link>
                    {user.role === "ADMIN" && (
                      <Link to="/admin" onClick={() => setOpenUserMenu(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-indigo-500 dark:text-indigo-400 hover:bg-slate-50 dark:hover:bg-white/5 transition">
                        <Shield size={14} /> Admin Dashboard
                      </Link>
                    )}
                    <div className="border-t border-slate-100 dark:border-white/10 my-1" />
                    <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition cursor-pointer">
                      <LogOut size={14} /> Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="hidden md:block hover:bg-slate-100 dark:hover:bg-slate-800 transition px-4 py-2 border border-indigo-600 rounded-md text-sm">
                Sign in
              </Link>
              <Link to="/register" className="hidden md:block px-4 py-2 bg-indigo-600 hover:bg-indigo-700 transition text-white rounded-md text-sm">
                Join Rezell
              </Link>
            </>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setOpenMobileMenu(true)}
            className="md:hidden flex items-center justify-center w-9 h-9 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 transition text-slate-700 dark:text-slate-300"
          >
            <MenuIcon size={22} />
          </button>
        </div>
      </nav>

      {/* ── Mobile Full-Screen Drawer ── */}

      {/* Backdrop */}
      <div
        onClick={() => setOpenMobileMenu(false)}
        className={`fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm md:hidden transition-opacity duration-300 ${
          openMobileMenu ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Drawer panel — slides in from right */}
      <div
        className={`fixed top-0 right-0 h-full w-[80vw] max-w-[320px] z-[70] md:hidden
          bg-white dark:bg-[#0f0f0f]
          flex flex-col
          transition-transform duration-300 ease-in-out
          ${openMobileMenu ? "translate-x-0" : "translate-x-full"}
        `}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-slate-100 dark:border-white/8">
          <Link to="/" className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">
            re<span className="text-indigo-600 dark:text-indigo-400">zell</span>
          </Link>
          <button
            onClick={() => setOpenMobileMenu(false)}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/15 transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">

          {/* User profile card (logged in) */}
          {user && (
            <div className="mx-4 mt-4 mb-1 p-4 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 text-sm font-bold flex items-center justify-center shrink-0 overflow-hidden ring-2 ring-indigo-200 dark:ring-indigo-500/30">
                {avatarUrl
                  ? <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                  : initials}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
              </div>
              <Link
                to={`/profile/${user._id}`}
                className="ml-auto shrink-0 text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
              >
                <ChevronRight size={16} />
              </Link>
            </div>
          )}

          {/* Post Listing CTA (logged in) */}
          {user && (
            <div className="px-4 mt-3">
              <Link
                to="/create"
                className="flex items-center justify-center gap-2 w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition"
              >
                <Plus size={16} /> Post a Listing
              </Link>
            </div>
          )}

          {/* Nav links */}
          <div className="px-4 mt-4">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2 px-1">
              Navigate
            </p>
            <div className="flex flex-col gap-0.5">
              {displayLinks.map((link) => {
                const isActive = location.pathname === link.href;
                const icon = linkIcons[link.name];
                const content = (
                  <span className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition ${
                    isActive
                      ? "bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5"
                  }`}>
                    <span className={isActive ? "text-indigo-500" : "text-slate-400 dark:text-slate-500"}>
                      {icon}
                    </span>
                    {link.name}
                    {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500" />}
                  </span>
                );
                return link.href.startsWith("/") ? (
                  <Link key={link.name} to={link.href}>{content}</Link>
                ) : (
                  <a key={link.name} href={link.href}>{content}</a>
                );
              })}
            </div>
          </div>

          {/* Account section (logged in) */}
          {user && (
            <div className="px-4 mt-4">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2 px-1">
                Account
              </p>
              <div className="flex flex-col gap-0.5">
                <Link to="/settings" className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition">
                  <Settings size={18} className="text-slate-400 dark:text-slate-500" /> Settings
                </Link>
                {user.role === "ADMIN" && (
                  <Link to="/admin" className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-indigo-500 dark:text-indigo-400 hover:bg-slate-50 dark:hover:bg-white/5 transition">
                    <Shield size={18} /> Admin Dashboard
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* Sign in / Register (logged out) */}
          {!user && (
            <div className="px-4 mt-4 flex flex-col gap-2">
              <Link to="/login" className="flex items-center justify-center py-2.5 border border-indigo-500 text-indigo-600 dark:text-indigo-400 text-sm font-semibold rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition">
                Sign in
              </Link>
              <Link to="/register" className="flex items-center justify-center py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition">
                Join Rezell
              </Link>
            </div>
          )}
        </div>

        {/* Drawer footer */}
        <div className="px-4 py-4 border-t border-slate-100 dark:border-white/8 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
            <ThemeToggle />
            <span>Toggle theme</span>
          </div>
          {user && (
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs font-medium text-red-500 hover:text-red-600 transition cursor-pointer"
            >
              <LogOut size={14} /> Logout
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default Navbar;