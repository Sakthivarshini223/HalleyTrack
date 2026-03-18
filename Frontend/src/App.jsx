import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./Components/Login";
import Register from "./Components/Register";
import AdminDashboard from "./Components/AdminDashboard";
import ConfigureDashboard from "./Components/ConfigureDashboard";
import Report from "./Components/Report";
import CreateCardPage from "./Components/CreateCardPage";
import UserDashboard from "./Components/UserDashboard";
import CartPage from "./Components/CartPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />{" "}
       
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/configure-dashboard" element={<ConfigureDashboard />} />
        <Route path="/reports" element={<Report />} />
        <Route path="/create-card" element={<CreateCardPage />} />
        <Route path="/user-dashboard" element={<UserDashboard />} />
        <Route path="/cart" element={<CartPage />} />
      </Routes>
    </Router>
  );
}

export default App;
