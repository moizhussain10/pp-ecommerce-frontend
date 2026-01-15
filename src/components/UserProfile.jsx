// src/components/UserProfile.jsx
import React from "react";

function UserProfile({ userEmail, checkinTime, punctualityStatus, userHistory }) {
  
  // Format duration in HH:MM:SS
  const formatDuration = (ms) => {
    if (ms === null) return "N/A";
    const totalSeconds = Math.floor(ms / 1000);
    const seconds = totalSeconds % 60;
    const minutes = Math.floor(totalSeconds / 60) % 60;
    const hours = Math.floor(totalSeconds / 3600);
    
    const pad = (num) => String(num).padStart(2, "0");
    return `${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`;
  };

  return (
    <div style={profileStyles.container}>
      <h4 style={profileStyles.header}>👤 User Profile & Current Status</h4>
      
      {/* Current Details */}
      <div style={profileStyles.currentStatusBox}>
        <p style={profileStyles.detail}>
          <strong>Email:</strong> {userEmail || "N/A"}
        </p>
        <p style={profileStyles.detail}>
          <strong>Current Check-in:</strong>{" "}
          {checkinTime 
            ? `${checkinTime.toLocaleTimeString()} (${checkinTime.toLocaleDateString()})`
            : "Not Checked In"}
        </p>
        {checkinTime && (
          <p 
            style={{
              ...profileStyles.detail,
              fontWeight: 'bold',
              color: punctualityStatus === "Late" ? '#dc3545' : '#28a745',
            }}
          >
            <strong>Punctuality:</strong> {punctualityStatus || 'Checking...'}
          </p>
        )}
      </div>

      {/* History Table */}
      <h4 style={profileStyles.historyHeader}>📅 Past Records</h4>
      
      {userHistory && userHistory.length > 0 ? (
        <div style={{ overflowX: 'auto' }}>
          <table style={profileStyles.table}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Duration</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {userHistory.map((record, index) => {
                const checkInDate = new Date(record.checkinTime);
                const checkOutTime = record.checkoutTime ? new Date(record.checkoutTime) : null;
                const duration = record.duration ? formatDuration(record.duration) : 'N/A';
                
                return (
                  <tr key={index}>
                    <td>{checkInDate.toLocaleDateString()}</td>
                    <td>{checkInDate.toLocaleTimeString()}</td>
                    <td>{checkOutTime ? checkOutTime.toLocaleTimeString() : '---'}</td>
                    <td>{duration}</td>
                    <td style={{ color: record.punctualityStatus === 'Late' ? '#dc3545' : '#28a745' }}>
                      {record.punctualityStatus}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <p style={{ textAlign: 'center', color: '#666' }}>No past check-in records found.</p>
      )}
    </div>
  );
}

const profileStyles = {
  container: {
    padding: "15px",
    margin: "20px auto",
    maxWidth: "800px", // Increased width for the table
    border: "1px solid #ddd",
    borderRadius: "8px",
    textAlign: "left",
    backgroundColor: "#f9f9f9",
  },
  header: {
    textAlign: "center",
    color: "#333",
    borderBottom: "1px solid #eee",
    paddingBottom: "10px",
    marginBottom: "15px",
  },
  currentStatusBox: {
      padding: "10px",
      border: "1px dashed #ccc",
      marginBottom: "20px",
      borderRadius: "4px"
  },
  historyHeader: {
    textAlign: "left",
    color: "#333",
    marginTop: "25px",
    marginBottom: "10px",
  },
  detail: {
    margin: "5px 0",
    fontSize: "1rem",
    color: "#555",
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '10px',
    fontSize: '0.9rem',
    backgroundColor: '#fff',
  },
  tableHeader: {
    backgroundColor: '#007bff',
    color: 'white',
  }
};

export default UserProfile;