const bcrypt = require("bcryptjs");

const testPasswordComparison = async () => {
    const enteredPassword = "Secure123"; // Replace with the actual password
    const hashedPasswordFromDB = "$2b$10$HnjdI2BIIMshWEjDFidrReItS8kJciS9yBQPAXsxI6eQ7rGYd5Yza";

    const isMatch = await bcrypt.compare(enteredPassword, hashedPasswordFromDB);
    console.log("Password match:", isMatch);
};

testPasswordComparison();