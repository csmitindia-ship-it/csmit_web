import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import HomePage from "./HomePage";
import { useAuth } from "./context/AuthContext";
import AdminPage from "./AdminPage.tsx";
import PendingExperiencesPage from "./pages/PendingExperiencesPage.tsx";
import ApprovedExperiencesPage from "./pages/ApprovedExperiencesPage.tsx";
import ManageEventsPage from "./pages/ManageEventsPage.tsx";
import AdminEventsDisplayPage from "./pages/AdminEventsDisplayPage.tsx";
import AccountDetailsPage from "./pages/AccountDetailsPage.tsx";
import PlacementsPage from "./placements/PlacementsPage";
import LoginWrapper from "./Login_Sign/LoginWrapper";
import SignUpPage from "./Login_Sign/SignUpPage";
import ForgotPassword from "./Login_Sign/Forgot_Pass";
import EventsPage from "./pages/EventsPage.tsx";
import RegistrationPage from "./pages/RegistrationPage.tsx";
import ProtectedRoute from "./ProtectedRoute.tsx";
import UnprotectedRoute from "./UnprotectedRoute.tsx";
import ViewEventRegistrationsPage from "./pages/ViewEventRegistrationsPage.tsx";
import AdminViewRegistrationsOverviewPage from "./pages/AdminViewRegistrationsOverviewPage.tsx";

export default function App() {
  const [showIntro, setShowIntro] = useState(sessionStorage.getItem('introSeen') !== 'true');
  const [currentLine, setCurrentLine] = useState(0);
  const [text, setText] = useState("");
  const { logout } = useAuth();

  const lines = [
    "Initializing... Starting Computer Society of MIT",
    "Loading Innovation Modules..."
  ];

  useEffect(() => {
    if (showIntro && currentLine < lines.length) {
      let i = 0;
      const interval = setInterval(() => {
        setText(lines[currentLine].slice(0, i));
        i++;
        if (i > lines[currentLine].length) {
          clearInterval(interval);
          setTimeout(() => {
            setCurrentLine((prev) => prev + 1);
            setText("");
          }, 800);
        }
      }, 70);
      return () => clearInterval(interval);
    }

    if (currentLine >= lines.length && showIntro) {
      const timeout = setTimeout(() => {
        setShowIntro(false);
        sessionStorage.setItem('introSeen', 'true');
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [showIntro, currentLine]);

  if (showIntro) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#1a1a1a_1px,transparent_1px)] [background-size:35px_35px] opacity-40"></div>
        <div className="relative z-10 bg-black/80 border border-green-500/40 rounded-lg shadow-lg shadow-green-500/20 p-6 font-mono text-green-400 text-lg max-w-2xl w-[90%]">
          {lines.slice(0, currentLine).map((line, idx) => (
            <p key={idx}>{line}</p>
          ))}
          {currentLine < lines.length && (
            <p>
              {text}
              <span className="animate-pulse">_</span>
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route element={<ProtectedRoute role="admin" />}>
        <Route path="/admin" element={<AdminPage />}>
          <Route path="manage-events" element={<ManageEventsPage />} />
          <Route path="pending-experiences" element={<PendingExperiencesPage />} />
          <Route path="approved-experiences" element={<ApprovedExperiencesPage />} />
          <Route path="events-display" element={<AdminEventsDisplayPage />} />
          <Route path="account-details" element={<AccountDetailsPage />} />
          <Route path="events/registrations/:eventId" element={<ViewEventRegistrationsPage />} />
          <Route path="view-registrations" element={<AdminViewRegistrationsOverviewPage />} />
        </Route>
      </Route>

      <Route path="/placements" element={<PlacementsPage />} />
      
      <Route element={<UnprotectedRoute />}>
        <Route path="/login" element={<LoginWrapper />} />
        <Route path="/signup" element={<SignUpPage isOpen={false} onClose={() => {}} onSwitchToLogin={() => {}} />} />
        <Route path="/forgot-password" element={<ForgotPassword isOpen={false} onClose={() => {}} onSwitchToLogin={() => {}} />} />
      </Route>
      <Route path="/" element={<HomePage />} />

      <Route path="/events" element={<EventsPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/registration" element={<RegistrationPage />} />
      </Route>
    </Routes>
  );
}