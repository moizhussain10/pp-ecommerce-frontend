import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BASE_API_URL } from "../constants";
import toast from "react-hot-toast";

const styles = {
  container: { padding: "40px", backgroundColor: "#f0f2f5", minHeight: "100vh", fontFamily: "'Inter', sans-serif" },
  card: { backgroundColor: "white", borderRadius: "16px", boxShadow: "0 10px 25px rgba(0,0,0,0.05)", overflow: "hidden" },
  header: { background: "linear-gradient(135deg, #1a73e8 0%, #0d47a1 100%)", padding: "30px", color: "white" },
  backBtn: {color: "white", border: "none", padding: "10px 20px", borderRadius: "8px", cursor: "pointer", marginBottom: "20px", fontWeight: "600", backdropFilter: "blur(10px)" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left", padding: "18px", backgroundColor: "#f8f9fa", color: "#5f6368", fontSize: "12px", textTransform: "uppercase", letterSpacing: "1px" },
  td: { padding: "18px", borderBottom: "1px solid #eee", fontSize: "14px", color: "#3c4043" },
  badge: (type) => ({
    padding: "6px 12px", borderRadius: "20px", fontSize: "11px", fontWeight: "700",
    backgroundColor: type === "Late" ? "#feeef0" : "#e6f4ea",
    color: type === "Late" ? "#d93025" : "#1e8e3e"
  }),
  workBadge: (type) => ({
    padding: "6px 12px", borderRadius: "20px", fontSize: "11px", fontWeight: "700",
    backgroundColor: type === "Half Day" ? "#fff3cd" : "#e8f0fe",
    color: type === "Half Day" ? "#856404" : "#1967d2"
  }),
  durationBadge: { backgroundColor: "#f8f9fa", color: "#5f6368", padding: "6px 12px", borderRadius: "6px", fontWeight: "bold", fontFamily: "monospace", border: "1px solid #ddd" },
  editBtn: { backgroundColor: "#ffc107", border: "none", padding: "8px 16px", borderRadius: "6px", cursor: "pointer", fontWeight: "600", color: "#000" }
};

const modalStyles = {
  overlay: { position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.7)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000, backdropFilter: "blur(4px)" },
  modal: { backgroundColor: "white", padding: "30px", borderRadius: "16px", width: "420px", boxShadow: "0 20px 50px rgba(0,0,0,0.3)" },
  inputGroup: { marginBottom: "15px", display: "flex", flexDirection: "column", gap: "5px" },
  label: { fontSize: "13px", fontWeight: "600", color: "#666" },
  input: { padding: "10px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "15px", outline: "none" },
  btnContainer: { display: "flex", gap: "10px", marginTop: "25px" },
  saveBtn: { flex: 2, padding: "12px", backgroundColor: "#1a73e8", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" },
  cancelBtn: { flex: 1, padding: "12px", backgroundColor: "#f1f3f4", color: "#3c4043", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }
};

function UserDetails() {
  const { email } = useParams();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [editData, setEditData] = useState({
    checkinTime: "",
    checkoutTime: "",
    punctualityStatus: "",
    halfDayStatus: ""
  });

  const fetchHistory = async () => {
    try {
      const res = await fetch(`${BASE_API_URL}/admin/user-details/${email}`);
      const data = await res.json();
      setHistory(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchHistory(); }, [email]);

  // --- Date Formatter for Input (Fixed Timezone Issue) ---
  const formatForInput = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const pad = (n) => (n < 10 ? '0' + n : n);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const openEditModal = (record) => {
    setSelectedRecord(record);
    setEditData({
      checkinTime: formatForInput(record.checkinTime),
      checkoutTime: formatForInput(record.checkoutTime),
      punctualityStatus: record.punctualityStatus || "On Time",
      halfDayStatus: record.halfDayStatus || "Full Day"
    });
    setIsModalOpen(true);
  };

  const handleUpdate = async () => {
    const loadId = toast.loading("Updating records...");
    try {
      const payload = {
        ...editData,
        checkinTime: new Date(editData.checkinTime).toISOString(),
        checkoutTime: editData.checkoutTime ? new Date(editData.checkoutTime).toISOString() : null
      };

      const res = await fetch(`${BASE_API_URL}/admin/update-attendance/${selectedRecord._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        toast.success("Updated Successfully!", { id: loadId });
        setIsModalOpen(false);
        fetchHistory();
      } else { toast.error("Update failed", { id: loadId }); }
    } catch (e) { toast.error("Server Error", { id: loadId }); }
  };

  const calculateDuration = (checkin, checkout) => {
    if (!checkin || !checkout) return <span style={{ color: "#aaa" }}>— Running —</span>;
    const diff = new Date(checkout) - new Date(checkin);
    const secs = Math.floor(diff / 1000);
    return `${Math.floor(secs / 3600)}h ${Math.floor((secs % 3600) / 60)}m ${secs % 60}s`;
  };

  if (loading) return <div style={{ textAlign: "center", padding: "100px" }}>Loading logs...</div>;

  return (
    <div style={styles.container}>
      <button onClick={() => navigate(-1)} style={styles.backBtn}>← Back to Admin</button>

      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={{ margin: 0, fontSize: "22px" }}>Attendance History</h1>
          <p style={{ margin: "5px 0 0", opacity: 0.9 }}>Viewing data for: {email}</p>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Date</th>
                <th style={styles.th}>Check-In</th>
                <th style={styles.th}>Check-Out</th>
                <th style={styles.th}>Punctuality</th>
                <th style={styles.th}>Work Type</th>
                <th style={styles.th}>Duration</th>
                <th style={styles.th}>Action</th>
              </tr>
            </thead>
            <tbody>
              {history.map((record) => (
                <tr key={record._id}>
                  <td style={styles.td}><strong>{new Date(record.checkinTime).toLocaleDateString('en-GB')}</strong></td>
                  <td style={styles.td}>{new Date(record.checkinTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</td>
                  <td style={styles.td}>{record.checkoutTime ? new Date(record.checkoutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) : "—"}</td>
                  <td style={styles.td}><span style={styles.badge(record.punctualityStatus)}>{record.punctualityStatus}</span></td>
                  <td style={styles.td}><span style={styles.workBadge(record.halfDayStatus)}>{record.halfDayStatus || "Full Day"}</span></td>
                  <td style={styles.td}><span style={styles.durationBadge}>{calculateDuration(record.checkinTime, record.checkoutTime)}</span></td>
                  <td style={styles.td}><button onClick={() => openEditModal(record)} style={styles.editBtn}>Edit</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- EDIT MODAL --- */}
      {isModalOpen && (
        <div style={modalStyles.overlay}>
          <div style={modalStyles.modal}>
            <h3 style={{ marginTop: 0 }}>Edit Entry</h3>
            
            <div style={modalStyles.inputGroup}>
              <label style={modalStyles.label}>Check-in Time</label>
              <input type="datetime-local" style={modalStyles.input} value={editData.checkinTime} onChange={(e) => setEditData({...editData, checkinTime: e.target.value})} />
            </div>

            <div style={modalStyles.inputGroup}>
              <label style={modalStyles.label}>Check-out Time</label>
              <input type="datetime-local" style={modalStyles.input} value={editData.checkoutTime} onChange={(e) => setEditData({...editData, checkoutTime: e.target.value})} />
            </div>

            <div style={modalStyles.inputGroup}>
              <label style={modalStyles.label}>Punctuality</label>
              <select style={modalStyles.input} value={editData.punctualityStatus} onChange={(e) => setEditData({...editData, punctualityStatus: e.target.value})}>
                <option value="On Time">On Time</option>
                <option value="Late">Late</option>
              </select>
            </div>

            <div style={modalStyles.inputGroup}>
              <label style={modalStyles.label}>Work Type</label>
              <select style={modalStyles.input} value={editData.halfDayStatus} onChange={(e) => setEditData({...editData, halfDayStatus: e.target.value})}>
                <option value="Full Day">Full Day</option>
                <option value="Half Day">Half Day</option>
              </select>
            </div>

            <div style={modalStyles.btnContainer}>
              <button onClick={handleUpdate} style={modalStyles.saveBtn}>Save Changes</button>
              <button onClick={() => setIsModalOpen(false)} style={modalStyles.cancelBtn}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserDetails;