import React, { useState, useEffect, useCallback } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom"; 
import SplashScreen from "./SplashScreen";
import LandingPage from "./LandingPage";
import LoginPage from "./LoginPage";
import SignUpPage from "./SignUpPage";
import ProfileUploadPage from "./ProfileUploadPage";
import DiagnosisPage from "./DiagnosisPage";
import RecommendationPage from "./RecommendationPage";
import ProgressTrackingPage from "./ProgressTrackingPage";
import Sidebar from "./Sidebar";
import Header from "./Header";

function App() {
  const [userName, setUserName] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <Router>
      <AppContent 
        userName={userName} 
        setUserName={setUserName} 
        selectedImage={selectedImage} 
        setSelectedImage={setSelectedImage} 
        isAuthenticated={isAuthenticated} 
        setIsAuthenticated={setIsAuthenticated} 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen} 
      />
    </Router>
  );
}

function AppContent({ 
  userName, setUserName, 
  selectedImage, setSelectedImage, 
  isAuthenticated, setIsAuthenticated, 
  sidebarOpen, setSidebarOpen 
}) {
  const location = useLocation();
  const pagesWithSidebar = ["/profile", "/diagnosis", "/recommendation", "/progress-tracking"];
  const showSidebar = isAuthenticated && pagesWithSidebar.includes(location.pathname);

  // ✅ Wrap setSidebarOpen in useCallback to prevent unnecessary re-renders
  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, [setSidebarOpen]);

  // ✅ Close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarOpen && !event.target.closest(".sidebar") && !event.target.closest(".hamburger-menu")) {
        closeSidebar(); // ✅ Uses memoized function
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [sidebarOpen, closeSidebar]); // ✅ Dependency array includes `closeSidebar`

  return (
    <div>
      {/* ✅ Header is always displayed */}
      <Header isAuthenticated={showSidebar} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      {/* ✅ Sidebar opens/closes properly */}
      {showSidebar && <Sidebar isOpen={sidebarOpen} toggleSidebar={closeSidebar} />}

      <div style={{ marginLeft: showSidebar ? "250px" : "0px", transition: "margin 0.3s ease-in-out" }}>
        <Routes>
          <Route path="/" element={<SplashScreen />} /> 
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage setUserName={setUserName} setIsAuthenticated={setIsAuthenticated} />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/profile" element={<ProfileUploadPage userName={userName} setSelectedImage={setSelectedImage} />} />
          <Route path="/diagnosis" element={<DiagnosisPage userName={userName} selectedImage={selectedImage} />} />
          <Route path="/recommendation" element={<RecommendationPage />} />
          <Route path="/progress-tracking" element={<ProgressTrackingPage userName={userName} />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
