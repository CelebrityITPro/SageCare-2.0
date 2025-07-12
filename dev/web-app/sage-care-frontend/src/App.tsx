// import "./App.css";
import React from "react";
import Signup from "./pages/Signup";
import { Route, Routes, Navigate } from "react-router-dom";
import { ROUTES } from "./routes";
import DashboardLayout from "./layouts/DashboardLayout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import VideoConsultation from "./pages/VideoConsultation";
import UserProfile from "./pages/UserProfile";
import Appointments from "./pages/Appointments";
import Nutrition from "./pages/Nutrition";
import Settings from "./pages/Settings";
import SessionManager from "./SessionManager";

function App() {
  return (
    <>
      <SessionManager />
      <Routes>
        {/* Root redirect to signup */}
        <Route path="/" element={<Navigate to={ROUTES.SIGNUP} replace />} />

        {/* AUTH Routes */}
        <Route path={ROUTES.SIGNUP} element={<Signup />} />
        <Route path={ROUTES.LOGIN} element={<Login />} />

        {/* Video Consultation - Outside Dashboard Layout */}
        <Route path={ROUTES.VIDEO_CONSULTATION} element={<VideoConsultation />} />

        {/* Dashboard */}
        <Route path={ROUTES.HOME} element={<DashboardLayout />}>
          <Route index element={<Home />} />
          <Route path={ROUTES.APPOINTMENTS} element={<Appointments />} />
          <Route path={ROUTES.NUTRITION} element={<Nutrition />} />
          <Route path={ROUTES.SETTINGS} element={<Settings />} />
        </Route>

        <Route path="/profile" element={<UserProfile />} />
      </Routes>
    </>
  );
}

export default App;
