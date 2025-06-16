# OGTool Assignment - Technical Knowledge Scraper

This project implements a robust web scraper for importing technical content from various sources into a knowledge base format. It's specifically designed to help Aline import her technical knowledge from blogs, guides, and books.

## Features

- Web-based UI for easy content scraping
- Scrapes content from multiple sources:
  - Interviewing.io blog posts
  - Company guides
  - Interview guides
  - Nil Mamano's DS&A blog posts
  - PDF files (Aline's book)
- MongoDB integration for content storage
- TypeScript implementation
- Express server with RESTful API
- Puppeteer-based scraping for dynamic content

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
3. Select a content source from the dropdown
4. Click "Scrape Content" to start the scraping process

### API Endpoints

The application provides several RESTful API endpoints that can be accessed using tools like Postman or curl.

#### 1. Scrape Web Content

```bash
curl -X POST http://localhost:3000/api/scrape \
  -H "Content-Type: application/json" \
  -d '{"url": "https://interviewing.io/blog"}'
```

Sample Response:
```json
{
  "title": "How to Ace Your Technical Interview",
  "content": "In this article, we'll discuss...",
  "source_url": "https://interviewing.io/blog",
  "author": "John Doe",
  "team_id": "aline123",
  "user_id": "aline123",
  "_id": "60d21b4667d0d8992e610c85",
  "createdAt": "2024-01-20T10:00:00.000Z",
  "updatedAt": "2024-01-20T10:00:00.000Z"
}
```

#### 2. Scrape PDF Files

```bash
curl -X POST http://localhost:3000/api/scrape-pdf \
  -H "Content-Type: application/json"
```

Sample Response:
```json
[
  {
    "title": "Chapter 1",
    "content": "This is the content of Chapter 1...",
    "source_url": "file:///path/to/chapter1.pdf",
    "author": "Aline",
    "team_id": "aline123",
    "user_id": "aline123",
    "_id": "60d21b4667d0d8992e610c86",
    "createdAt": "2024-01-20T10:00:00.000Z",
    "updatedAt": "2024-01-20T10:00:00.000Z"
  }
]
```

#### 3. Get All Scraped Content

```bash
curl http://localhost:3000/api/content
```

Sample Response:
```json
[
  {
    "title": "How to Ace Your Technical Interview",
    "content": "In this article, we'll discuss...",
    "source_url": "https://interviewing.io/blog",
    "author": "John Doe",
    "team_id": "aline123",
    "user_id": "aline123",
    "_id": "60d21b4667d0d8992e610c85",
    "createdAt": "2024-01-20T10:00:00.000Z",
    "updatedAt": "2024-01-20T10:00:00.000Z"
  },
  {
    "title": "Chapter 1",
    "content": "This is the content of Chapter 1...",
    "source_url": "file:///path/to/chapter1.pdf",
    "author": "Aline",
    "team_id": "aline123",
    "user_id": "aline123",
    "_id": "60d21b4667d0d8992e610c86",
    "createdAt": "2024-01-20T10:00:00.000Z",
    "updatedAt": "2024-01-20T10:00:00.000Z"
  }
]
```

## Project Structure

```
src/
  ├── models/         # MongoDB models
  ├── scrapers/       # Scraping implementations
  ├── public/         # Frontend static files
  ├── types/          # TypeScript type definitions
  └── server.ts       # Express server setup
pdfs/                 # Directory for PDF files
```

## Implementation Details

### Frontend
- Simple, clean interface for content scraping
- Real-time feedback on scraping status
- Displays scraped content in a readable format
- Responsive design that works on all devices

### Backend
- Express server with TypeScript
- MongoDB integration for content storage
- Puppeteer for handling dynamic content
- PDF parsing support
- Error handling and logging

### Scraping
- Supports multiple content sources
- Handles dynamic content loading
- Extracts title, content, and author information
- Fallback selectors for different page structures

## Error Handling

The application includes robust error handling for:
- Network issues
- Invalid URLs
- Parsing errors
- Database connection issues
- PDF processing errors