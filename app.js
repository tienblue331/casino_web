const express = require("express");
const path = require("path");
const compression = require("compression");

const app = express();
const PORT = process.env.PORT || 8043;

// Enable Brotli & Gzip compression
app.use(compression());

// Set the Unity WebGL build directory
const buildPath = path.join(__dirname, "Build");

// Serve Unity WebGL Build files correctly
app.use("/Build", express.static(buildPath, {
    setHeaders: (res, filePath) => {
        if (filePath.endsWith(".br")) {
            res.setHeader("Content-Encoding", "br");
            if (filePath.endsWith(".js.br")) {
                res.setHeader("Content-Type", "application/javascript");
            } else if (filePath.endsWith(".wasm.br")) {
                res.setHeader("Content-Type", "application/wasm");
            } else if (filePath.endsWith(".data.br")) {
                res.setHeader("Content-Type", "application/octet-stream");
            } else if (filePath.endsWith(".json.br")) {
                res.setHeader("Content-Type", "application/json");
            }
        }
        if (filePath.endsWith(".gz")) {
            res.setHeader("Content-Encoding", "gzip");
            if (filePath.endsWith(".js.gz")) {
                res.setHeader("Content-Type", "application/javascript");
            } else if (filePath.endsWith(".wasm.gz")) {
                res.setHeader("Content-Type", "application/wasm");
            } else if (filePath.endsWith(".data.gz")) {
                res.setHeader("Content-Type", "application/octet-stream");
            } else if (filePath.endsWith(".json.gz")) {
                res.setHeader("Content-Type", "application/json");
            }
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

// Start HTTP server (Render handles HTTPS automatically)
app.listen(PORT, () => {
    console.log(`🚀 Unity WebGL server running at: http://localhost:${PORT}`);
});
