import React, { StrictMode } from "react";
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
import PlacementsPage from "./placements/PlacementsPage";
import LoginPage from "./Login_Sign/LoginPage"; // Import LoginPage
import SignUpPage from "./Login_Sign/SignUpPage"; // Import SignUpPage
import ForgotPassword from "./Login_Sign/Forgot_Pass"; // Import ForgotPassword
import EventsPage from "./pages/EventsPage.tsx";

const rootElement = document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/admin" element={<AdminPage />}>
              <Route path="manage-events" element={<ManageEventsPage />} />
              <Route path="pending-experiences" element={<PendingExperiencesPage />} />
              <Route path="approved-experiences" element={<ApprovedExperiencesPage />} />
            </Route>
            <Route path="/placements" element={<PlacementsPage />} />
            <Route path="/login" element={<LoginPage />} /> {/* New Login Route */}
            <Route path="/signup" element={<SignUpPage />} /> {/* New SignUp Route */}
            <Route path="/forgot-password" element={<ForgotPassword />} /> {/* New Forgot Password Route */}
            <Route path="/events" element={<EventsPage />} />
            <Route path="/" element={<App />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </StrictMode>
  );
}
