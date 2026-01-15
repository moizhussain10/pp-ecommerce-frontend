// src/components/CheckoutModal.jsx
import React from "react";
import { TARGET_WORK_HOURS } from "../constants";

const modalStyles = {
  backdrop: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modal: {
    backgroundColor: "white",
    padding: "30px",
    borderRadius: "10px",
    boxShadow: "0 5px 15px rgba(0, 0, 0, 0.3)",
    textAlign: "center",
    width: "90%",
    maxWidth: "400px",
  },
  detailsBox: {
    backgroundColor: "#f8f9fa",
    padding: "15px",
    borderRadius: "5px",
    marginBottom: "20px",
    border: "1px solid #dee2e6",
  },
  buttonContainer: {
    display: "flex",
    justifyContent: "space-around",
    marginTop: "20px",
  },
  button: {
    padding: "10px 20px",
    fontSize: "16px",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    transition: "background-color 0.2s",
  },
};

function CheckoutModal({
  startTime,
  elapsedTime,
  timeDetails,
  expectedCheckout,
  punctualityStatus,
  confirmCheckout,
  cancelCheckout,
}) {
  return (
    <div style={modalStyles.backdrop}>
      <div style={modalStyles.modal}>
        <h3 style={{ marginBottom: "20px", color: "#333" }}>
          Confirm Check Out
        </h3>

        <div style={modalStyles.detailsBox}>
          <p style={{ margin: "5px 0" }}>
            <strong>Check-in:</strong>{" "}
            {startTime
              ? `${startTime.toLocaleTimeString()} (${startTime.toLocaleDateString()})`
              : "N/A"}
          </p>

          <p
            style={{
              margin: "10px 0",
              fontWeight: "bold",
              color: punctualityStatus === "Late" ? "#dc3545" : "#28a745",
            }}
          >
            Punctuality: {punctualityStatus || "N/A"}
          </p>

          <hr style={{ borderTop: "1px solid #ddd", margin: "15px 0" }} />

          <p style={{ margin: "5px 0", fontSize: "1.1rem" }}>
            <strong>Target Work Hours ({TARGET_WORK_HOURS}h):</strong>{" "}
            {expectedCheckout}
          </p>

          <p
            style={{
              fontSize: "1.5rem",
              margin: "15px 0",
              color: "#007bff",
            }}
          >
            <strong>Elapsed Time:</strong> {elapsedTime}
          </p>

          <p
            style={{
              fontSize: "1.2rem",
              margin: "15px 0",
              color: timeDetails.isOvershot ? "#dc3545" : "#28a745",
            }}
          >
            <strong>Time Status:</strong> {timeDetails.message}
          </p>
        </div>

        <div style={modalStyles.buttonContainer}>
          <button
            onClick={confirmCheckout}
            style={{ ...modalStyles.button, backgroundColor: "#dc3545" }}
          >
            Final Check Out
          </button>
          <button
            onClick={cancelCheckout}
            style={{ ...modalStyles.button, backgroundColor: "#6c757d" }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default CheckoutModal;