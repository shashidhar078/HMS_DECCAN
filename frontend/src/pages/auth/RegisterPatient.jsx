// src/components/PremiumPatientForm.js
import React, { useState } from 'react';
import { 
  FiUser, FiMail, FiPhone, FiCalendar, 
  FiMapPin, FiPlusCircle, FiSave 
} from 'react-icons/fi';

const RegisterPatient = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    contactNumber: '',
    age: '',
    gender: '',
    address: '',
    emergencyContact: {
      name: '',
      relation: '',
      contactNumber: ''
    }
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('emergencyContact.')) {
      const key = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        emergencyContact: { ...prev.emergencyContact, [key]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    console.log(formData);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="card bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6 bg-gradient-to-r from-primary to-secondary text-white">
          <h2 className="text-2xl font-bold">Register New Patient</h2>
          <p className="opacity-90">Fill in the patient details below</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiUser className="text-gray-400" />
              </div>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Full Name"
                className="pl-10"
                required
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiMail className="text-gray-400" />
              </div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email Address"
                className="pl-10"
                required
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiPhone className="text-gray-400" />
              </div>
              <input
                type="tel"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleChange}
                placeholder="Contact Number"
                className="pl-10"
                required
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiCalendar className="text-gray-400" />
              </div>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                placeholder="Age"
                className="pl-10"
                min="0"
                max="120"
              />
            </div>

            <div>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="relative md:col-span-2">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiMapPin className="text-gray-400" />
              </div>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Full Address"
                className="pl-10"
              />
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h3 className="flex items-center text-lg font-medium text-gray-800 mb-4">
              <FiPlusCircle className="mr-2 text-primary" />
              Emergency Contact
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <input
                  type="text"
                  name="emergencyContact.name"
                  value={formData.emergencyContact.name}
                  onChange={handleChange}
                  placeholder="Contact Name"
                />
              </div>
              <div>
                <input
                  type="text"
                  name="emergencyContact.relation"
                  value={formData.emergencyContact.relation}
                  onChange={handleChange}
                  placeholder="Relationship"
                />
              </div>
              <div>
                <input
                  type="tel"
                  name="emergencyContact.contactNumber"
                  value={formData.emergencyContact.contactNumber}
                  onChange={handleChange}
                  placeholder="Contact Number"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-6">
            <button
              type="button"
              className="btn-secondary px-6 py-3"
              onClick={() => setFormData({
                name: '',
                email: '',
                contactNumber: '',
                age: '',
                gender: '',
                address: '',
                emergencyContact: { name: '', relation: '', contactNumber: '' }
              })}
            >
              Reset
            </button>
            <button
              type="submit"
              className="btn-primary px-6 py-3 flex items-center"
            >
              <FiSave className="mr-2" />
              Register Patient
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPatient;