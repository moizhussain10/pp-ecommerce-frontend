// src/components/Dashboard.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "../config/firebase";

// Importing Components and Constants
import TimeDisplay from "../components/TimeDisplay";
import CheckoutModal from "../components/CheckoutModal";
import UserProfile from "../components/UserProfile";
import {
  BASE_API_URL,
  TARGET_WORK_HOURS,
  CHECKIN_CUTOFF_HOUR,
  CHECKIN_CUTOFF_MINUTE,
  CHECKOUT_TARGET_HOUR,
  CHECKOUT_TARGET_MINUTE,
  HALFDAY_CUTOFF_HOUR,
  HALFDAY_CUTOFF_MINUTE,
} from "../constants";

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

  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const seconds = totalSeconds % 60;
    const minutes = Math.floor(totalSeconds / 60) % 60;
    const hours = Math.floor(totalSeconds / 3600);

    const pad = (num) => String(num).padStart(2, "0");
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }; // --- Calculation Functions (Kept same) ---

  const calculateExpectedCheckout = (checkinTime) => {
    if (!checkinTime) return "N/A";

    const checkoutTime = new Date(checkinTime);
    checkoutTime.setHours(checkoutTime.getHours() + TARGET_WORK_HOURS);

    return (
      checkoutTime.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }) +
      " (" +
      checkoutTime.toLocaleDateString() +
      ")"
    );
  };

  const calculateRemainingTimeTo5AM = () => {
    if (!startTime) {
      return {
        message: `Target ${TARGET_WORK_HOURS}h 00m 00s`,
        isOvershot: false,
      };
    }

    const now = new Date();

    const targetTime = new Date(startTime);
    targetTime.setHours(CHECKOUT_TARGET_HOUR, CHECKOUT_TARGET_MINUTE, 0, 0);

    if (startTime.getHours() >= CHECKOUT_TARGET_HOUR) {
      targetTime.setDate(targetTime.getDate() + 1);
    }

    const diffMs = targetTime.getTime() - now.getTime();

    const isOvershot = diffMs <= 0;

    const absDiffMs = Math.abs(diffMs);

    const totalSeconds = Math.floor(absDiffMs / 1000);
    const sec = totalSeconds % 60;
    const min = Math.floor(totalSeconds / 60) % 60;
    const hr = Math.floor(totalSeconds / 3600);

    const pad = (num) => String(num).padStart(2, "0");
    const timeStr = `${pad(hr)}h ${pad(min)}m ${pad(sec)}s`;

    if (isOvershot) {
      return {
        message: `00h 00m 00s (5 AM Closing Time Passed)`,
        isOvershot: true,
      };
    } else {
      return {
        message: `${timeStr} remaining till 5 AM`,
        isOvershot: false,
      };
    }
  };

  const fetchUserHistory = async (uid) => {
    try {
      const response = await fetch(`${BASE_API_URL}/history/${uid}`);
      if (!response.ok) throw new Error("Failed to fetch history.");

      const data = await response.json();
      setUserHistory(data);
    } catch (error) {
      console.error("History fetch failed:", error);
      setUserHistory([]);
    }
  }; // --- Auth & Status Check ---

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

  const checkUserStatus = async (uid) => {
    try {
      const response = await fetch(`${BASE_API_URL}/status/${uid}`);
      if (!response.ok) throw new Error("Failed to fetch status.");

      const data = await response.json();

      if (data.isCheckedIn) {
        const checkinTime = new Date(data.checkinTime);
        setStartTime(checkinTime);
        setIsCheckedIn(true);
        setActiveCheckinId(data.checkinId);

        const status = checkPunctuality(checkinTime);
        setPunctualityStatus(status);
      }
    } catch (error) {
      console.error("Status check failed:", error);
    } finally {
      setLoading(false);
    }
  }; // --- Timer Logic (Elapsed Time) ---

  useEffect(() => {
    if (isCheckedIn && startTime) {
      const updateTimes = () => {
        const now = new Date();
        const diff = now.getTime() - startTime.getTime();
        setElapsedTime(formatTime(diff));
      };

      updateTimes();
      intervalRef.current = setInterval(updateTimes, 1000);
    } else if (!isCheckedIn) {
      clearInterval(intervalRef.current);
      setElapsedTime("00:00:00");
    }

    return () => clearInterval(intervalRef.current);
  }, [isCheckedIn, startTime]); // --- Punctuality Check (Late/Not Late) ---

const checkPunctuality = (checkinTime) => {
    
    // 1. Shift Start/Punctuality Time (8:00 PM / 20:00) ki Date calculate karein.
    
    const targetPunctualityTime = new Date(checkinTime);

    // Agar check-in 12 AM (00:00) se 5 AM (CHECKOUT_TARGET_HOUR) ke darmiyan hua hai,
    // toh humein Late Cutoff (8 PM) ko pichle din (Yesterday) par set karna hoga.
    if (checkinTime.getHours() < CHECKOUT_TARGET_HOUR) { 
        targetPunctualityTime.setDate(targetPunctualityTime.getDate() - 1);
    }
    
    // Target ko fix 8:00 PM (CHECKIN_CUTOFF_HOUR:CHECKIN_CUTOFF_MINUTE) par set karein.
    // Misal: Dec 11, 8:00 PM
    targetPunctualityTime.setHours(CHECKIN_CUTOFF_HOUR, CHECKIN_CUTOFF_MINUTE, 0, 0);

    
    // 2. Comparison: 
    // Agar check-in ka actual time (Dec 12, 1:44 AM)
    // Target time (Dec 11, 8:00 PM) se Bada hai, toh woh LATE hai.
    if (checkinTime.getTime() > targetPunctualityTime.getTime()) {
      return "Late";
    } 
    else {
      return "Not Late";
    }
  }; // --- NEW: Half Day Check Function ---

  const checkHalfDayStatus = (checkinTime) => {
    const checkinHours = checkinTime.getHours();
    const checkinMinutes = checkinTime.getMinutes();
    // Logic: Agar check-in 12:00 AM (00:00) ya uske baad hua hai.
    // NOTE: Is check mein, agar 12:00 AM ka cutoff use ho raha hai, toh HALFDAY_CUTOFF_HOUR = 0 hona chahiye.
    if (
      checkinHours > HALFDAY_CUTOFF_HOUR ||
      (checkinHours === HALFDAY_CUTOFF_HOUR &&
        checkinMinutes >= HALFDAY_CUTOFF_MINUTE)
    ) {
      return "HalfDay"; // Agar 12 baje (00:00) ke baad check-in hua
    }
    return "FullDay"; // Agar 12 baje se pehle check-in hua
  }; // --- Checkin/Checkout Handlers ---

 async function handleCheckin() {
    // ... (User check, now date, currentHour, currentMinute remains same) ...

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const uniqueId = user.uid + "_" + now.getTime();
    
    // --- SHIFT ACTIVE TIME CHECK ---
    
    // Shift Start Time: 8:00 PM (20:00)
    const SHIFT_START_HOUR = CHECKIN_CUTOFF_HOUR;
    
    // Shift End Time (For blocking): 5:00 AM (05:00)
    // Hum check kar rahe hain ke kya current time 'resting period' (5 AM se 8 PM) mein hai.

    const isDuringShift = (currentHour >= SHIFT_START_HOUR) || (currentHour < CHECKOUT_TARGET_HOUR);
    
    // Agar current time 5 AM (05:00) aur 8 PM (20:00) ke beech hai, toh check-in block hoga
    const isRestrictedTime = (currentHour >= CHECKOUT_TARGET_HOUR && currentHour < SHIFT_START_HOUR);

    // 🔴 BLOCKING LOGIC: If it's a restricted time (e.g., 6 AM to 7:59 PM)
    if (isRestrictedTime) {
         alert(
            `🚨 Alert: Shift is closed between ${CHECKOUT_TARGET_HOUR} AM and ${CHECKIN_CUTOFF_HOUR} PM. 
            Aap abhi Check In nahi kar sakte. Kripya 8:00 PM par prayas karein.`
        );
        return;
    }

    // 🔴 Punctuality Check: Block check-in if before 8:00 PM sharp (This only runs if it's 8 PM or later OR 5 AM or earlier)
    // NOTE: Humne is check ko upar wale check se alag kar diya hai.
    
    // Agar time 8:00 PM hai, toh sirf minute check hoga.
    if (currentHour === CHECKIN_CUTOFF_HOUR && currentMinute < CHECKIN_CUTOFF_MINUTE)
    {
         alert(
            `🚨 Alert: Aapki shift 8:00 PM (20:00) se pehle shuru nahi ho sakti. Kripya ${CHECKIN_CUTOFF_MINUTE} minute tak intezar karein.`
        );
        return;
    }
    const status = checkPunctuality(now);
    setPunctualityStatus(status);

    // 2. Half Day Status (NEW)
    const halfDayStatus = checkHalfDayStatus(now);

    const checkinData = {
      userId: user.uid,
      timestamp: now.toISOString(),
      checkinId: uniqueId,
      punctualityStatus: status,
      halfDayStatus: halfDayStatus, // <-- Half Day Status Bheja Gaya
    };

    try {
      const response = await fetch(`${BASE_API_URL}/checkin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(checkinData),
      });

      if (response.status === 409) {
        alert("Error: Aap pehle se hi Check In hain. Kripya Check Out karein.");
        checkUserStatus(user.uid);
        return;
      }

      if (!response.ok) {
        throw new Error(`Checkin Failed: ${response.status}`);
      }

      const result = await response.json();

      setStartTime(now);
      setIsCheckedIn(true);
      setActiveCheckinId(result.record.checkinId);

      alert(
        `Checkin Successful! Status: ${status}. Half Day Status: ${halfDayStatus}`
      );
    } catch (error) {
      console.error("Error during checkin:", error);
      alert(`Checkin Failed: ${error.message}`);
    }
  } // --- Checkout Handlers (Kept same) ---

  const handleCheckout = () => {
    setShowCheckoutModal(true);
  };

  async function confirmCheckout() {
    setShowCheckoutModal(false);

    if (!user || !user.uid || !activeCheckinId) {
      alert("Cannot checkout: Missing user or active session ID.");
      return;
    }

    const now = new Date();
    const checkoutData = {
      userId: user.uid,
      timestamp: now.toISOString(),
      checkinId: activeCheckinId,
    };

    try {
      const response = await fetch(`${BASE_API_URL}/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(checkoutData),
      });

      if (!response.ok) {
        throw new Error(`Checkout Failed: ${response.status}`);
      }

      console.log("Checkout successful:", await response.json());

      setIsCheckedIn(false);
      setStartTime(null);
      setActiveCheckinId(null);
      setPunctualityStatus(null);

      if (user) {
        fetchUserHistory(user.uid);
      }

      alert(`Checkout Successful! Saved in DB.`);
    } catch (error) {
      console.error("Error during checkout:", error);
      alert(`Checkout Failed: ${error.message}`);
    }
  }

  const cancelCheckout = () => {
    setShowCheckoutModal(false);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      if (typeof logout === "function") {
        logout(false);
      }
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      alert("Logout Failed: " + error.message);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
         Loading User Data... {" "}
      </div>
    );
  }

  const timeDetails = calculateRemainingTimeTo5AM();
  const expectedCheckout = calculateExpectedCheckout(startTime); // --- Render ---

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
  
      <UserProfile
        userEmail={user ? user.email : "Guest"}
        checkinTime={startTime}
        punctualityStatus={punctualityStatus}
        userHistory={userHistory}
      />
      
      <button
        onClick={isCheckedIn ? handleCheckout : handleCheckin}
        style={{
          padding: "15px 30px",
          fontSize: "20px",
          cursor: "pointer",
          backgroundColor: isCheckedIn ? "#dc3545" : "#28a745",
          color: "white",
          border: "none",
          borderRadius: "8px",
          transition: "background-color 0.2s",
          margin: "20px 0",
        }}
      >
       {isCheckedIn ? "Check Out" : "Check In"}{" "}
      </button>
      {" "}
      {isCheckedIn && (
        <TimeDisplay
          elapsedTime={elapsedTime}
          timeDetails={timeDetails}
          punctualityStatus={punctualityStatus}
        />
      )}
      {" "}
      <button
        style={{
          marginTop: "50px",
          padding: "10px 20px",
          fontSize: "1rem",
          cursor: "pointer",
          backgroundColor: "transparent",
          color: "#dc3545",
          border: "2px solid #dc3545",
          borderRadius: "5px",
        }}
        onClick={handleLogout}
      >
        🔓 Logout {" "}
      </button>
      {" "}
      {showCheckoutModal && (
        <CheckoutModal
          startTime={startTime}
          elapsedTime={elapsedTime}
          timeDetails={timeDetails}
          expectedCheckout={expectedCheckout}
          punctualityStatus={punctualityStatus}
          confirmCheckout={confirmCheckout}
          cancelCheckout={cancelCheckout}
        />
      )}
      {" "}
    </div>
  );
}

export default Dashboard;
