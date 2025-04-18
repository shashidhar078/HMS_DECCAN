import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { searchMedicines } from "../genai/genaiApi";
import { FiArrowLeft, FiSearch, FiUpload } from "react-icons/fi";

const GenAiSearch = () => {
  const { query } = useParams();
  const navigate = useNavigate();

  const fileInputRef = useRef(null);
  const [searchInput, setSearchInput] = useState(query || "");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Load data when navigated with /search/query
  useEffect(() => {
    if (query) handleSearch(query);
  }, [query]);

  // Handle medicine search by typing
  const handleSearch = async (term) => {
    const medicineList = term.split(",").map((med) => med.trim()).filter(Boolean);
    if (!medicineList.length) return;

    setLoading(true);
    setError("");
    const response = await searchMedicines(medicineList);
    if (response.success) {
      setResults(response.results);
    } else {
      setError(response.error || "Something went wrong");
      setResults([]);
    }
    setLoading(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      handleSearch(searchInput.trim());
    }
  };

  // PDF Upload and Extraction
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || file.type !== "application/pdf") {
      alert("Please upload a valid PDF file.");
      return;
    }

    const formData = new FormData();
    formData.append("pdf", file);

    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://localhost:3001/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.medicines && data.medicines.length > 0) {
        setResults(data.medicines);
        setSearchInput(data.medicines.map(m => m.medicine).join(", "));
      } else {
        setError("No medicines found in the prescription.");
        setResults([]);
      }
    } catch (err) {
      console.error(err);
      setError("Upload failed.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-blue-50 to-teal-100 py-10 px-4 sm:px-6 lg:px-8">
      {/* Back + Search + Upload */}
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium transition"
        >
          <FiArrowLeft className="text-xl" />
          Back to Home
        </button>

        <form
          onSubmit={handleSubmit}
          className="flex items-center bg-white shadow-md rounded-full px-4 py-2 w-full sm:w-[600px]"
        >
          <FiSearch className="text-gray-500 text-xl mr-3" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search medicines (comma-separated)..."
            className="flex-grow focus:outline-none text-gray-700 bg-transparent"
          />
          <button type="submit" className="text-sm text-blue-600 font-medium px-3">
            Search
          </button>
          <button
            type="button"
            className="p-2 ml-2 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200"
            onClick={() => fileInputRef.current.click()}
          >
            <FiUpload className="text-lg" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={handleFileUpload}
          />
        </form>
      </div>

      {/* Main Results Card */}
      <div className="max-w-5xl mx-auto bg-white shadow-xl rounded-2xl p-10">
        <h2 className="text-3xl sm:text-4xl font-bold text-center text-blue-700 mb-10">
          {results.length > 0 ? "Medicine Information" : "Search Results"}
        </h2>

        {loading && (
          <div className="text-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-blue-600 font-medium">Fetching results...</p>
          </div>
        )}

        {error && !loading && (
          <div className="text-center text-red-600 bg-red-100 border border-red-200 p-4 rounded-lg">
            {error}
          </div>
        )}

        {!loading && !error && results.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {results.map((item, idx) => (
              <div
                key={idx}
                className="bg-blue-50 p-6 rounded-xl border border-blue-200 shadow hover:shadow-md transition"
              >
                <h3 className="text-2xl font-semibold text-blue-800 mb-4">{item.medicine}</h3>
                <div className="text-gray-700 space-y-2 text-sm sm:text-base">
                  <p><strong>Description:</strong> {item.description || "N/A"}</p>
                  <p><strong>Side Effects:</strong> {item.sideEffects?.join(", ") || "N/A"}</p>
                  <p><strong>Precautions:</strong> {item.precautions?.join(", ") || "N/A"}</p>
                  <p><strong>Remedies:</strong> {item.remedies?.join(", ") || "N/A"}</p>
                  <p><strong>Dosage:</strong> {item.dosage || "Not specified"}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && !error && results.length === 0 && (
          <p className="text-center text-gray-600 py-6">No results yet. Try searching or uploading a PDF.</p>
        )}
      </div>
    </div>
  );
};

export default GenAiSearch;
