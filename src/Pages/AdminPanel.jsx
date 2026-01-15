import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Logout ke baad redirect ke liye
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "../Config/firebase.js";

const AdminPanel = () => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchAllAttendance = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://pp-ecommerce-backend-sldj.vercel.app/api/admin/attendance');
      const data = await response.json();
      setAttendance(data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllAttendance();
  }, []);

  // --- LOGOUT FUNCTION ---
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



  const formatTime = (dateStr) => {
    if (!dateStr) return "---";
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-10 font-sans text-gray-800">
      <div className="max-w-7xl mx-auto">
        
        {/* --- TOP HEADER SECTION --- */}
        <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">
              Admin <span className="text-blue-600">Portal</span>
            </h1>
            <p className="text-gray-500 text-sm">Monitor employee activity in real-time</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={fetchAllAttendance}
              className="flex items-center gap-2 bg-blue-50 text-blue-600 px-5 py-2.5 rounded-xl font-semibold hover:bg-blue-100 transition-all active:scale-95"
            >
              🔄 Refresh
            </button>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-50 text-red-600 px-5 py-2.5 rounded-xl font-semibold hover:bg-red-100 transition-all active:scale-95 border border-red-100"
            >
              🚪 Logout
            </button>
          </div>
        </div>

        {/* --- STATS CARDS (Optional but looks cool) --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <p className="text-gray-500 text-sm font-medium">Total Records</p>
                <h2 className="text-3xl font-bold">{attendance.length}</h2>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-green-500">
                <p className="text-gray-500 text-sm font-medium">Present Today</p>
                <h2 className="text-3xl font-bold">{attendance.filter(r => r.status === 'CheckedIn').length}</h2>
            </div>
        </div>

        {/* --- TABLE SECTION --- */}
        <div className="bg-white shadow-2xl shadow-gray-200/50 rounded-3xl overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-gray-400">
                  <th className="p-5 text-xs font-bold uppercase tracking-wider">Employee Email</th>
                  <th className="p-5 text-xs font-bold uppercase tracking-wider text-center">Status</th>
                  <th className="p-5 text-xs font-bold uppercase tracking-wider text-center">In / Out</th>
                  <th className="p-5 text-xs font-bold uppercase tracking-wider text-center">Punctuality</th>
                  <th className="p-5 text-xs font-bold uppercase tracking-wider text-right">Work Mode</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr><td colSpan="5" className="p-10 text-center text-blue-600 animate-pulse font-bold">Loading records...</td></tr>
                ) : attendance.map((record) => (
                  <tr key={record._id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="p-5">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-700 group-hover:text-blue-600 transition-colors">
                            {record.email || "N/A"}
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono">{record._id}</span>
                      </div>
                    </td>
                    <td className="p-5 text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-black ring-1 ring-inset ${
                        record.status === 'CheckedIn' 
                        ? 'bg-green-50 text-green-700 ring-green-600/20' 
                        : 'bg-gray-50 text-gray-600 ring-gray-600/20'
                      }`}>
                        {record.status === 'CheckedIn' ? '● ONLINE' : '○ OFFLINE'}
                      </span>
                    </td>
                    <td className="p-5 text-center">
                        <div className="text-sm font-bold text-gray-700">{formatTime(record.checkinTime)}</div>
                        <div className="text-[10px] text-gray-400">to {formatTime(record.checkoutTime)}</div>
                    </td>
                    <td className="p-5 text-center">
                      <span className={`text-sm font-bold ${record.punctualityStatus === 'Late' ? 'text-red-500' : 'text-green-500'}`}>
                        {record.punctualityStatus || "---"}
                      </span>
                    </td>
                    <td className="p-5 text-right">
                      <span className="text-xs font-medium bg-gray-100 text-gray-500 px-2 py-1 rounded-md">
                        {record.halfDayStatus === 'HalfDay' ? '🕒 Half' : '📋 Full Day'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {!loading && attendance.length === 0 && (
            <div className="p-20 text-center">
                <div className="text-5xl mb-4">📂</div>
                <h3 className="text-gray-400 font-medium">No attendance data found for today.</h3>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default AdminPanel;