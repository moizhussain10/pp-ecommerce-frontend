import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BASE_API_URL } from "../constants";

const styles = {
  container: { padding: "40px", backgroundColor: "#f0f2f5", minHeight: "100vh", fontFamily: "'Inter', sans-serif" },
  card: { backgroundColor: "white", borderRadius: "16px", boxShadow: "0 10px 25px rgba(0,0,0,0.05)", overflow: "hidden" },
  header: { background: "linear-gradient(135deg, #1a73e8 0%, #0d47a1 100%)", padding: "30px", color: "white" },
  backBtn: {color: "white", border: "none", padding: "10px 20px", borderRadius: "8px", cursor: "pointer", marginBottom: "20px", fontWeight: "600", backdropFilter: "blur(10px)" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left", padding: "18px", backgroundColor: "#f8f9fa", color: "#5f6368", fontSize: "13px", textTransform: "uppercase", letterSpacing: "1px" },
  td: { padding: "18px", borderBottom: "1px solid #eee", fontSize: "15px", color: "#3c4043" },
  badge: (type) => ({
    padding: "6px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "600",
    backgroundColor: type === "Late" ? "#feeef0" : "#e6f4ea",
    color: type === "Late" ? "#d93025" : "#1e8e3e"
  }),
  durationBadge: { backgroundColor: "#e8f0fe", color: "#1967d2", padding: "6px 12px", borderRadius: "6px", fontWeight: "bold", fontFamily: "monospace" }
};

function UserDetails() {
  const { email } = useParams();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- Exact Duration Calculation (H:M:S) ---
  const calculateDuration = (checkin, checkout) => {
    if (!checkin || !checkout) return <span style={{color: "#aaa"}}>— Running —</span>;
    
    const start = new Date(checkin);
    const end = new Date(checkout);
    const diffMs = end - start;

    const totalSeconds = Math.floor(diffMs / 1000);
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    return `${hrs}h ${mins}m ${secs}s`;
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

  if (loading) return <div style={{ textAlign: "center", padding: "100px", fontSize: "20px" }}>Loading Employee History...</div>;

  return (
    <div style={styles.container}>
      <button onClick={() => navigate(-1)} style={styles.backBtn}>← Back to Admin Panel</button>

      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={{ margin: 0, fontSize: "24px" }}>Attendance Analytics</h1>
          <p style={{ margin: "5px 0 0", opacity: 0.8 }}>Reports for: <strong>{email}</strong></p>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Date</th>
                <th style={styles.th}>Check-In</th>
                <th style={styles.th}>Check-Out</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Total Duration (H:M:S)</th>
              </tr>
            </thead>
            <tbody>
              {history.map((record) => (
                <tr key={record._id}>
                  <td style={styles.td}>
                    <div style={{ fontWeight: "600" }}>{new Date(record.checkinTime).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                  </td>
                  <td style={styles.td}>{new Date(record.checkinTime).toLocaleTimeString([], { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' })}</td>
                  <td style={styles.td}>
                    {record.checkoutTime ? 
                      new Date(record.checkoutTime).toLocaleTimeString([], { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' }) 
                      : "—"}
                  </td>
                  <td style={styles.td}>
                    <span style={styles.badge(record.punctualityStatus)}>
                      {record.punctualityStatus || "On Time"}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <span style={styles.durationBadge}>
                      {calculateDuration(record.checkinTime, record.checkoutTime)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default UserDetails;