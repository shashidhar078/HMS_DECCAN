<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hospital Management System</title>
</head>

<body>
    <h1>Hospital Management System (HMS)</h1>

    <section>
        <h2>Description</h2>
        <p>The <strong>Hospital Management System (HMS)</strong> is a full-stack application designed to manage patient information, appointments, and medical records in a hospital setting. The system allows administrators, doctors, receptionists, and lab technicians to manage data efficiently. This system uses MongoDB for database management and Node.js with Express.js for the backend.</p>
    </section>

    <section>
        <h2>Technologies Used</h2>
        <ul>
            <li><strong>Node.js</strong>: JavaScript runtime for the server-side code.</li>
            <li><strong>Express.js</strong>: Web framework for building RESTful APIs.</li>
            <li><strong>MongoDB</strong>: NoSQL database to store patient and other hospital-related data.</li>
            <li><strong>Mongoose</strong>: ODM for MongoDB to interact with the database.</li>
            <li><strong>CORS</strong>: Middleware to handle cross-origin requests.</li>
            <li><strong>Body-Parser</strong>: Middleware to parse incoming request bodies.</li>
        </ul>
    </section>

    <section>
        <h2>Features</h2>
        <ul>
            <li><strong>Role-Based Access Control</strong>: Different user roles (Admin, Doctor, Receptionist, Lab Technician) with specific permissions.</li>
            <li><strong>CRUD Operations</strong>: Perform Create, Read, Update, and Delete operations on patient data.</li>
            <li><strong>Custom Patient ID</strong>: Each patient has a unique custom ID generated based on timestamp and random number.</li>
            <li><strong>Patient Management</strong>: Admin can manage doctors, receptionists, and lab technicians, while doctors can add diagnoses and prescriptions for patients.</li>
            <li><strong>RESTful API</strong>: Exposes endpoints to interact with the system, including the ability to manage patients and view patient details using a custom ID.</li>
        </ul>
    </section>

    <section>
        <h2>Setup and Installation</h2>
        <h3>1. Clone the Repository</h3>
        <p>Clone the project repository to your local machine:</p>
        <pre><code>git clone &lt;your-repository-url&gt;</code></pre>

        <h3>2. Install Dependencies</h3>
        <p>Navigate to the project folder and install the necessary dependencies:</p>
        <pre><code>npm install</code></pre>

        <h3>3. Setup MongoDB</h3>
        <p>Ensure that MongoDB is running on your local machine. Alternatively, you can use a cloud database solution like MongoDB Atlas. If necessary, update the connection URL in the <strong>server.js</strong> file to match your database setup.</p>

        <h3>4. Run the Application</h3>
        <p>Start the backend server with the following command:</p>
        <pre><code>npm start</code></pre>
        <p>The backend will be accessible at <strong>http://localhost:5000</strong>.</p>
    </section>

    <section>
        <h2>API Endpoints</h2>
        <h3>1. POST /api/patients/add</h3>
        <p>Create a new patient record.</p>
        <p><strong>Request Body</strong>:</p>
        <pre><code>
{
  "name": "John Doe",
  "age": 30,
  "gender": "Male",
  "diagnosis": "Flu"
}
        </code></pre>

        <h3>2. GET /api/patients</h3>
        <p>Retrieve a list of all patient records.</p>
        <pre><code>
[
  {
    "_id": "5f8d0c5b2b1e6a3d4f3b8c21",
    "name": "John Doe",
    "age": 30,
    "gender": "Male",
    "diagnosis": "Flu",
    "admissionDate": "2025-02-02T17:53:11.540Z",
    "customId": "P-1738520236948-502"
  }
]
        </code></pre>

        <h3>3. GET /api/patients/custom/:customId</h3>
        <p>Retrieve a specific patient record by their <strong>custom ID</strong>.</p>
        <p><strong>Example URL</strong>:</p>
        <pre><code>http://localhost:5000/api/patients/custom/P-1738520236948-502</code></pre>

        <h3>4. PUT /api/patients/custom/:customId</h3>
        <p>Update a patient's details by their <strong>custom ID</strong>.</p>
        <p><strong>Request Body</strong>:</p>
        <pre><code>
{
  "name": "Jane Doe",
  "age": 32,
  "gender": "Female",
  "diagnosis": "Cold"
}
        </code></pre>

        <h3>5. DELETE /api/patients/:id</h3>
        <p>Delete a patient record by their <strong>MongoDB generated ID</strong>.</p>
        <p><strong>Example URL</strong>:</p>
        <pre><code>http://localhost:5000/api/patients/5f8d0c5b2b1e6a3d4f3b8c21</code></pre>
    </section>

    <section>
        <h2>License</h2>
        <p>This project is licensed under the <strong>MIT License</strong> - see the <a href="LICENSE">LICENSE</a> file for more details.</p>
    </section>
</body>

</html>
