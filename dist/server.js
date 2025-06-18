"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const mongoose_1 = __importDefault(require("mongoose"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const dotenv_1 = __importDefault(require("dotenv"));
const multer_1 = __importDefault(require("multer"));
const scrapers_1 = require("./scrapers");
const content_1 = require("./models/content");
const pdf_parse_1 = __importDefault(require("pdf-parse"));
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ogtool';
// Configure multer for file uploads
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path_1.default.join(__dirname, '..', 'pdfs');
        if (!fs_1.default.existsSync(uploadDir)) {
            fs_1.default.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Generate unique filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + '.pdf');
    }
});
const upload = (0, multer_1.default)({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        }
        else {
            cb(new Error('Only PDF files are allowed'));
        }
    },
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB limit
    }
});
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Serve static files - check both dist and src locations
const publicPath = path_1.default.join(__dirname, 'public');
const srcPublicPath = path_1.default.join(__dirname, '..', 'src', 'public');
if (fs_1.default.existsSync(publicPath)) {
    app.use(express_1.default.static(publicPath));
}
else if (fs_1.default.existsSync(srcPublicPath)) {
    app.use(express_1.default.static(srcPublicPath));
}
else {
    console.error('Public directory not found in either location');
}
// MongoDB connection
mongoose_1.default.connect(mongoUri)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));
// Root endpoint - serve the HTML file
app.get('/', (req, res) => {
    const htmlPath = path_1.default.join(__dirname, 'public', 'index.html');
    const srcHtmlPath = path_1.default.join(__dirname, '..', 'src', 'public', 'index.html');
    if (fs_1.default.existsSync(htmlPath)) {
        res.sendFile(htmlPath);
    }
    else if (fs_1.default.existsSync(srcHtmlPath)) {
        res.sendFile(srcHtmlPath);
    }
    else {
        res.status(404).send('HTML file not found');
    }
});
// Routes
app.post('/api/scrape', async (req, res) => {
    try {
        const { url } = req.body;
        const scrapedContent = await (0, scrapers_1.scrapeContent)(url);
        // Save to MongoDB
        const content = new content_1.ContentModel({
            ...scrapedContent,
            team_id: 'aline123', // This would come from auth in production
            user_id: 'aline123' // This would come from auth in production
        });
        await content.save();
        res.json(content);
    }
    catch (error) {
        console.error('Scraping error:', error);
        res.status(500).json({ error: 'Failed to scrape content' });
    }
});
// PDF upload endpoint
app.post('/api/upload-pdf', upload.array('pdfs', 10), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'No PDF files uploaded' });
        }
        const results = [];
        for (const file of req.files) {
            const pdfPath = file.path;
            const dataBuffer = fs_1.default.readFileSync(pdfPath);
            const pdfData = await (0, pdf_parse_1.default)(dataBuffer);
            // Create content entry for each PDF
            const content = new content_1.ContentModel({
                title: file.originalname.replace('.pdf', ''),
                content: pdfData.text,
                source_url: `file://${pdfPath}`,
                author: 'Aline',
                content_type: 'book',
                team_id: 'aline123',
                user_id: 'aline123'
            });
            await content.save();
            results.push(content);
        }
        res.json(results);
    }
    catch (error) {
        console.error('PDF upload error:', error);
        res.status(500).json({ error: 'Failed to process uploaded PDF files' });
    }
});
// PDF scraping endpoint
app.post('/api/scrape-pdf', async (req, res) => {
    try {
        const pdfDir = path_1.default.join(__dirname, '..', 'pdfs');
        // Read all PDF files from the pdfs directory
        const pdfFiles = fs_1.default.readdirSync(pdfDir).filter(file => file.endsWith('.pdf'));
        const results = [];
        for (const pdfFile of pdfFiles) {
            const pdfPath = path_1.default.join(pdfDir, pdfFile);
            const dataBuffer = fs_1.default.readFileSync(pdfPath);
            const pdfData = await (0, pdf_parse_1.default)(dataBuffer);
            // Create content entry for each PDF
            const content = new content_1.ContentModel({
                title: pdfFile.replace('.pdf', ''),
                content: pdfData.text,
                source_url: `file://${pdfPath}`,
                author: 'Aline',
                content_type: 'book',
                team_id: 'aline123',
                user_id: 'aline123'
            });
            await content.save();
            results.push(content);
        }
        res.json(results);
    }
    catch (error) {
        console.error('PDF processing error:', error);
        res.status(500).json({ error: 'Failed to process PDF files' });
    }
});
app.get('/api/content', async (req, res) => {
    try {
        const content = await content_1.ContentModel.find({ team_id: 'aline123' });
        res.json(content);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch content' });
    }
});
// Get individual content by ID
app.get('/api/content/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const content = await content_1.ContentModel.findById(id);
        if (!content) {
            return res.status(404).json({ error: 'Content not found' });
        }
        res.json(content);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch content' });
    }
});
// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
