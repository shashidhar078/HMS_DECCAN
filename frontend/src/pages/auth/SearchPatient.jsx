// src/pages/SearchPatient.js
import React, { useState } from "react";
import axios from "axios";
import "../../styles/SearchPatient.css";

const SearchPatient = () => {
  const [customId, setCustomId] = useState("");
  const [patient, setPatient] = useState(null);

  const handleSearch = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/patient/get-patient?customId=${customId}`);
      setPatient(response.data.patient);
    } catch (error) {
      console.error("Error fetching patient:", error);
      alert("Patient not found or an error occurred.");
    }
  };

  return (
    <div className="search-patient">
      <h2>Search Patient by Custom ID</h2>
      <div className="search-form">
        <input
          type="text"
          value={customId}
          onChange={(e) => setCustomId(e.target.value)}
          placeholder="Enter Custom ID (e.g., P-1712315323801-145)"
        />
        <button onClick={handleSearch}>Search</button>
      </div>

      {patient && (
        <div className="patient-details">
          <h3>{patient.name}</h3>
          <p><strong>Email:</strong> {patient.email}</p>
          <p><strong>Contact Number:</strong> {patient.contactNumber}</p>
          <p><strong>Age:</strong> {patient.age || "N/A"}</p>
          <p><strong>Gender:</strong> {patient.gender || "N/A"}</p>
          <p><strong>Address:</strong> {patient.address || "N/A"}</p>
        </div>
      )}
    </div>
  );
};

export default SearchPatient;
