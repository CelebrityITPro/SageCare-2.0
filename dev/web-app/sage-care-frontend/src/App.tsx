// import "./App.css";
import React from "react";
import Signup from "./pages/Signup";
import { Route, Routes } from "react-router-dom";
import { ROUTES } from "./routes";
import DashboardLayout from "./layouts/DashboardLayout";
import Home from "./pages/Home";

function App() {
  return (
    <>
      <Routes>
        {/* AUTH Routes */}
        <Route path={ROUTES.SIGNUP} element={<Signup />} />

        {/* Dashoard */}
        <Route path={ROUTES.HOME} element={<DashboardLayout />}>
          <Route index element={<Home />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
