const jwt = require("jsonwebtoken");
require('dotenv').config();

function verifyJWT(req, res, next) {
    // Get the token from the request headers
    const token = req.headers.authorization && req.headers.authorization.split(" ")[1];

    // If the token is not present, return an error
    if (!token) {
        console.log("No token provided.");
        return res.status(401).json({ message: "Unauthorized" }); // Unauthorized if no token
    }

    // Verify the token
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            console.log("Invalid token.");
            return res.status(403).json({ message: "Forbidden" });  // Forbidden if token is invalid
        }
        
        // Define allowed endpoints with placeholders for dynamic parameters
        const authorizedEndpoints = [
            "/account/:profileId",
            "/profile/:profileId",
            "/card/:profileId/:accNum",
            "/transactions/:accNum",
            "/recipients/:profileId",
            "/recipients",
            "/transfer",
            "/video-calling/create-room",
            "/video-calling/send-host-url",
            "/unpaid-bills/:profileId",
            "/paid-bills/:profileId",
            "/pay-bill/:billID",
            "/bill/:billID",
            "/foreign-exchange",
        ];

        // Get the requested endpoint without query parameters
        const requestedEndpoint = req.path; // This gives the URL path without query parameters

        // Check if the requested endpoint is allowed
        const isAuthorized = authorizedEndpoints.some(endpoint => {
            // Convert endpoint with placeholders into a regex for matching URLs
            const regex = new RegExp(`^${endpoint.replace(/:\w+/g, "[a-zA-Z0-9-_]+")}$`);
            return regex.test(requestedEndpoint);
        });

        if (!isAuthorized) {
            console.log("Endpoint is unauthorized.");
            return res.status(403).json({ message: "Forbidden" });
        }

        next();
    });
}

module.exports = { verifyJWT };