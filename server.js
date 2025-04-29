const express = require("express");
const path = require("path");
const compression = require("compression");
const fs = require("fs");
const https = require("https");
const { networkInterfaces } = require("os");

const app = express();
const PORT = process.env.PORT || 8043;
const SSL_PORT = 443; // Default HTTPS port

// Load SSL certificates
const privateKey = fs.readFileSync("server.key", "utf8");
const certificate = fs.readFileSync("server.cert", "utf8");
const credentials = { key: privateKey, cert: certificate };

// Enable Brotli & Gzip compression
app.use(compression());

// Set the Unity WebGL build directory
const buildPath = path.join(__dirname, "Build");

// Serve Unity WebGL Build files correctly
app.use("/Build", express.static(buildPath, {
    setHeaders: (res, filePath) => {
        if (filePath.endsWith(".br")) {
            res.setHeader("Content-Encoding", "br");
            res.setHeader("Content-Type", "application/octet-stream");
        }
        if (filePath.endsWith(".gz")) {
            res.setHeader("Content-Encoding", "gzip");
            res.setHeader("Content-Type", "application/javascript");
        }
    }
}));

// Serve the TemplateData directory for CSS and images
const templateDataPath = path.join(__dirname, "TemplateData");
app.use("/TemplateData", express.static(templateDataPath));

const templateDataIconsPath = path.join(__dirname, "TemplateData/icons");
app.use("/TemplateData/icons", express.static(templateDataIconsPath));

// Serve the root directory for manifest and other files
app.use(express.static(__dirname));

// Serve index.html (Unity entry point)
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// Start HTTPS server
const localIP = getLocalIP();
https.createServer(credentials, app).listen(SSL_PORT, "0.0.0.0", () => {
    console.log(`🚀 Unity WebGL HTTPS Server running at: https://localhost:${SSL_PORT}`);
    console.log(`🌐 Accessible on LAN at: https://${localIP}:${SSL_PORT}`);
});

// Function to get local IP (for debugging)
function getLocalIP() {
    const nets = networkInterfaces();
    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            if (net.family === "IPv4" && !net.internal) {
                return net.address;
            }
        }
    }
    return "localhost";
}
