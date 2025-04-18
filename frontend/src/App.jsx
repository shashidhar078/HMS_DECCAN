import { useState, useRef } from 'react';
import './App.css';
import logo from './hospitallogo.png';
import backgroundVideo from './backgroundvideo.mp4';
import { FiUpload, FiSearch } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

function App() {
  const [activeNav, setActiveNav] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const leftNavItems = [
    { id: 'about', label: 'ABOUT'},
    { id: 'doctors', label: 'DOCTORS' },
    { id: 'patients', label: 'PATIENTS' }
  ];

  const rightNavItems = [
    { id: 'receptionists', label: 'RECEPTIONISTS' },
    { id: 'technicians', label: 'LAB TECHNICIANS' }
  ];

  const handleNavClick = (id) => {
    switch(id) {
      case 'about':
        navigate('/about-us');
        break;
      case 'doctors':
        navigate('/select-role');
        break;
      case 'patients':
        navigate('/patient/login');
        break;
      case 'receptionists':
        navigate('/auth/receptionist'); // Fixed: Added missing slash
        break;
      case 'technicians':
        navigate('/technician/login');
        break;
      default:
        break;
    }
  };

  const handleSearch = (e) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      navigate(`/search/${searchQuery.trim()}`);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || file.type !== "application/pdf") {
      alert("Please upload a valid PDF file.");
      return;
    }

    const formData = new FormData();
    formData.append("pdf", file);

    try {
      const response = await fetch("http://localhost:3001/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.medicines && data.medicines.length > 0) {
        navigate(`/search/${data.medicines[0].medicine}`);
      } else {
        alert("No medicine names found in the PDF.");
      }
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Failed to upload file.");
    }
  };

  return (
    <div className="app-container">
      {/* Video Background - Restored */}
      <video autoPlay loop muted className="video-background">
        <source src={backgroundVideo} type="video/mp4" />
        Your browser does not support HTML5 video.
      </video>

      <nav className="main-nav">
        <div className="nav-content">
          {leftNavItems.map(item => (
            <div 
              key={item.id}
              className={`nav-item ${activeNav === item.id ? 'active' : ''}`}
              onMouseEnter={() => setActiveNav(item.id)}
              onMouseLeave={() => setActiveNav(null)}
              onClick={() => handleNavClick(item.id)}
            >
              {item.label}
            </div>
          ))}

          <img src={logo} alt="Hospital Logo" className="nav-logo" />

          {rightNavItems.map(item => (
            <div 
              key={item.id}
              className={`nav-item ${activeNav === item.id ? 'active' : ''}`}
              onMouseEnter={() => setActiveNav(item.id)}
              onMouseLeave={() => setActiveNav(null)}
              onClick={() => handleNavClick(item.id)}
            >
              {item.label}
            </div>
          ))}
        </div>
      </nav>

      <div className="content-overlay">
        <div className="search-container">
          <div className="search-wrapper">
            <FiSearch className="search-icon" />
            <input 
              type="text" 
              placeholder="Search For Medicine Details / Upload The prescription.." 
              className="search-bar" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
            />
            <button className="action-btn" onClick={handleUploadClick}>
              <FiUpload className="action-icon" />
            </button>
            <input
              type="file"
              accept="application/pdf"
              ref={fileInputRef}
              onChange={handleFileUpload}
              style={{ display: "none" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;