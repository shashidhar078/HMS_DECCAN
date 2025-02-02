# Hospital Management System (HMS)

## Description
The **Hospital Management System (HMS)** is a full-stack application designed to manage patient information, appointments, and medical records in a hospital setting. The system allows administrators, doctors, receptionists, and lab technicians to manage data efficiently. This system uses MongoDB for database management and Node.js with Express.js for the backend.

## Technologies Used
<ul>
    <li><strong>Node.js</strong>: JavaScript runtime for the server-side code.</li>
    <li><strong>Express.js</strong>: Web framework for building RESTful APIs.</li>
    <li><strong>MongoDB</strong>: NoSQL database to store patient and other hospital-related data.</li>
    <li><strong>Mongoose</strong>: ODM for MongoDB to interact with the database.</li>
    <li><strong>CORS</strong>: Middleware to handle cross-origin requests.</li>
    <li><strong>Body-Parser</strong>: Middleware to parse incoming request bodies.</li>
</ul>

## Features
<ul>
    <li><strong>Role-Based Access Control</strong>: Different user roles (Admin, Doctor, Receptionist, Lab Technician) with specific permissions.</li>
    <li><strong>CRUD Operations</strong>: Perform Create, Read, Update, and Delete operations on patient data.</li>
    <li><strong>Custom Patient ID</strong>: Each patient has a unique custom ID generated based on timestamp and random number.</li>
    <li><strong>Patient Management</strong>: Admin can manage doctors, receptionists, and lab technicians, while doctors can add diagnoses and prescriptions for patients.</li>
    <li><strong>RESTful API</strong>: Exposes endpoints to interact with the system, including the ability to manage patients and view patient details using a custom ID.</li>
</ul>

## Setup and Installation
### 1. Clone the Repository
Clone the project repository to your local machine:
```bash
git clone <your-repository-url>
