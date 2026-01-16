import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "../Config/firebase.js";
import TimeDisplay from "../components/TimeDisplay";
import CheckoutModal from "../components/CheckoutModal";
import UserProfile from "../components/UserProfile";
import { BASE_API_URL } from "../constants";

function Dashboard({ logout }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState("00:00:00");
  const [activeCheckinId, setActiveCheckinId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [punctualityStatus, setPunctualityStatus] = useState(null);
  const [userHistory, setUserHistory] = useState([]);
  const intervalRef = useRef(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        checkUserStatus(currentUser.uid);
        fetchUserHistory(currentUser.uid);
      } else {
        setUser(null);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchUserHistory = async (uid) => {
    try {
      const res = await fetch(`${BASE_API_URL}/history/${uid}`);
      if (res.ok) setUserHistory(await res.json());
    } catch (e) { console.error(e); }
  };

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

  const handleCheckin = async () => {
    if (!user) return;
    const now = new Date();
    const checkinId = `ATT-${Date.now()}`;
    const payload = {
      userId: user.uid,
      email: user.email,
      timestamp: now.toISOString(),
      checkinId,
      status: "CheckedIn",
      punctualityStatus: "Present", // Replace with your logic if needed
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
        setIsCheckedIn(true);
        setActiveCheckinId(checkinId);
        fetchUserHistory(user.uid);
      }
    } catch (e) { alert("Checkin Failed"); }
  };

  const confirmCheckout = async () => {
    const payload = { userId: user.uid, checkinId: activeCheckinId, timestamp: new Date().toISOString() };
    try {
      const res = await fetch(`${BASE_API_URL}/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setIsCheckedIn(false);
        setStartTime(null);
        fetchUserHistory(user.uid);
        setShowCheckoutModal(false);
      }
    } catch (e) { alert("Checkout Failed"); }
  };

  // Timer logic...
  useEffect(() => {
    if (isCheckedIn && startTime) {
      intervalRef.current = setInterval(() => {
        const diff = new Date().getTime() - startTime.getTime();
        const hrs = Math.floor(diff / 3600000);
        const mins = Math.floor((diff % 3600000) / 60000);
        const secs = Math.floor((diff % 60000) / 1000);
        setElapsedTime(`${String(hrs).padStart(2,'0')}:${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`);
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [isCheckedIn, startTime]);

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <UserProfile userEmail={user?.email} checkinTime={startTime} userHistory={userHistory} />
      <button 
        onClick={isCheckedIn ? () => setShowCheckoutModal(true) : handleCheckin}
        style={{ backgroundColor: isCheckedIn ? "red" : "green", color: "white", padding: "15px 30px", borderRadius: "8px", border: "none" }}
      >
        {isCheckedIn ? "Check Out" : "Check In"}
      </button>
      {isCheckedIn && <TimeDisplay elapsedTime={elapsedTime} />}
      <button onClick={() => { signOut(auth); navigate("/login"); }} style={{ display: "block", margin: "20px auto" }}>Logout</button>
      {showCheckoutModal && <CheckoutModal confirmCheckout={confirmCheckout} cancelCheckout={() => setShowCheckoutModal(false)} />}
    </div>
  );
}
export default Dashboard;