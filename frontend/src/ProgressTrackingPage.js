import React, { useState, useEffect } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "./ProgressTrackingPage.css";
import Header from "./Header";
import Sidebar from "./Sidebar";

const diagnosisURL = "https://haseeb-283f2-default-rtdb.firebaseio.com/diagnosis";

function ProgressTrackingPage({ userName }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [progressData, setProgressData] = useState([]);

  const userId = localStorage.getItem("userId");

  // ✅ Fetch diagnosis data from Firebase for current user
  useEffect(() => {
    const fetchData = async () => {
      if (!userId) return;

      try {
        const res = await axios.get(`${diagnosisURL}/${userId}.json`);
        const data = res.data;
        if (!data) {
          setProgressData([]);
          return;
        }

        const parsed = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));

        parsed.sort((a, b) => new Date(b.date) - new Date(a.date));
        setProgressData(parsed);
      } catch (error) {
        console.error("Error fetching diagnosis history:", error);
        setProgressData([]);
      }
    };

    fetchData();
  }, [userId]);

  // ✅ Close sidebar if user clicks outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        sidebarOpen &&
        !event.target.closest(".sidebar") &&
        !event.target.closest(".hamburger-menu")
      ) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [sidebarOpen]);

  // ✅ Download PDF Function (with image support)
  const handleDownloadPDF = async () => {
    const progressItems = document.querySelectorAll(".progress-item");
    const pdf = new jsPDF("p", "mm", "a4");
    const padding = 10;
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    let y = padding;

    for (let i = 0; i < progressItems.length; i++) {
      const item = progressItems[i];

      // ✅ Wait for all images to be fully loaded
      const images = item.querySelectorAll("img");
      await Promise.all(
        Array.from(images).map(
          (img) =>
            new Promise((resolve) => {
              if (img.complete) resolve();
              else {
                img.onload = img.onerror = resolve;
              }
            })
        )
      );

      // ✅ Capture item with html2canvas
      const canvas = await html2canvas(item, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL("image/png");

      const imgProps = pdf.getImageProperties(imgData);
      const imgWidth = pageWidth - padding * 2;
      const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

      if (y + imgHeight > pageHeight - padding) {
        pdf.addPage();
        y = padding;
      }

      pdf.addImage(imgData, "PNG", padding, y, imgWidth, imgHeight);
      y += imgHeight + 10;
    }

    pdf.save("progress_report.pdf");
  };

  return (
    <div className="progress-page">
      <Header isAuthenticated={true} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(false)} />

      <div className="progress-container">
        <h1>Progress Tracking</h1>

        {progressData.length === 0 ? (
          <p>No progress tracked yet.</p>
        ) : (
          <>
            <button className="download-btn" onClick={handleDownloadPDF}>
              Download as PDF
            </button>

            <div className="progress-content">
              {progressData.map((progress, index) => (
                <div key={progress.id || index} className="progress-item">
                  <img
                    src={progress.imageSrc}
                    alt={`Progress ${index + 1}`}
                    className="progress-image"
                  />
                  <div className="progress-info">
                    <p><strong>Date:</strong> {progress.date}</p>
                    <p><strong>Diagnosis:</strong> {progress.diagnosis}</p>
                    <p><strong>Severity:</strong> {progress.severity}</p>

                    <div className="diet-section">
                      <p><strong>Avoid:</strong></p>
                      <ul>
                        {progress.avoid?.map((item, i) => <li key={i}>{item}</li>)}
                      </ul>
                      <p><strong>Add:</strong></p>
                      <ul>
                        {progress.add?.map((item, i) => <li key={i}>{item}</li>)}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default ProgressTrackingPage;
