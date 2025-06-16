import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { scrapeContent } from './scrapers';
import { ContentModel } from './models/content';
import pdf from 'pdf-parse';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ogtool';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB connection
mongoose.connect(mongoUri)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Root endpoint - serve the HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
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

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 