module.exports = {
    user: "OCBC_user", // Replace with your SQL Server login username
    password: "1234", // Replace with your SQL Server login password
    server: "localhost",
    database: "OCBC_db",
    trustServerCertificate: true,
    options: {
      port: 1433, // Default SQL Server port
      connectionTimeout: 60000, // Connection timeout in milliseconds
    },
  };  