// src/components/TimeDisplay.jsx
import React from "react";

function TimeDisplay({ elapsedTime, timeDetails, punctualityStatus }) {
  return (
    <div style={{ marginTop: "40px" }}>
      {punctualityStatus && (
        <p
          style={{
            fontSize: "1.2rem",
            color: punctualityStatus === "Late" ? "#dc3545" : "#28a745",
            fontWeight: "bold",
          }}
        >
          Status: {punctualityStatus}
        </p>
      )}

      <p style={{ fontSize: "1.2rem", color: "#666", marginTop: "10px" }}>
        Time since Check-in:
      </p>
      <h2
        style={{
          fontSize: "4rem",
          color: "#007bff",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {elapsedTime}
      </h2>

      <p
        style={{
          fontSize: "1.2rem",
          margin: "15px 0",
          fontWeight: "bold",
          color: timeDetails.isOvershot ? "#dc3545" : "#007bff",
        }}
      >
        {timeDetails.message}
      </p>
    </div>
  );
}

export default TimeDisplay;