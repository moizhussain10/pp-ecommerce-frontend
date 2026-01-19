import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BASE_API_URL } from "../constants";

function UserDetails() {
  const { email } = useParams();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- Duration Calculate karne ka Function ---
  const calculateDuration = (checkin, checkout) => {
    if (!checkin || !checkout) return "—";
    
    const start = new Date(checkin);
    const end = new Date(checkout);
    const diffMs = end - start; // Milliseconds ka farq

    if (diffMs < 0) return "Invalid";

    const totalMinutes = Math.floor(diffMs / 60000);
    const hrs = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;

    return `${hrs}h ${mins}m`;
  };

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch(`${BASE_API_URL}/admin/user-details/${email}`);
        const data = await res.json();
        setHistory(data);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchHistory();
  }, [email]);

  if (loading) return <div style={{ textAlign: "center", padding: "50px" }}>Loading History...</div>;

  return (
    <div style={{ padding: "30px", backgroundColor: "#f8f9fa", minHeight: "100vh", fontFamily: "sans-serif" }}>
      <button onClick={() => navigate(-1)} style={{ marginBottom: "20px", padding: "10px 20px", border: "none", borderRadius: "5px", cursor: "pointer", backgroundColor: "#6c757d", color: "white" }}>
        ← Back to Admin Panel
      </button>

      <div style={{ backgroundColor: "white", padding: "25px", borderRadius: "10px", boxShadow: "0 4px 6px rgba(0,0,0,0.05)" }}>
        <h2 style={{ marginBottom: "20px" }}>Detailed Attendance: <span style={{ color: "#007bff" }}>{email}</span></h2>
        
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#007bff", color: "white" }}>
              <th style={{ padding: "12px", textAlign: "left" }}>Date</th>
              <th style={{ padding: "12px", textAlign: "left" }}>Check-in</th>
              <th style={{ padding: "12px", textAlign: "left" }}>Check-out</th>
              <th style={{ padding: "12px", textAlign: "left" }}>Punctuality</th>
              <th style={{ padding: "12px", textAlign: "left", backgroundColor: "#28a745" }}>Duration</th>
            </tr>
          </thead>
          <tbody>
            {history.map((record) => (
              <tr key={record._id} style={{ borderBottom: "1px solid #eee" }}>
                <td style={{ padding: "12px" }}>{new Date(record.checkinTime).toLocaleDateString()}</td>
                <td style={{ padding: "12px" }}>{new Date(record.checkinTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                <td style={{ padding: "12px" }}>
                  {record.checkoutTime ? new Date(record.checkoutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Active"}
                </td>
                <td style={{ padding: "12px" }}>
                  <span style={{ 
                    color: record.punctualityStatus === "Late" ? "#d9534f" : "#5cb85c",
                    fontWeight: "bold" 
                  }}>
                    {record.punctualityStatus}
                  </span>
                </td>
                {/* --- Duration Column --- */}
                <td style={{ padding: "12px", fontWeight: "600", color: "#333" }}>
                  {calculateDuration(record.checkinTime, record.checkoutTime)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default UserDetails;