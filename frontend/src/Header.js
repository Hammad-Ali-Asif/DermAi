import React, { useState } from "react";
import "./Header.css";
import Sidebar from "./Sidebar";

function Header() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <header className="header">
        <h1>
          <span className="brand">DermAI</span> - AI that spots acne before you do
        </h1>
        <div className="hamburger-menu" onClick={() => setSidebarOpen(!sidebarOpen)}>
          ☰
        </div>
      </header>
      <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
    </>
  );
}

export default Header;