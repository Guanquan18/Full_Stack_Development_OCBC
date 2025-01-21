const express = require("express"); // Import the Express module
const sql = require("mssql"); // Import the mssql module
const dbConfig = require("./configs/dbConfig"); // Import the database configuration
const bodyParser = require("body-parser"); // Import body-parser for parsing request bodies
const staticMiddleware = express.static("public"); // Middleware to serve static files from the public folder
const OpenAI = require('openai'); // Import the OpenAI module

// Imoort middlewares
const verifyJWT = require("./middlewares/verifyJWT");
const validateProfile = require("./middlewares/validateProfile");

// Import controllers
const profileController = require("./controllers/profileController"); // Import the profile controller
const accountController = require("./controllers/accountController"); // Import the account controller
const cardController = require("./controllers/cardController"); // Import the card controller
const transactionController = require("./controllers/transactionController"); // Import the transaction controller
const videoCallingController = require("./controllers/videoCallingController"); // Import the video calling controller
const billController = require("./controllers/billController"); // Import the bill controller
const forumController = require("./controllers/forumController"); // Import the forum controller [Created by : Keshwindren S10259469C]


const app = express(); // Create an Express application
const port = process.env.PORT || 3000; // Use environment variable or default port

// Middleware to parse JSON and URL-encoded data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // For form data handling
app.use(staticMiddleware); // Mount the static middleware
app.use(express.json()); // Middleware to parse JSON bodies

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: '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',
  baseURL: 'https://integrate.api.nvidia.com/v1',
});

// Route to serve the login page HTML file (login page)
app.get('/', (req, res) => {
  res.sendFile(__dirname + "/public/login-pages/index.html");
});

app.post('/login', validateProfile.validateAccessCodePin, profileController.loginProfileByAccessCode);
app.get("/account/:profileId",verifyJWT.verifyJWT, accountController.getAccountByProfileId); // Get profile by profile id
app.get("/profile/:profileId",verifyJWT.verifyJWT, profileController.getProfileById); // Get account by profile id
app.get("/card/:profileId/:accNum",verifyJWT.verifyJWT, cardController.getCardtByProfileIdandAccNum); // Get account by profile id and accNum
app.get("/transactions/:accNum",verifyJWT.verifyJWT, transactionController.getTransactionHistory); // get trnasactions history by accNum
app.get("/recipients/:profileId",verifyJWT.verifyJWT, transactionController.getRecipients); // Get recipients for a profile from the recipients table (kesh)
app.post("/recipients",verifyJWT.verifyJWT, transactionController.addRecipient); // Add a new recipient after clicking on add recipient which would add the recipient to the database (kesh)
app.post("/transfer",verifyJWT.verifyJWT, transactionController.performTransfer); // Perform a fund transfer (kesh)
app.post("/video-calling/create-room",verifyJWT.verifyJWT, videoCallingController.createRoom); // Create a room and send an OTP
app.post("/video-calling/send-host-url", videoCallingController.sendUrl); // Send the host room URL to the admin
app.get("/unpaid-bills/:profileId", billController.getUnpaidBills); // Get unpaid bills by profile id
app.get("/paid-bills/:profileId", billController.getPaidBills); // Get paid bills by profile id
app.post("/pay-bill/:billID", billController.payBills); // Pay bills by billing id
app.get("/bill/:billID", billController.getBillById); // Get bill by bill id
app.get("/api/forum/categories", forumController.getCategories); //  get all categories for forums [Created by : Keshwindren S10259469C] 
app.get("/api/forum/messages/:categoryId", forumController.getMessagesByCategory); // get categories of forum by ID [Created by : Keshwindren S10259469C]
app.post("/api/forum/messages", forumController.postMessage); // post  messages to forums [Created by : Keshwindren S10259469C]

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
  
    console.log(`Server listening on port http://localhost:${port}`);
});

// Close the connection pool on SIGINT signal
process.on("SIGINT", async () => {
    console.log("Server is gracefully shutting down");
    // Perform cleanup tasks (e.g., close database connections)
    await sql.close();
    console.log("Database connection closed");
    process.exit(0); // Exit with code 0 indicating successful shutdown
});