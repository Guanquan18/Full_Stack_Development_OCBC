const express = require("express"); // Import the Express module
const sql = require("mssql"); // Import the mssql module
const dbConfig = require("./configs/dbConfig"); // Import the database configuration
const bodyParser = require("body-parser"); // Import body-parser for parsing request bodies
const staticMiddleware = express.static("public"); // Middleware to serve static files from the public folder

// Imoort middlewares
const verifyJWT = require("./middlewares/verifyJWT.js");
const validateProfile = require("./middlewares/validateProfile");

// Import controllers
const profileController = require("./controllers/profileController"); // Import the profile controller


const app = express(); // Create an Express application
const port = process.env.PORT || 3000; // Use environment variable or default port

// Middleware to parse JSON and URL-encoded data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // For form data handling
app.use(staticMiddleware); // Mount the static middleware

// Route to serve the login page HTML file (login page)
app.get('/', (req, res) => {
  res.sendFile(__dirname + "/public/login-pages/index.html");
});

app.post('/login', validateProfile.validateAccessCodePin, profileController.loginProfileByAccessCode); 

app.listen(port, async () => {
    try {
      // Connect to the database
      await sql.connect(dbConfig);
      console.log("Database connection established successfully");
    } catch (err) {
      console.error("Database connection error:", err);
      // Terminate the application with an error code (optional)
      process.exit(1); // Exit with code 1 indicating an error
    }
  
    console.log(`Server listening on port ${port}`);
  
});

// Close the connection pool on SIGINT signal
process.on("SIGINT", async () => {
    console.log("Server is gracefully shutting down");
    // Perform cleanup tasks (e.g., close database connections)
    await sql.close();
    console.log("Database connection closed");
    process.exit(0); // Exit with code 0 indicating successful shutdown
});