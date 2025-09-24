import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Logo from "../Photos/Logo.png";
import { useAuth } from "../context/AuthContext"; // Import useAuth
import ThemedModal from "../components/ThemedModal";

interface HeaderProps {
  setIsLoginModalOpen: React.Dispatch<React.SetStateAction<boolean>>; // Re-added
  setIsSignUpModalOpen: React.Dispatch<React.SetStateAction<boolean>>; // Re-added
}

const Header: React.FC<HeaderProps> = ({ setIsLoginModalOpen, setIsSignUpModalOpen }) => { // Re-added props
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth(); // Use the auth context
  const [symposiumStatus, setSymposiumStatus] = useState<any[]>([]);
  const [isSymposiumModalOpen, setIsSymposiumModalOpen] = useState(false);
  const [enigmaDate, setEnigmaDate] = useState("");
  const [carteblancheDate, setCarteblancheDate] = useState("");

  useEffect(() => {
    const fetchSymposiumStatus = async () => {
      try {
        const response = await fetch("/api/symposium/status");
        const data = await response.json();
        setSymposiumStatus(data);
      } catch (error) {
        console.error("Error fetching symposium status:", error);
      }
    };

    if (user?.role === "admin") {
      fetchSymposiumStatus();
    }
  }, [user]);

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

  const handleStartSymposium = async (symposiumName: string, date: string) => {
    try {
      const response = await fetch("/api/symposium/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ symposiumName, startDate: date }),
      });
      if (response.ok) {
        alert(`${symposiumName} has been started.`);
        // Refresh status
        const statusResponse = await fetch("/api/symposium/status");
        const data = await statusResponse.json();
        setSymposiumStatus(data);
      } else {
        alert(`Failed to start ${symposiumName}.`);
      }
    } catch (error) {
      console.error(`Error starting ${symposiumName}:`, error);
      alert(`Error starting ${symposiumName}.`);
    }
  };

  const handleStopSymposium = async (symposiumName: string) => {
    try {
      const response = await fetch("/api/symposium/stop", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ symposiumName }),
      });
      if (response.ok) {
        alert(`${symposiumName} has been stopped.`);
        // Refresh status
        const statusResponse = await fetch("/api/symposium/status");
        const data = await statusResponse.json();
        setSymposiumStatus(data);
      } else {
        alert(`Failed to stop ${symposiumName}.`);
      }
    } catch (error) {
      console.error(`Error stopping ${symposiumName}:`, error);
      alert(`Error stopping ${symposiumName}.`);
    }
  };

  const getSymposiumStatus = (symposiumName: string) => {
    const symposium = symposiumStatus.find(s => s.symposiumName === symposiumName);
    return symposium ? symposium.isOpen === 1 : false;
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
          {user?.role !== 'admin' && ( // Check if user is NOT admin
            <>
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
            </>
          )}
          {user?.role === 'admin' ? (
            <a
              href="/admin"
              onClick={(e) => { e.preventDefault(); navigate("/admin"); }}
              className="text-white hover:text-purple-400 transition"
            >
              Managements
            </a>
          ) : (
            <a
              href="#events"
              onClick={(e) => handleNavClick(e, "#events")}
              className="text-white hover:text-purple-400 transition"
            >
              Events
            </a>
          )}
          <a
            href="/placements"
            onClick={(e) => { e.preventDefault(); navigate("/placements"); }}
            className="text-white hover:text-purple-400 transition"
          >
            Placements
          </a>
          {user?.role === 'admin' && (
            <>
              <button
                onClick={() => setIsSymposiumModalOpen(true)}
                className="text-white hover:text-purple-400 transition"
              >
                Symposium Control
              </button>
              <ThemedModal
                isOpen={isSymposiumModalOpen}
                onClose={() => setIsSymposiumModalOpen(false)}
                title="Symposium Control"
                hideDefaultFooter={true}
              >
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-white">Enigma</h3>
                    {getSymposiumStatus("Enigma") ? (
                      <button
                        onClick={() => handleStopSymposium("Enigma")}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md"
                      >
                        Stop
                      </button>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <input
                          type="date"
                          className="bg-gray-700 p-1 rounded-md text-white"
                          value={enigmaDate}
                          onChange={(e) => setEnigmaDate(e.target.value)}
                        />
                        <button
                          onClick={() => handleStartSymposium("Enigma", enigmaDate)}
                          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md"
                        >
                          Start
                        </button>
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Carteblanche</h3>
                    {getSymposiumStatus("Carteblanche") ? (
                      <button
                        onClick={() => handleStopSymposium("Carteblanche")}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md"
                      >
                        Stop
                      </button>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <input
                          type="date"
                          className="bg-gray-700 p-1 rounded-md text-white"
                          value={carteblancheDate}
                          onChange={(e) => setCarteblancheDate(e.target.value)}
                        />
                        <button
                          onClick={() => handleStartSymposium("Carteblanche", carteblancheDate)}
                          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md"
                        >
                          Start
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </ThemedModal>
            </>
          )}
          {user && user.role !== 'admin' && (
            <a
              href="/enrolled-events"
              onClick={(e) => { e.preventDefault(); navigate("/enrolled-events"); }}
              className="text-white hover:text-purple-400 transition"
            >
              My Events
            </a>
          )}
          {user && user.role !== 'admin' && (
            <a
              href="/cart"
              onClick={(e) => { e.preventDefault(); navigate("/cart"); }}
              className="text-white hover:text-purple-400 transition"
            >
              Cart
            </a>
          )}
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