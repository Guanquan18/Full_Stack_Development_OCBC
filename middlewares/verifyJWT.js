const jwt = require("jsonwebtoken");
require('dotenv').config();

function verifyJWT(req, res, next) {
    // Get the token from the request headers
    const token = req.headers.authorization && req.headers.authorization.split(" ")[1];

    // If the token is not present, return an error
    if (!token) {
        return res.status(401).send("Access denied. Missing token.");
    }

    // Verify the token
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).send("Access denied. Invalid token.");
        }
        
        // Check if the user has access to the requested endpoint
        const authorizedEndpoints = {
            "/profile": ["admin", "user"],
            "/profile/:profileId": ["admin"],
        };

        const requestedEndpoint = req.url;  // Get the requested endpoint
        const profileId = decoded.profileId;  // Get the profile ID from the token payload

        // Check if the requested endpoint is allowed for the user
        const authorizedRole = Object.entries(authorizedRoles).find(
            ([endpoint, roles]) => {
              const regex = new RegExp(`^${endpoint}$`); // Create RegExp from endpoint
              return regex.test(requestedEndpoint) && roles.includes(accountRole);
            }
        );

        if (!authorizedRole) {
            return res.status(403).send("Access denied. You do not have permission to access this resource.");
        }

        // Pass the profile ID to the next middleware
        req.params = profileId;

        next();
 
    });
}