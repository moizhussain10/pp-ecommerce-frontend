import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../Config/firebase.js";
import { BASE_API_URL } from "../constants";

const styles = {
  container: { padding: "30px", backgroundColor: "#f4f7f6", minHeight: "100vh", fontFamily: "inherit" },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px",
    backgroundColor: "white",
    padding: "15px 25px",
    borderRadius: "12px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
  },
  logoutBtn: {
    padding: "8px 18px",
    backgroundColor: "transparent",
    color: "#dc3545",
    border: "1px solid #dc3545",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "600",
    transition: "all 0.3s ease"
  },
  refreshBtn: {
    padding: "10px 20px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    marginRight: "10px"
  },
  // ... (Baki purane styles same hain)
};

function AdminDashboard() {
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  const fetchAttendance = async () => {
    try {
      const res = await fetch(`${BASE_API_URL}/admin/attendance`);
      const data = await res.json();
      setAttendanceData(data);
    } catch (e) {
      console.error("Fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
    const interval = setInterval(fetchAttendance, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div style={{ textAlign: "center", padding: "50px" }}>Loading Admin Panel...</div>;

  return (
    <div style={styles.container}>
      {/* --- Header with Logout --- */}
      <div style={styles.header}>
        <div>
          <h2 style={{ margin: 0, color: "#2d3748" }}>Admin Control Panel</h2>
          <p style={{ margin: 0, fontSize: "12px", color: "#718096" }}>Monitoring Live Attendance</p>
        </div>

        <div style={{ display: "flex", alignItems: "center" }}>
          <button onClick={fetchAttendance} style={styles.refreshBtn}>Refresh</button>
          <button
            onClick={handleLogout}
            style={styles.logoutBtn}
            onMouseOver={(e) => { e.target.style.backgroundColor = "#dc3545"; e.target.style.color = "white"; }}
            onMouseOut={(e) => { e.target.style.backgroundColor = "transparent"; e.target.style.color = "#dc3545"; }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* --- Stats Cards --- */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px", marginBottom: "30px" }}>
        <div style={{ padding: "20px", backgroundColor: "white", borderRadius: "10px", textAlign: "center", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
          <span style={{ fontSize: "14px", color: "#718096" }}>Online Now</span>
          <h3 style={{ fontSize: "28px", margin: "5px 0", color: "#2f855a" }}>
            {attendanceData.filter(i => i.status === "CheckedIn").length}
          </h3>
        </div>
        {/* ... baqi cards ... */}
      </div>

      {/* --- Table Section --- */}
      <div style={{ backgroundColor: "white", borderRadius: "12px", overflow: "hidden", boxShadow: "0 4px 6px rgba(0,0,0,0.05)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#f8f9fa", borderBottom: "2px solid #edf2f7" }}>
              <th style={{ padding: "15px", textAlign: "left" }}>Employee</th>
              <th style={{ padding: "15px", textAlign: "left" }}>Current Status</th>
              <th style={{ padding: "15px", textAlign: "left" }}>Punctuality</th>
              <th style={{ padding: "15px", textAlign: "left" }}>Check-in</th>
              <th style={{ padding: "15px", textAlign: "left" }}>Check-out</th>
            </tr>
          </thead>
          <tbody>
            {attendanceData.map((record) => (
              <tr key={record._id} style={{ borderBottom: "1px solid #edf2f7" }}>
                <td style={{ padding: "15px" }}>
                  <strong>{record.email}</strong>
                </td>
                <td style={{ padding: "15px" }}>
                  {record.status === "CheckedIn" ? (
                    <span style={{ color: "#2f855a", fontWeight: "bold" }}>Checkin</span>
                  ) : (
                    <span style={{ color: "#a0aec0" }}>Checkout</span>
                  )}
                </td>
                <td style={{ padding: "15px" }}>
                  <span style={{
                    padding: "4px 10px", borderRadius: "4px", fontSize: "12px",
                    backgroundColor: record.punctualityStatus === "Late" ? "#fff5f5" : "#f0fff4",
                    color: record.punctualityStatus === "Late" ? "#c53030" : "#2f855a"
                  }}>
                    {record.punctualityStatus || "Not Late"}
                  </span>
                </td>
                <td style={{ padding: "15px" }}>{new Date(record.checkinTime).toLocaleTimeString()}</td>
                <td style={{ padding: "15px" }}>
                  {record.checkoutTime ? new Date(record.checkoutTime).toLocaleTimeString() : "—"}

                  <td style={styles.td}>
                    <button
                      onClick={() => navigate(`/admin/user/${record.email}`)}
                      style={{
                        padding: "6px 12px",
                        backgroundColor: "#007bff",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer"
                      }}
                    >
                      View Details
                    </button>
                  </td>

                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminDashboard;