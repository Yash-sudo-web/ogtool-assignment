import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import multer from 'multer';
import { scrapeContent } from './scrapers';
import { ContentModel } from './models/content';
import pdf from 'pdf-parse';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ogtool';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', 'pdfs');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '.pdf');
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files - check both dist and src locations
const publicPath = path.join(__dirname, 'public');
const srcPublicPath = path.join(__dirname, '..', 'src', 'public');

if (fs.existsSync(publicPath)) {
  app.use(express.static(publicPath));
} else if (fs.existsSync(srcPublicPath)) {
  app.use(express.static(srcPublicPath));
} else {
  console.error('Public directory not found in either location');
}

// MongoDB connection
mongoose.connect(mongoUri)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Root endpoint - serve the HTML file
app.get('/', (req, res) => {
  const htmlPath = path.join(__dirname, 'public', 'index.html');
  const srcHtmlPath = path.join(__dirname, '..', 'src', 'public', 'index.html');
  
  if (fs.existsSync(htmlPath)) {
    res.sendFile(htmlPath);
  } else if (fs.existsSync(srcHtmlPath)) {
    res.sendFile(srcHtmlPath);
  } else {
    res.status(404).send('HTML file not found');
  }
});

// Routes
app.post('/api/scrape', async (req, res) => {
  try {
    const { url } = req.body;
    const scrapedContent = await scrapeContent(url);
    
    // Save to MongoDB
    const content = new ContentModel({
      ...scrapedContent,
      team_id: 'aline123', // This would come from auth in production
      user_id: 'aline123'  // This would come from auth in production
    });
    await content.save();

    res.json(content);
  } catch (error) {
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
    
    for (const file of req.files as Express.Multer.File[]) {
      const pdfPath = file.path;
      const dataBuffer = fs.readFileSync(pdfPath);
      
      const pdfData = await pdf(dataBuffer);
      
      // Create content entry for each PDF
      const content = new ContentModel({
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
  } catch (error) {
    console.error('PDF upload error:', error);
    res.status(500).json({ error: 'Failed to process uploaded PDF files' });
  }
});

// PDF scraping endpoint
app.post('/api/scrape-pdf', async (req, res) => {
  try {
    const pdfDir = path.join(__dirname, '..', 'pdfs');
    
    // Read all PDF files from the pdfs directory
    const pdfFiles = fs.readdirSync(pdfDir).filter(file => file.endsWith('.pdf'));
    
    const results = [];
    
    for (const pdfFile of pdfFiles) {
      const pdfPath = path.join(pdfDir, pdfFile);
      const dataBuffer = fs.readFileSync(pdfPath);
      
      const pdfData = await pdf(dataBuffer);
      
      // Create content entry for each PDF
      const content = new ContentModel({
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
  } catch (error) {
    console.error('PDF processing error:', error);
    res.status(500).json({ error: 'Failed to process PDF files' });
  }
});

app.get('/api/content', async (req, res) => {
  try {
    const content = await ContentModel.find({ team_id: 'aline123' });
    res.json(content);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch content' });
  }
});

// Get individual content by ID
app.get('/api/content/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const content = await ContentModel.findById(id);
    
    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }
    
    res.json(content);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch content' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 