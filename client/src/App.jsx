import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeContextProvider } from "./context/ThemeContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import LenisScroll from "./components/LenisScroll";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Listings from "./pages/Listings";
import CreateListing from "./pages/CreateListing";

function App() {
  return (
    <ThemeContextProvider>
      <AuthProvider>
        <BrowserRouter>
          <LenisScroll />
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/listings" element={<Listings />} />
            <Route path="/create" element={<CreateListing />} />
          </Routes>
          <Footer />
        </BrowserRouter>
      </AuthProvider>
    </ThemeContextProvider>
  );
}

export default App;
