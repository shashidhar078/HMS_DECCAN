Hospital Management System
Description
The Hospital Management System (HMS) is a full-stack application designed to manage patient information, appointments, and medical records in a hospital setting. The system allows administrators, doctors, receptionists, and lab technicians to manage data efficiently. This system uses MongoDB for database management and Node.js with Express.js for the backend.

Technologies Used
Node.js: JavaScript runtime for the server-side code.
Express.js: Web framework for building RESTful APIs.
MongoDB: NoSQL database to store patient and other hospital-related data.
Mongoose: ODM for MongoDB to interact with the database.
CORS: Middleware to handle cross-origin requests.
Body-Parser: Middleware to parse incoming request bodies.
Features
Role-Based Access: Different user roles (Admin, Doctor, Receptionist, Lab Technician) with specific permissions.
CRUD Operations: Perform Create, Read, Update, and Delete operations on patient data.
Custom Patient ID: Each patient has a unique custom ID generated based on timestamp and random number.
Patient Management: Admin can manage doctors, receptionists, and lab technicians, while doctors can add diagnoses and prescriptions for patients.
RESTful API: Exposes endpoints to interact with the system, including the ability to manage patients and view patient details using a custom ID.
Setup and Installation
1. Clone the Repository
Clone the project to your local machine:

bash
Copy
Edit
git clone <your-repository-url>
2. Install Dependencies
Navigate to the project folder and install the required dependencies:

bash
Copy
Edit
npm install
3. Setup MongoDB
Ensure that MongoDB is running on your local machine or use a cloud service like MongoDB Atlas. Update the connection URL in the server.js file if necessary.

4. Run the Application
Start the server:

bash
Copy
Edit
npm start
The backend will be running on http://localhost:5000.

API Endpoints
POST /api/patients/add
Create a new patient record.

Request Body:

json
Copy
Edit
{
  "name": "John Doe",
  "age": 30,
  "gender": "Male",
  "diagnosis": "Flu"
}
GET /api/patients
Retrieve all patient records.

GET /api/patients/custom/:customId
Retrieve a specific patient by their unique custom ID.

PUT /api/patients/custom/:customId
Update a patient's details by custom ID.

DELETE /api/patients/:id
Delete a patient by their MongoDB generated ID.