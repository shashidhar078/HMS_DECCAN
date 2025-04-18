import React from "react";
import { useNavigate } from "react-router-dom";

const RoleSelection = () => {
  const navigate = useNavigate();

  const handleSelect = (role) => {
    if (role === "admin") {
      navigate("/admin/login");
    } else if (role === "doctor") {
      navigate("/doctor/register");
    }
  };

  return (
    <div className="min-h-screen bg-pastel flex flex-col items-center justify-center px-4">
      <h1 className="text-4xl font-bold text-primary mb-10">Select Your Role</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 w-full max-w-3xl">
        <div
          className="bg-white shadow-xl rounded-2xl p-8 flex flex-col items-center cursor-pointer hover:scale-105 transition-transform duration-300"
          onClick={() => handleSelect("admin")}
        >
         <img
  src="/src/assets/user.png"
  alt="Admin"
  className="w-20 h-20 mb-4"
/>

          <h2 className="text-xl font-semibold text-gray-800">Admin</h2>
          <p className="text-gray-500 mt-2 text-center">Login as hospital administrator</p>
        </div>

        <div
          className="bg-white shadow-xl rounded-2xl p-8 flex flex-col items-center cursor-pointer hover:scale-105 transition-transform duration-300"
          onClick={() => handleSelect("doctor")}
        >
          <img
            src="https://cdn-icons-png.flaticon.com/512/3774/3774299.png"
            alt="Doctor"
            className="w-20 h-20 mb-4"
          />
          <h2 className="text-xl font-semibold text-gray-800">Doctor</h2>
          <p className="text-gray-500 mt-2 text-center">Register or login to manage appointments</p>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;
