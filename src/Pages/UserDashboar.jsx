import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "../Config/firebase.js";
import TimeDisplay from "../components/TimeDisplay";
import CheckoutModal from "../components/CheckoutModal";
import UserProfile from "../components/UserProfile";
import { BASE_API_URL, TARGET_WORK_HOURS, CHECKOUT_TARGET_HOUR, CHECKOUT_TARGET_MINUTE } from "../constants";

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState("00:00:00");
  const [activeCheckinId, setActiveCheckinId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [userHistory, setUserHistory] = useState([]);
  const intervalRef = useRef(null);

  // Safely calculate time details
  const getSafeTimeDetails = () => {
    const defaultData = { message: "Calculating...", isOvershot: false };
    if (!startTime) return defaultData;

    try {
      const now = new Date();
      const targetTime = new Date(startTime);
      targetTime.setHours(CHECKOUT_TARGET_HOUR, CHECKOUT_TARGET_MINUTE, 0, 0);
      if (startTime.getHours() >= CHECKOUT_TARGET_HOUR) targetTime.setDate(targetTime.getDate() + 1);

      const diffMs = targetTime.getTime() - now.getTime();
      const isOvershot = diffMs <= 0;
      const absDiffMs = Math.abs(diffMs);
      const hr = Math.floor(absDiffMs / 3600000);
      const min = Math.floor((absDiffMs % 3600000) / 60000);
      const sec = Math.floor((absDiffMs % 60000) / 1000);

      return {
        message: isOvershot ? "Shift Over (5 AM Passed)" : `${hr}h ${min}m ${sec}s remaining`,
        isOvershot
      };
    } catch (e) {
      return defaultData;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        checkUserStatus(currentUser.uid);
        fetchUserHistory(currentUser.uid);
      } else {
        setLoading(false);
        navigate("/login");
      }
    });
    return () => unsubscribe();
  }, []);

  const checkUserStatus = async (uid) => {
    try {
      const res = await fetch(`${BASE_API_URL}/status/${uid}`);
      const data = await res.json();
      if (data.isCheckedIn) {
        setStartTime(new Date(data.checkinTime));
        setActiveCheckinId(data.checkinId);
        setIsCheckedIn(true);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fetchUserHistory = async (uid) => {
    try {
      const res = await fetch(`${BASE_API_URL}/history/${uid}`);
      if (res.ok) setUserHistory(await res.json());
    } catch (e) { console.error(e); }
  };

  const handleCheckin = async () => {
    const now = new Date();
    const cId = `ATT-${Date.now()}`;
    const payload = {
      userId: user.uid,
      email: user.email,
      timestamp: now.toISOString(),
      checkinId: cId,
      status: "CheckedIn",
      punctualityStatus: "Present",
      halfDayStatus: "FullDay"
    };

    try {
      const res = await fetch(`${BASE_API_URL}/checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setStartTime(now);
        setActiveCheckinId(cId);
        setIsCheckedIn(true);
      }
    } catch (e) { alert("Checkin Failed"); }
  };

  // --- FIXED CHECKOUT FUNCTION ---
  const confirmCheckout = async () => {
    if (!activeCheckinId) return alert("No active check-in ID found!");

    try {
      const res = await fetch(`${BASE_API_URL}/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          userId: user.uid, 
          checkinId: activeCheckinId, 
          timestamp: new Date().toISOString() 
        })
      });

      if (res.ok) {
        clearInterval(intervalRef.current); // Stop timer immediately
        setIsCheckedIn(false);
        setStartTime(null);
        setActiveCheckinId(null);
        setShowCheckoutModal(false);
        fetchUserHistory(user.uid);
        alert("Checkout Successful!");
      } else {
        const err = await res.json();
        alert(`Error: ${err.message || "Checkout failed"}`);
      }
    } catch (e) {
      alert("Network Error during checkout");
    }
  };

  useEffect(() => {
    if (isCheckedIn && startTime) {
      intervalRef.current = setInterval(() => {
        const diff = new Date().getTime() - startTime.getTime();
        const hrs = Math.floor(diff / 3600000);
        const mins = Math.floor((diff % 3600000) / 60000);
        const secs = Math.floor((diff % 60000) / 1000);
        setElapsedTime(`${String(hrs).padStart(2,'0')}:${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`);
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isCheckedIn, startTime]);

  if (loading) return <div style={{textAlign: "center", marginTop: "50px"}}>Loading...</div>;

  const currentDetails = getSafeTimeDetails();

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <UserProfile userEmail={user?.email} checkinTime={startTime} userHistory={userHistory} />
      
      <button 
        onClick={isCheckedIn ? () => setShowCheckoutModal(true) : handleCheckin}
        style={{ backgroundColor: isCheckedIn ? "#dc3545" : "#28a745", color: "white", padding: "15px 30px", borderRadius: "8px", border: "none", fontSize: "1.2rem", cursor: "pointer", margin: "20px" }}
      >
        {isCheckedIn ? "Check Out" : "Check In"}
      </button>

      {isCheckedIn && (
        <TimeDisplay 
          elapsedTime={elapsedTime} 
          timeDetails={currentDetails} 
        />
      )}

      {showCheckoutModal && (
        <CheckoutModal 
          confirmCheckout={confirmCheckout} 
          cancelCheckout={() => setShowCheckoutModal(false)} 
          elapsedTime={elapsedTime}
          // Pass any other data your modal needs safely
          timeDetails={currentDetails}
        />
      )}

      <button onClick={() => signOut(auth)} style={{ display: "block", margin: "40px auto", color: "#666", background: "none", border: "1px solid #ccc", padding: "5px 15px", borderRadius: "5px", cursor: "pointer" }}>Logout</button>
    </div>
  );
}

export default Dashboard;