import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BASE_API_URL } from "../constants";

function UserDetails() {
  const { email } = useParams();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await fetch(`${BASE_API_URL}/admin/user-details/${email}`);
        const data = await res.json();
        setHistory(data);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchDetails();
  }, [email]);

  if (loading) return <div style={{padding: "50px", textAlign: "center"}}>Loading Details...</div>;

  return (
    <div style={{ padding: "30px", fontFamily: "sans-serif" }}>
      <button onClick={() => navigate(-1)} style={{ marginBottom: "20px", padding: "8px 15px", cursor: "pointer" }}>← Back to Dashboard</button>
      
      <div style={{ backgroundColor: "white", padding: "20px", borderRadius: "10px", boxShadow: "0 2px 10px rgba(0,0,0,0.1)" }}>
        <h2 style={{ borderBottom: "2px solid #eee", paddingBottom: "10px" }}>History for: {email}</h2>
        
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}>
          <thead>
            <tr style={{ backgroundColor: "#f4f4f4" }}>
              <th style={{ padding: "12px", textAlign: "left" }}>Date</th>
              <th style={{ padding: "12px", textAlign: "left" }}>Check-in</th>
              <th style={{ padding: "12px", textAlign: "left" }}>Check-out</th>
              <th style={{ padding: "12px", textAlign: "left" }}>Status</th>
              <th style={{ padding: "12px", textAlign: "left" }}>Punctuality</th>
            </tr>
          </thead>
          <tbody>
            {history.map((record) => (
              <tr key={record._id} style={{ borderBottom: "1px solid #eee" }}>
                <td style={{ padding: "12px" }}>{new Date(record.checkinTime).toLocaleDateString()}</td>
                <td style={{ padding: "12px" }}>{new Date(record.checkinTime).toLocaleTimeString()}</td>
                <td style={{ padding: "12px" }}>{record.checkoutTime ? new Date(record.checkoutTime).toLocaleTimeString() : "N/A"}</td>
                <td style={{ padding: "12px" }}>{record.status}</td>
                <td style={{ padding: "12px", color: record.punctualityStatus === "Late" ? "red" : "green" }}>
                  {record.punctualityStatus}
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