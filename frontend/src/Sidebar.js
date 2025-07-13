import React from "react";
import { Link } from "react-router-dom";
import "./Sidebar.css";

function Sidebar({ isOpen, toggleSidebar }) {
  return (
    <div className={`sidebar ${isOpen ? "open" : "closed"}`}>
      {/* ✅ Close Button Now Works */}
      <button className="close-btn" onClick={toggleSidebar}>×</button>

      <h2>DermAI</h2>
      <ul>
        <li><Link to="/profile" onClick={toggleSidebar}>👤 UploadImage</Link></li>
        <li><Link to="/diagnosis" onClick={toggleSidebar}>🔍 Diagnosis</Link></li>
        <li><Link to="/progress-tracking" onClick={toggleSidebar}>📈 Progress</Link></li>
        <li><Link to="/recommendation" onClick={toggleSidebar}>💡 Recommendations</Link></li>
      </ul>

      {/* ✅ Logout Button Works */}
      <div className="logout-container">
        <Link to="/" onClick={() => { localStorage.removeItem("userName"); toggleSidebar(); }}>
          🚪 Logout
        </Link>
      </div>
    </div>
  );
}

export default Sidebar;
