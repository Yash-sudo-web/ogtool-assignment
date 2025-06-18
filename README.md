# OGTool Assignment - Technical Knowledge Scraper

This project implements a robust web scraper for importing technical content from various sources into a knowledge base format. It's specifically designed to help Aline import her technical knowledge from blogs, guides, and books.

## Features

- **Tabbed Web Interface** with three main sections:
  - **Custom URL Input**: Enter any URL to scrape content
  - **PDF Upload**: Upload and process custom PDF files
  - **Aline's Books**: Process existing PDF books in the system
- **Content Detail Pages**: Click any scraped content to view complete content in a new page
- **Export Functionality**: Export all content or individual items as JSON
- **Loading States**: Visual feedback during scraping operations with disabled buttons and spinners
- **Smart Content Display**: 3-line preview with clickable items for full content
- **General Scraping Logic**: Scalable approach that works with any website
- **Smart Content Extraction**: Automatically detects and extracts titles, content, and authors
- **Enhanced Content Cleaning**: Removes JavaScript, HTML entities, and unwanted elements
- **Multiple Scraping Methods**: Uses both Axios (fast) and Puppeteer (JavaScript-heavy sites)
- MongoDB integration for content storage
- TypeScript implementation
- Express server with RESTful API
- Drag-and-drop PDF upload functionality

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (running locally or accessible via connection string)
- npm or yarn

## Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following content:
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/ogtool
NODE_ENV=development
```

4. Build the TypeScript code:
```bash
npm run build
```

## Usage

### Web Interface

1. Start the server:
```bash
npm start
```

2. Open http://localhost:3000 in your browser
3. Use the three tabs to scrape content:

#### Custom URL Tab
- Enter any URL in the text box
- Click "Scrape Content" to extract content from the webpage
- Works with any website (blogs, articles, documentation, etc.)

#### PDF Upload Tab
- Drag and drop PDF files or click to select
- Upload multiple PDFs at once (up to 10 files, 50MB each)
- Automatically processes and stores content

#### Aline's Books Tab
- Click "Process Aline's Books" to scrape all existing PDFs in the system
- Processes files from the `pdfs/` directory

### API Endpoints

The application provides several RESTful API endpoints that can be accessed using tools like Postman or curl.

#### 1. Scrape Custom URL

```bash
curl -X POST http://localhost:3000/api/scrape \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com/article"}'
```

Sample Response:
```json
{
  "title": "How to Ace Your Technical Interview",
  "content": "In this article, we'll discuss...",
  "source_url": "https://example.com/article",
  "author": "John Doe",
  "content_type": "blog",
  "team_id": "aline123",
  "user_id": "aline123",
  "_id": "60d21b4667d0d8992e610c85",
  "createdAt": "2024-01-20T10:00:00.000Z",
  "updatedAt": "2024-01-20T10:00:00.000Z"
}
```

#### 2. Upload PDF Files

```bash
curl -X POST http://localhost:3000/api/upload-pdf \
  -F "pdfs=@file1.pdf" \
  -F "pdfs=@file2.pdf"
```

Sample Response:
```json
[
  {
    "title": "Chapter 1",
    "content": "This is the content of Chapter 1...",
    "source_url": "file:///path/to/file1.pdf",
    "author": "Aline",
    "content_type": "book",
    "team_id": "aline123",
    "user_id": "aline123",
    "_id": "60d21b4667d0d8992e610c86",
    "createdAt": "2024-01-20T10:00:00.000Z",
    "updatedAt": "2024-01-20T10:00:00.000Z"
  }
]
```

#### 3. Scrape Existing PDFs

```bash
curl -X POST http://localhost:3000/api/scrape-pdf \
  -H "Content-Type: application/json"
```

#### 4. Get All Scraped Content

```bash
curl http://localhost:3000/api/content
```

## Project Structure

```
src/
  ├── models/         # MongoDB models
  ├── scrapers/       # General scraping implementations
  ├── public/         # Frontend static files
  ├── types/          # TypeScript type definitions
  └── server.ts       # Express server setup
pdfs/                 # Directory for PDF files
```

## Implementation Details

### Frontend
- **Tabbed Interface**: Clean, organized UI with three main sections
- **Custom URL Input**: Text box for entering any URL to scrape
- **PDF Upload**: Drag-and-drop functionality with file validation
- **Real-time Feedback**: Status messages for all operations
- **Responsive Design**: Works on all devices

### Backend
- Express server with TypeScript
- MongoDB integration for content storage
- **General Scraping Logic**: Works with any website
- **Smart Content Extraction**: Multiple selectors and scoring system
- **PDF Processing**: Support for uploaded and existing PDFs
- **File Upload**: Multer middleware for handling PDF uploads

### Scraping Engine
- **Dual Approach**: Axios for fast requests, Puppeteer for JavaScript-heavy sites
- **Content Scoring**: Intelligent selection of the best content on the page
- **Multiple Selectors**: Tries various CSS selectors to find content
- **Content Type Detection**: Automatically determines content type (blog, podcast, etc.)
- **Content Cleaning**: Removes ads, navigation, and unwanted elements
- **Error Handling**: Graceful fallbacks and comprehensive error reporting

### Content Extraction Features
- **Title Extraction**: Multiple selectors including meta tags
- **Author Detection**: Various author selectors and patterns
- **Content Scoring**: Length, word count, and quality metrics
- **Content Cleaning**: Whitespace normalization and unwanted content removal
- **Length Limits**: Prevents extremely long content from overwhelming storage

## Error Handling

The application includes robust error handling for:
- Network issues and timeouts
- Invalid URLs and malformed requests
- Content parsing errors
- Database connection issues
- PDF processing errors
- File upload validation
- Memory and resource management

## Content Types Supported

The scraper automatically detects and categorizes content as:
- `blog`: Standard blog posts and articles
- `podcast_transcript`: Podcast transcripts
- `call_transcript`: Meeting and call transcripts
- `linkedin_post`: LinkedIn posts
- `reddit_comment`: Reddit comments and posts
- `book`: PDF books and documents
- `other`: Miscellaneous content types