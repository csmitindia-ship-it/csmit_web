import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App.tsx";
import "./index.css";
import { AuthProvider } from "./context/AuthContext.tsx";

// Import the new pages
import AdminPage from "./AdminPage.tsx";
import PendingExperiencesPage from "./pages/PendingExperiencesPage.tsx";
import ApprovedExperiencesPage from "./pages/ApprovedExperiencesPage.tsx";
import ManageEventsPage from "./pages/ManageEventsPage.tsx";
import AdminEventsDisplayPage from "./pages/AdminEventsDisplayPage.tsx"; // New import
import PlacementsPage from "./placements/PlacementsPage";
import LoginWrapper from "./Login_Sign/LoginWrapper"; // Import LoginWrapper
import SignUpPage from "./Login_Sign/SignUpPage"; // Import SignUpPage
import ForgotPassword from "./Login_Sign/Forgot_Pass"; // Import ForgotPassword
import EventsPage from "./pages/EventsPage.tsx";
import RegistrationPage from "./pages/RegistrationPage.tsx";

import ProtectedRoute from "./ProtectedRoute.tsx";
import UnprotectedRoute from "./UnprotectedRoute.tsx";

const rootElement = document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<ProtectedRoute role="admin" />}>
              <Route path="/admin" element={<AdminPage />}>
                <Route path="manage-events" element={<ManageEventsPage />} />
                <Route path="pending-experiences" element={<PendingExperiencesPage />} />
                <Route path="approved-experiences" element={<ApprovedExperiencesPage />} />
                <Route path="events-display" element={<AdminEventsDisplayPage />} /> {/* New route */}
              </Route>
            </Route>

            <Route path="/placements" element={<PlacementsPage />} />
            
            <Route element={<UnprotectedRoute />}>
              <Route path="/login" element={<LoginWrapper />} />
              <Route path="/signup" element={<SignUpPage isOpen={false} onClose={() => {}} onSwitchToLogin={() => {}} />} />
              <Route path="/forgot-password" element={<ForgotPassword isOpen={false} onClose={() => {}} onSwitchToLogin={() => {}} />} />
            </Route>
            <Route path="/" element={<App />} />

            <Route path="/events" element={<EventsPage />} />
            <Route path="/registration" element={<RegistrationPage />} />
            
            
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </StrictMode>
  );
}
