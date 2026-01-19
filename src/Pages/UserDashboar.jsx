import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "../Config/firebase.js";

// Components & Constants
import TimeDisplay from "../components/TimeDisplay";
import CheckoutModal from "../components/CheckoutModal";
import UserProfile from "../components/UserProfile";
import {
  BASE_API_URL,
  TARGET_WORK_HOURS,
  CHECKIN_CUTOFF_HOUR,
  CHECKIN_CUTOFF_MINUTE,
  CHECKOUT_TARGET_HOUR,
  CHECKOUT_TARGET_MINUTE
} from "../constants";

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
  const [punctualityStatus, setPunctualityStatus] = useState("Not Late");

  const intervalRef = useRef(null);

  // --- 1. Late Calculation Logic ---
  const calculatePunctuality = (checkinTime) => {
    const targetPunctualityTime = new Date(checkinTime);

    // Agar check-in 12 AM se 5 AM ke darmiyan hai, toh cutoff pichle din ka 8 PM hoga
    if (checkinTime.getHours() < CHECKOUT_TARGET_HOUR) {
      targetPunctualityTime.setDate(targetPunctualityTime.getDate() - 1);
    }

    // Target fix 8:00 PM (CHECKIN_CUTOFF_HOUR = 20)
    targetPunctualityTime.setHours(CHECKIN_CUTOFF_HOUR, CHECKIN_CUTOFF_MINUTE, 0, 0);

    return checkinTime.getTime() > targetPunctualityTime.getTime() ? "Late" : "Not Late";
  };

  // --- 2. Safe Time Details for Display & Modal ---
  const currentDetails = useMemo(() => {
    const defaultData = { message: "Calculating...", isOvershot: false };
    if (!startTime) return defaultData;

    try {
      const now = new Date();
      const targetTime = new Date(startTime);
      targetTime.setHours(CHECKOUT_TARGET_HOUR, CHECKOUT_TARGET_MINUTE, 0, 0);

      if (startTime.getHours() >= CHECKOUT_TARGET_HOUR) {
        targetTime.setDate(targetTime.getDate() + 1);
      }

      const diffMs = targetTime.getTime() - now.getTime();
      const isOvershot = diffMs <= 0;
      const absDiffMs = Math.abs(diffMs);

      const hr = Math.floor(absDiffMs / 3600000);
      const min = Math.floor((absDiffMs % 3600000) / 60000);
      const sec = Math.floor((absDiffMs % 60000) / 1000);

      return {
        message: isOvershot ? "Shift Ended (5 AM Passed)" : `${hr}h ${min}m ${sec}s remaining`,
        isOvershot
      };
    } catch (e) {
      return defaultData;
    }
  }, [startTime, elapsedTime]);

  const expectedCheckout = useMemo(() => {
    if (!startTime) return "N/A";
    const target = new Date(startTime);
    target.setHours(target.getHours() + TARGET_WORK_HOURS);
    return target.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  }, [startTime]);

  // --- 3. Auth & Database Sync ---
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
  }, [navigate]);

  const checkUserStatus = async (uid) => {
    try {
      // Humne URL mein UID bhej di taake backend sirf isi user ka status de
      const res = await fetch(`${BASE_API_URL}/status/${uid}`);
      const data = await res.json();

      if (data.isCheckedIn) {
        setStartTime(new Date(data.checkinTime));
        setActiveCheckinId(data.checkinId);
        setIsCheckedIn(true);
        setPunctualityStatus(data.punctualityStatus || "Not Late");
      } else {
        setIsCheckedIn(false);
        setStartTime(null);
      }
    } catch (e) {
      console.error("Sync Error:", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserHistory = async (uid) => {
    try {
      const res = await fetch(`${BASE_API_URL}/history/${uid}`);
      if (res.ok) setUserHistory(await res.json());
    } catch (e) { console.error("History Fetch Error:", e); }
  };

  // --- 4. Handlers ---
const handleCheckin = async () => {
  if (!user) return;
  const now = new Date();
  const cId = `ATT-${Date.now()}`;
  const pStatus = calculatePunctuality(now);

  // FIELD NAMES MUST MATCH BACKEND SCHEMA
  const payload = {
    userId: user.uid,
    email: user.email,
    checkinTime: now.toISOString(), // Isay 'timestamp' se badal kar 'checkinTime' kar diya
    checkinId: cId,
    status: "CheckedIn",
    punctualityStatus: pStatus,
    halfDayStatus: "FullDay"
  };

  try {
    const res = await fetch(`${BASE_API_URL}/checkin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json(); // Data ko yahan extract karein

    if (res.status === 400) {
      alert(data.message); 
      return;
    }

    if (res.ok) {
      setStartTime(now);
      setActiveCheckinId(cId);
      setIsCheckedIn(true);
      setPunctualityStatus(pStatus);
      alert("Check-in Successful!");
    } else {
      // Agar koi aur error hai (like 500)
      alert(data.message || "Server Error occurred");
    }
  } catch (e) { 
    console.error("Check-in Error:", e);
    alert("Check-in Failed: Network or Server Error"); 
  }
};

  const confirmCheckout = async () => {
    if (!activeCheckinId) return;

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
        clearInterval(intervalRef.current);
        setIsCheckedIn(false);
        setStartTime(null);
        setActiveCheckinId(null);
        setShowCheckoutModal(false);
        fetchUserHistory(user.uid);
        alert("Checked Out Successfully!");
      }
    } catch (e) { alert("Checkout Error"); }
  };

  // Timer logic
  useEffect(() => {
    if (isCheckedIn && startTime) {
      intervalRef.current = setInterval(() => {
        const diff = new Date().getTime() - startTime.getTime();
        const hrs = Math.floor(diff / 3600000);
        const mins = Math.floor((diff % 3600000) / 60000);
        const secs = Math.floor((diff % 60000) / 1000);
        setElapsedTime(`${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`);
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isCheckedIn, startTime]);

  if (loading) return <div style={{ textAlign: "center", marginTop: "50px" }}>Authenticating...</div>;

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <UserProfile
        userEmail={user?.email}
        checkinTime={startTime}
        userHistory={userHistory}
        punctualityStatus={punctualityStatus}
      />

      <button
        onClick={isCheckedIn ? () => setShowCheckoutModal(true) : handleCheckin}
        style={{
          backgroundColor: isCheckedIn ? "#dc3545" : "#28a745",
          color: "white", padding: "15px 30px", borderRadius: "8px",
          border: "none", fontSize: "1.2rem", cursor: "pointer", margin: "20px"
        }}
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
          startTime={startTime}
          timeDetails={currentDetails}
          expectedCheckout={expectedCheckout}
          punctualityStatus={punctualityStatus}
        />
      )}

      <button
        onClick={() => signOut(auth)}
        style={{ display: "block", margin: "40px auto", color: "#666", background: "none", border: "1px solid #ccc", padding: "5px 15px", borderRadius: "5px", cursor: "pointer" }}
      >
        Logout
      </button>
    </div>
  );
}

export default Dashboard;