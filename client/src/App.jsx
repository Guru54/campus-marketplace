import { useEffect, lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeContextProvider } from "@/context/ThemeContext";
import { SocketProvider } from "@/context/SocketContext";
import { Navbar, Footer, LenisScroll } from "@/shared/components";
import { ListingDetailSkeleton } from "@/shared/components/skeletons";
import ProtectedRoute from "@/features/auth/components/ProtectedRoute";
import PublicOnlyRoute from "@/features/auth/components/PublicOnlyRoute";
import { Toaster } from 'react-hot-toast';

// Lazy load pages for code splitting
const Home = lazy(() => import("@/features/home/pages/Home"));
const Login = lazy(() => import("@/features/auth/pages/Login"));
const Register = lazy(() => import("@/features/auth/pages/Register"));
const VerifyOTP = lazy(() => import("@/features/auth/pages/VerifyOTP"));
const Listings = lazy(() => import("@/features/listings/pages/Listings"));
const ListingDetail = lazy(() => import("@/features/listings/pages/ListingDetail"));
const CreateListing = lazy(() => import("@/features/listings/pages/CreateListing"));
const MyListings = lazy(() => import("@/features/listings/pages/MyListings"));
const Profile = lazy(() => import("@/features/profile/pages/Profile"));
const Settings = lazy(() => import("@/features/profile/pages/Settings"));
const Chats = lazy(() => import("@/features/chat/pages/Chats"));

function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-6xl font-bold text-indigo-500">404</h1>
      <p className="mt-4 text-xl text-gray-600 dark:text-gray-400">Page not found</p>
      <a href="/" className="mt-6 text-indigo-500 underline">Go home</a>
    </div>
  );
}

// Hide Footer on chat window (full-screen layout)
function AppLayout() {
  const location = useLocation();
  const isChatWindow = location.pathname.match(/^\/chats(\/.*)?$/);

  useEffect(() => {
    if (isChatWindow) {
      const previous = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = previous;
      };
    }

    document.body.style.overflow = "";
    return undefined;
  }, [isChatWindow]);

  return (
    <>
      {!isChatWindow && <LenisScroll />}
      <Toaster position="top-right" />
      <Navbar />
      <Suspense fallback={<ListingDetailSkeleton />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/login"
            element={<PublicOnlyRoute><Login /></PublicOnlyRoute>}
          />
          <Route
            path="/register"
            element={<PublicOnlyRoute><Register /></PublicOnlyRoute>}
          />
          <Route path="/verify-otp" element={<VerifyOTP />} />
          <Route path="/listings" element={<Listings />} />
          <Route path="/listings/:id" element={<ListingDetail />} />
          <Route path="/profile/:id" element={<Profile />} />
          <Route
            path="/create"
            element={<ProtectedRoute><CreateListing /></ProtectedRoute>}
          />
          <Route
            path="/my-listings"
            element={<ProtectedRoute><MyListings /></ProtectedRoute>}
          />
          <Route
            path="/settings"
            element={<ProtectedRoute><Settings /></ProtectedRoute>}
          />
          <Route
            path="/chats"
            element={<ProtectedRoute><Chats /></ProtectedRoute>}
          />
          <Route
            path="/chats/:chatId"
            element={<ProtectedRoute><Chats /></ProtectedRoute>}
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      {!isChatWindow && <Footer />}
    </>
  );
}

function App() {
  return (
    <ThemeContextProvider>
      <AuthProvider>
        <SocketProvider>
          <BrowserRouter>
            <AppLayout />
          </BrowserRouter>
        </SocketProvider>
      </AuthProvider>
    </ThemeContextProvider>
  );
}

export default App;
