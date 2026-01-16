import React, { useState, useEffect } from "react";
import { BASE_API_URL } from "../constants";

const styles = {
  container: { padding: "30px", backgroundColor: "#f4f7f6", minHeight: "100vh", fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" },
  cardContainer: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", marginBottom: "30px" },
  card: { padding: "20px", backgroundColor: "white", borderRadius: "10px", boxShadow: "0 4px 6px rgba(0,0,0,0.05)", textAlign: "center" },
  table: { width: "100%", borderCollapse: "collapse", backgroundColor: "white", borderRadius: "10px", overflow: "hidden", boxShadow: "0 4px 6px rgba(0,0,0,0.05)" },
  th: { backgroundColor: "#007bff", color: "white", padding: "15px", textAlign: "left" },
  td: { padding: "15px", borderBottom: "1px solid #eee" },
  badge: (type) => ({
    padding: "5px 12px",
    borderRadius: "15px",
    fontSize: "12px",
    fontWeight: "bold",
    textTransform: "uppercase",
    backgroundColor: type === "CheckedIn" ? "#e6fffa" : "#fff5f5",
    color: type === "CheckedIn" ? "#2d3748" : "#c53030",
    border: `1px solid ${type === "CheckedIn" ? "#b2f5ea" : "#feb2b2"}`
  }),
  onlineDot: { height: "10px", width: "10px", backgroundColor: "#28a745", borderRadius: "50%", display: "inline-block", marginRight: "8px" }
};

function AdminDashboard() {
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttendance();
    const interval = setInterval(fetchAttendance, 30000); // 30 seconds baad auto-refresh
    return () => clearInterval(interval);
  }, []);

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

  // Stats calculate karna
  const onlineCount = attendanceData.filter(item => item.status === "CheckedIn").length;
  const lateCount = attendanceData.filter(item => item.punctualityStatus === "Late").length;

  if (loading) return <div style={{ textAlign: "center", padding: "50px" }}>Loading Admin Panel...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={{ color: "#2d3748" }}>🚀 Employee Attendance Admin</h1>
        <button onClick={fetchAttendance} style={{ padding: "10px 20px", cursor: "pointer", borderRadius: "5px", border: "none", backgroundColor: "#007bff", color: "white" }}>Refresh Data</button>
      </div>

      {/* Stats Cards */}
      <div style={styles.cardContainer}>
        <div style={styles.card}>
          <h3 style={{ color: "#666", fontSize: "14px" }}>Currently Online</h3>
          <p style={{ fontSize: "28px", fontWeight: "bold", color: "#28a745" }}>{onlineCount}</p>
        </div>
        <div style={styles.card}>
          <h3 style={{ color: "#666", fontSize: "14px" }}>Late Arrivals</h3>
          <p style={{ fontSize: "28px", fontWeight: "bold", color: "#dc3545" }}>{lateCount}</p>
        </div>
        <div style={styles.card}>
          <h3 style={{ color: "#666", fontSize: "14px" }}>Total Records</h3>
          <p style={{ fontSize: "28px", fontWeight: "bold", color: "#4a5568" }}>{attendanceData.length}</p>
        </div>
      </div>

      {/* Attendance Table */}
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Employee Email</th>
            <th style={styles.th}>Status</th>
            <th style={styles.th}>Check-in Time</th>
            <th style={styles.th}>Punctuality</th>
            <th style={styles.th}>Check-out Time</th>
          </tr>
        </thead>
        <tbody>
          {attendanceData.map((record) => (
            <tr key={record._id}>
              <td style={styles.td}>
                <strong>{record.email}</strong>
                <div style={{ fontSize: "11px", color: "#999" }}>ID: {record.userId}</div>
              </td>
              <td style={styles.td}>
                {record.status === "CheckedIn" ? (
                  <span><span style={styles.onlineDot}></span>Online</span>
                ) : (
                  <span style={{ color: "#999" }}>Offline</span>
                )}
              </td>
              <td style={styles.td}>
                {new Date(record.checkinTime).toLocaleTimeString()}
                <div style={{ fontSize: "12px", color: "#666" }}>{new Date(record.checkinTime).toLocaleDateString()}</div>
              </td>
              <td style={styles.td}>
                <span style={styles.badge(record.punctualityStatus === "Late" ? "Late" : "CheckedIn")}>
                  {record.punctualityStatus || "N/A"}
                </span>
              </td>
              <td style={styles.td}>
                {record.checkoutTime 
                  ? new Date(record.checkoutTime).toLocaleTimeString() 
                  : <span style={{ color: "#ccc" }}>Pending...</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminDashboard;