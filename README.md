Hospital Management System
A comprehensive, full-stack web-based Hospital Management System designed to streamline patient care, administrative processes, and communication between staff and patients. This system supports multi-role access and integrates AI-assisted features to improve healthcare delivery.

🏥 Project Overview
This system facilitates seamless interaction across various user roles:

Admin: Full access to manage hospital operations.

Doctors: View assigned patients, prescribe medications, request lab tests.

Receptionists: Register patients and manage appointments.

Lab Technicians: Process and update lab test reports.

Patients: Book appointments, access prescriptions/lab reports, and receive AI-powered assistance.

🔐 Authentication & Authorization
Role-based login system using JWT tokens.

Admin approval workflow for staff registration.

Patient login via OTP (no traditional registration).

Password hashing implemented using bcrypt for security.

🤖 Gen AI Features
An AI assistant supports patients with:

Medicine name suggestions

Side effect details

Home remedy recommendations

📋 Key Features
Responsive, modern UI built with Tailwind CSS.

Admin-controlled access to patient and hospital data.

Patient-specific dashboards for prescriptions, reports, and notifications.

Integrated notification system for appointments and approvals.

Search functionality using unique Patient IDs.

🛠️ Tech Stack
Frontend:

React.js

Tailwind CSS

Axios

Backend:

Node.js

Express.js

MongoDB (Mongoose)

Others:

Twilio API for OTP delivery

JWT for secure access control

Bcrypt for password hashing

- Clone the repo with LFS enabled:
git clone --recursive https://github.com/shashidhar078/HMS_DECCAN.git
- Ensure LFS is installed:
git lfs install
- Pull LFS-tracked files
git lfs pull
After doing this, the actual files should be accessible on your local machine.
Would you like to stop using Git LFS for certain files? Let me know, and I can guide you! 🚀


📁 Folder Structure (Simplified)
bash
Copy
Edit
/frontend
  └── src
      └── components
      └── pages
/backend
  └── routes
  └── controllers
  └── middlewares
  └── models
🧪 How to Run Locally
Clone the repository

bash
Copy
Edit
git clone https://github.com/your-username/hospital-management-system.git
cd hospital-management-system
Install dependencies

bash
Copy
Edit
npm install        # For backend
cd frontend
npm install        # For frontend
cd genai-backend  #For genai-backend
Configure environment variables

Add .env files in both root and /client if needed for API keys, DB URI, etc.

Run the app

bash
Copy
Edit
npm run dev        # For backend
cd frontend
npm run dev          # For frontend
npm run dev            #for genai-backend

✅ Status
✔️ Completed for academic submission
📈 Future Scope: AI model enhancement, patient history analysis, appointment analytics

📣 Acknowledgments
Developed as a part of 4th-semester mini project by [Shashidhar Nagunuri] and [Vigneshwar male]
