"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.scrapeContent = scrapeContent;
const puppeteer_1 = __importDefault(require("puppeteer"));
const cheerio = __importStar(require("cheerio"));
const axios_1 = __importDefault(require("axios"));
async function scrapeContent(url) {
    try {
        // First try with axios for faster requests
        const content = await scrapeWithAxios(url);
        if (content) {
            return content;
        }
    }
    catch (error) {
        console.log('Axios scraping failed, trying with Puppeteer...');
    }
    // Fallback to Puppeteer for JavaScript-heavy sites
    return await scrapeWithPuppeteer(url);
}
async function scrapeWithAxios(url) {
    try {
        const response = await axios_1.default.get(url, {
            timeout: 10000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        const $ = cheerio.load(response.data);
        const extractedContent = extractContent($, url);
        if (!extractedContent.content || extractedContent.content.length < 100) {
            return null; // Content too short, likely not the main content
        }
        return extractedContent;
    }
    catch (error) {
        console.error('Axios scraping error:', error);
        return null;
    }
}
async function scrapeWithPuppeteer(url) {
    const browser = await puppeteer_1.default.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });
    try {
        const page = await browser.newPage();
        // Set user agent
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
        // Navigate to the page
        await page.goto(url, {
            waitUntil: 'networkidle0',
            timeout: 30000
        });
        // Wait for content to load
        await page.waitForTimeout(2000);
        // Get the page content
        const content = await page.content();
        const $ = cheerio.load(content);
        const extractedContent = extractContent($, url);
        if (!extractedContent.content) {
            throw new Error('Could not extract content from the page');
        }
        return extractedContent;
    }
    catch (error) {
        console.error('Puppeteer scraping error:', error);
        throw new Error(`Failed to scrape content from ${url}: ${error?.message || 'Unknown error'}`);
    }
    finally {
        await browser.close();
    }
}
function extractContent($, url) {
    // Extract title
    const title = extractTitle($);
    // Extract main content
    const content = extractMainContent($);
    // Extract author
    const author = extractAuthor($);
    // Determine content type
    const contentType = determineContentType($, url);
    return {
        title,
        content,
        source_url: url,
        author,
        content_type: contentType
    };
}
function extractTitle($) {
    // Try multiple selectors for title
    const titleSelectors = [
        'h1',
        'title',
        '.post-title',
        '.article-title',
        '.entry-title',
        '.headline',
        '[property="og:title"]',
        '[name="twitter:title"]'
    ];
    for (const selector of titleSelectors) {
        const title = $(selector).first().text().trim();
        if (title && title.length > 0 && title.length < 200) {
            return title;
        }
    }
    return 'Untitled';
}
function extractMainContent($) {
    // Remove unwanted elements before extracting content
    $('script, style, noscript, iframe, embed, object, svg, img, video, audio, nav, header, footer, aside, .sidebar, .navigation, .menu, .ad, .advertisement, .banner, .popup, .modal, .overlay, .cookie-notice, .privacy-notice, .newsletter-signup, .social-share, .comments, .related-posts, .recommendations').remove();
    // Common selectors for main content
    const contentSelectors = [
        'article',
        '.post-content',
        '.entry-content',
        '.article-content',
        '.content',
        '.main-content',
        '.post-body',
        '.article-body',
        'main',
        '.story-body',
        '.post-text',
        '.article-text',
        '.blog-content',
        '.post-main',
        '.article-main',
        '[role="main"]',
        '.prose', // Common in modern blog frameworks
        '.markdown', // Common in markdown-based blogs
        '.rich-text', // Common in CMS platforms
        // Quill-specific selectors
        '.blog-post',
        '.post',
        '.article',
        '.content-area',
        '.text-content',
        '.body-content',
        '.main-text',
        '.article-text',
        '.post-text',
        '.blog-text',
        '.content-text'
    ];
    let bestContent = '';
    let bestScore = 0;
    for (const selector of contentSelectors) {
        const elements = $(selector);
        if (elements.length > 0) {
            // Clone the element to avoid modifying the original DOM
            const clonedElement = elements.clone();
            // Remove any remaining unwanted elements from the cloned content
            clonedElement.find('script, style, noscript, iframe, embed, object, svg, img, video, audio, nav, header, footer, aside, .sidebar, .navigation, .menu, .ad, .advertisement, .banner, .popup, .modal, .overlay, .cookie-notice, .privacy-notice, .newsletter-signup, .social-share, .comments, .related-posts, .recommendations').remove();
            const content = clonedElement.text().trim();
            const score = calculateContentScore(content);
            if (score > bestScore) {
                bestScore = score;
                bestContent = content;
            }
        }
    }
    // If no good content found, try body with aggressive cleaning
    if (!bestContent || bestContent.length < 100) {
        const bodyClone = $('body').clone();
        // Remove all unwanted elements from body
        bodyClone.find('script, style, noscript, iframe, embed, object, svg, img, video, audio, nav, header, footer, aside, .sidebar, .navigation, .menu, .ad, .advertisement, .banner, .popup, .modal, .overlay, .cookie-notice, .privacy-notice, .newsletter-signup, .social-share, .comments, .related-posts, .recommendations, .header, .footer, .sidebar, .navigation, .menu, .ad, .advertisement, .banner, .popup, .modal, .overlay, .cookie-notice, .privacy-notice, .newsletter-signup, .social-share, .comments, .related-posts, .recommendations').remove();
        const bodyContent = bodyClone.text().trim();
        const bodyScore = calculateContentScore(bodyContent);
        if (bodyScore > bestScore) {
            bestContent = bodyContent;
        }
    }
    // Clean up the content
    return cleanContent(bestContent);
}
function extractAuthor($) {
    // Common selectors for author
    const authorSelectors = [
        '.author',
        '.byline',
        '.post-author',
        '.article-author',
        '.author-name',
        '.writer',
        '[rel="author"]',
        '[property="article:author"]',
        '.meta-author',
        '.entry-author'
    ];
    for (const selector of authorSelectors) {
        const author = $(selector).first().text().trim();
        if (author && author.length > 0 && author.length < 100) {
            return author;
        }
    }
    return 'Unknown Author';
}
function determineContentType($, url) {
    const urlLower = url.toLowerCase();
    const bodyText = $('body').text().toLowerCase();
    // Check URL patterns
    if (urlLower.includes('linkedin.com'))
        return 'linkedin_post';
    if (urlLower.includes('reddit.com'))
        return 'reddit_comment';
    if (urlLower.includes('podcast') || urlLower.includes('transcript'))
        return 'podcast_transcript';
    if (urlLower.includes('call') || urlLower.includes('meeting'))
        return 'call_transcript';
    if (urlLower.includes('book') || urlLower.includes('pdf'))
        return 'book';
    // Check content patterns
    if (bodyText.includes('podcast') || bodyText.includes('transcript'))
        return 'podcast_transcript';
    if (bodyText.includes('call') || bodyText.includes('meeting'))
        return 'call_transcript';
    // Default to blog for most web content
    return 'blog';
}
function calculateContentScore(content) {
    if (!content)
        return 0;
    let score = 0;
    // Length score (prefer longer content)
    score += Math.min(content.length / 100, 50);
    // Word count score
    const words = content.split(/\s+/).length;
    score += Math.min(words / 10, 30);
    // Penalize very short content
    if (content.length < 50)
        score -= 100;
    // Penalize content with too many special characters
    const specialCharRatio = (content.match(/[^\w\s]/g) || []).length / content.length;
    if (specialCharRatio > 0.3)
        score -= 20;
    return score;
}
function cleanContent(content) {
    if (!content)
        return '';
    // Remove JavaScript code blocks and function calls
    content = content.replace(/!function\s*\([^)]*\)\s*\{[^}]*\}/g, '');
    content = content.replace(/self\.__next_f[^;]*;/g, '');
    content = content.replace(/window\.reb2b[^;]*;/g, '');
    content = content.replace(/var\s+\w+\s*=\s*[^;]+;/g, '');
    content = content.replace(/function\s*\([^)]*\)\s*\{[^}]*\}/g, '');
    content = content.replace(/\.push\([^)]*\)/g, '');
    content = content.replace(/\.load\([^)]*\)/g, '');
    // Remove HTML entities and encoded content
    content = content.replace(/&[a-zA-Z0-9#]+;/g, ' ');
    content = content.replace(/\\u[0-9a-fA-F]{4}/g, ' ');
    content = content.replace(/\\n/g, ' ');
    content = content.replace(/\\t/g, ' ');
    content = content.replace(/\\r/g, ' ');
    // Remove JSON-like structures and data
    content = content.replace(/\{[^{}]*\}/g, ' ');
    content = content.replace(/\[[^\[\]]*\]/g, ' ');
    content = content.replace(/"[^"]*":\s*"[^"]*"/g, ' ');
    content = content.replace(/"[^"]*":\s*[^,}\]]+/g, ' ');
    // Remove URLs and file paths
    content = content.replace(/https?:\/\/[^\s]+/g, ' ');
    content = content.replace(/\/[^\s]+\.[a-zA-Z]{2,4}/g, ' ');
    content = content.replace(/static\/[^\s]+/g, ' ');
    content = content.replace(/chunks\/[^\s]+/g, ' ');
    // Remove common unwanted text patterns
    content = content.replace(/cookie|privacy|terms|subscribe|newsletter|advertisement|banner|popup|modal|overlay|social|share|comment|recommendation|related/gi, '');
    content = content.replace(/next\.js|react|vue|angular|javascript|typescript|css|html/gi, '');
    content = content.replace(/font|style|script|meta|link|title|head|body/gi, '');
    // Remove excessive whitespace and normalize
    content = content.replace(/\s+/g, ' ');
    content = content.replace(/\n+/g, '\n');
    content = content.replace(/\t+/g, ' ');
    // Remove very short lines (likely navigation or ads)
    content = content.split('\n')
        .filter(line => {
        const trimmed = line.trim();
        return trimmed.length > 20 && // Longer lines are more likely to be content
            !trimmed.match(/^[A-Z\s]+$/) && // Not all caps (likely navigation)
            !trimmed.match(/^[0-9\s\-\.]+$/) && // Not just numbers and punctuation
            !trimmed.match(/^[^\w\s]*$/); // Not just special characters
    })
        .join('\n');
    // Remove lines that are mostly special characters or code
    content = content.split('\n')
        .filter(line => {
        const trimmed = line.trim();
        if (trimmed.length < 10)
            return false;
        // Calculate ratio of special characters
        const specialChars = (trimmed.match(/[^\w\s]/g) || []).length;
        const ratio = specialChars / trimmed.length;
        // If more than 40% are special characters, likely not content
        return ratio < 0.4;
    })
        .join('\n');
    // Trim and limit length
    content = content.trim();
    // Limit to reasonable length (50k characters)
    if (content.length > 50000) {
        content = content.substring(0, 50000) + '...';
    }
    return content;
}
