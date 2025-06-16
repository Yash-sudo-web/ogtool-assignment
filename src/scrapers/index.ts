import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';
import axios from 'axios';
import { IContent } from '../models/content';

export async function scrapeContent(url: string): Promise<Omit<IContent, 'team_id' | 'user_id'>> {
  if (url.includes('interviewing.io')) {
    return scrapeInterviewingIO(url);
  } else if (url.includes('nilmamano.com')) {
    return scrapeNilMamano(url);
  } else if (url.includes('substack.com')) {
    return scrapeSubstack(url);
  } else {
    return scrapeGenericBlog(url);
  }
}

async function scrapeInterviewingIO(url: string) {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
    const content = await page.content();
    const $ = cheerio.load(content);

    const title = $('h1').first().text().trim() || 'Untitled';
    const articleContent = $('article').text().trim() || $('.post-content').text().trim() || 'No content found';
    const author = $('.author-name').text().trim() || 'Unknown Author';

    if (!articleContent) {
      throw new Error('Could not extract content from the page');
    }

    return {
      title,
      content: articleContent,
      source_url: url,
      author
    };
  } catch (error: any) {
    console.error('Error scraping interviewing.io:', error);
    throw new Error(`Failed to scrape content from ${url}: ${error?.message || 'Unknown error'}`);
  } finally {
    await browser.close();
  }
}

async function scrapeNilMamano(url: string) {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
    const content = await page.content();
    const $ = cheerio.load(content);

    const title = $('h1').first().text().trim() || 'Untitled';
    const articleContent = $('.post-content').text().trim() || $('article').text().trim() || 'No content found';

    if (!articleContent) {
      throw new Error('Could not extract content from the page');
    }

    return {
      title,
      content: articleContent,
      source_url: url,
      author: 'Nil Mamano'
    };
  } catch (error: any) {
    console.error('Error scraping Nil Mamano:', error);
    throw new Error(`Failed to scrape content from ${url}: ${error?.message || 'Unknown error'}`);
  } finally {
    await browser.close();
  }
}

async function scrapeSubstack(url: string) {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
    const content = await page.content();
    const $ = cheerio.load(content);

    const title = $('h1').first().text().trim() || 'Untitled';
    const articleContent = $('.post-content').text().trim() || $('article').text().trim() || 'No content found';
    const author = $('.author-name').text().trim() || 'Unknown Author';

    if (!articleContent) {
      throw new Error('Could not extract content from the page');
    }

    return {
      title,
      content: articleContent,
      source_url: url,
      author
    };
  } catch (error: any) {
    console.error('Error scraping Substack:', error);
    throw new Error(`Failed to scrape content from ${url}: ${error?.message || 'Unknown error'}`);
  } finally {
    await browser.close();
  }
}

async function scrapeGenericBlog(url: string) {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
    const content = await page.content();
    const $ = cheerio.load(content);

    // Generic selectors that work for most blog platforms
    const title = $('h1').first().text().trim() || $('title').text().trim() || 'Untitled';
    const articleContent = $('article').text().trim() || 
                          $('.post-content').text().trim() || 
                          $('.entry-content').text().trim() || 
                          $('main').text().trim() || 
                          'No content found';
    const author = $('.author').text().trim() || 
                  $('.byline').text().trim() || 
                  $('.post-author').text().trim() || 
                  'Unknown Author';

    if (!articleContent) {
      throw new Error('Could not extract content from the page');
    }

    return {
      title,
      content: articleContent,
      source_url: url,
      author
    };
  } catch (error: any) {
    console.error('Error scraping generic blog:', error);
    throw new Error(`Failed to scrape content from ${url}: ${error?.message || 'Unknown error'}`);
  } finally {
    await browser.close();
  }
} 