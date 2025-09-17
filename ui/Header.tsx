import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Logo from "../Photos/Logo.png";
import { useAuth } from "../context/AuthContext"; // Import useAuth

interface HeaderProps {
  setIsLoginModalOpen: React.Dispatch<React.SetStateAction<boolean>>; // Re-added
  setIsSignUpModalOpen: React.Dispatch<React.SetStateAction<boolean>>; // Re-added
}

const Header: React.FC<HeaderProps> = ({ setIsLoginModalOpen, setIsSignUpModalOpen }) => { // Re-added props
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth(); // Use the auth context

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    if (location.pathname !== "/") {
      // Navigate to homepage with hash
      navigate(`/${targetId}`);
    } else {
      // Scroll to section smoothly
      const element = document.getElementById(targetId.substring(1)); // remove #
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/"); // Redirect to home after logout
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-gray-900 z-30 shadow-lg">
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo + Title */}
        <div className="flex items-center space-x-3">
          <img src={Logo} alt="CSMIT Logo" className="h-10 w-auto rounded-md" />
          <span
            className="text-2xl font-bold text-white"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            CSMIT
          </span>
        </div>

        {/* Navigation Links */}
        <div className="hidden md:flex space-x-6">
          <a
            href="#home"
            onClick={(e) => handleNavClick(e, "#home")}
            className="text-white hover:text-purple-400 transition"
          >
            Home
          </a>
          <a
            href="#alumni"
            onClick={(e) => handleNavClick(e, "#alumni")}
            className="text-white hover:text-purple-400 transition"
          >
            Alumni
          </a>
          <a
            href="#about"
            onClick={(e) => handleNavClick(e, "#about")}
            className="text-white hover:text-purple-400 transition"
          >
            About
          </a>
          <a
            href="#events"
            onClick={(e) => handleNavClick(e, "#events")}
            className="text-white hover:text-purple-400 transition"
          >
            Events
          </a>
          <a
            href="/placements"
            onClick={() => navigate("/placements")}
            className="text-white hover:text-purple-400 transition"
          >
            Placements
          </a>
        </div>

        {/* Login / Signup / User Info */}
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <button
                onClick={() => {
                  if (user.role === 'admin') {
                    navigate('/admin');
                  } else if (user.role === 'student') {
                    navigate('/student-dashboard'); // Assuming a student dashboard route
                  }
                }}
                className="px-4 py-2 text-sm border border-purple-400 text-purple-400 rounded-md hover:bg-purple-400 hover:text-black transition"
              >
                {user.role === 'admin' ? 'Admin' : user.name || user.email}
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm bg-red-500 text-white rounded-md hover:bg-red-600 transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsLoginModalOpen(true)} // Changed to set state
                className="px-4 py-2 text-sm border border-purple-400 text-purple-400 rounded-md hover:bg-purple-400 hover:text-black transition"
              >
                Login
              </button>
              <button
                onClick={() => setIsSignUpModalOpen(true)} // Changed to set state
                className="px-4 py-2 text-sm bg-purple-500 text-white rounded-md hover:bg-purple-600 transition"
              >
                Sign Up
              </button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;