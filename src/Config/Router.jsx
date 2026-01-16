import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import Signup from "../Pages/Signup";
import Login from "../Pages/Login";
import Dashboard from "../Pages/UserDashboar"; // Spelling check: UserDashboard?
import AdminPanel from "../Pages/AdminPanel"; // Apna Admin Page import karein
import { useEffect, useState } from "react";
import { onAuthStateChanged, auth } from "../Config/firebase.js";
import UserDetails from "../Pages/UserDetails.jsx";

function AppRouter() {
  const [user, setUser] = useState(null); // Boolean ki jagah null rakha hai
  const [loading, setLoading] = useState(true); // Firebase loading check karne ke liye

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser); // Poora user object save karein (email isme hota hai)
      setLoading(false);
    });
    return () => unsubscribe(); // Cleanup function
  }, []);

  // Jab tak Firebase check kar raha hai, tab tak loading dikhao
  if (loading) return <div style={{textAlign: 'center', marginTop: '50px'}}>Loading...</div>;

  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC ROUTES & AUTO REDIRECT */}
        <Route 
          path="/" 
          element={
            !user ? <Signup /> : 
            (user.email === "admin@gmail.com" ? <Navigate to="/admin" /> : <Navigate to="/dashboard" />)
          } 
        />

        <Route 
          path="/login" 
          element={
            !user ? <Login /> : 
            (user.email === "admin@gmail.com" ? <Navigate to="/admin" /> : <Navigate to="/dashboard" />)
          } 
        />

        {/* USER DASHBOARD - Sirf normal users ke liye */}
        <Route 
          path="/dashboard" 
          element={
            user && user.email !== "admin@gmail.com" ? <Dashboard /> : <Navigate to="/login" />
          } 
        />

        {/* ADMIN PANEL - Sirf admin@gmail.com ke liye */}
        <Route 
          path="/admin" 
          element={
            user && user.email === "admin@gmail.com" ? <AdminPanel /> : <Navigate to="/login" />
          } 
        />

        <Route path="/admin/user/:email" element={<UserDetails />} />

        {/* 404/Fallback */}
        <Route path="*" element={<Navigate to="/" />} />

      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;