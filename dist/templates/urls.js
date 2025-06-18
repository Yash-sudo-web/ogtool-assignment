"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.URL_CONFIGS = exports.URL_TEMPLATES = void 0;
exports.URL_TEMPLATES = {
    INTERVIEWING_IO: {
        BLOG: 'https://interviewing.io/blog',
        COMPANY_GUIDES: 'https://interviewing.io/topics#companies',
        INTERVIEW_GUIDES: 'https://interviewing.io/learn#interview-guides'
    },
    NIL_MAMANO: {
        DSA_BLOG: 'https://nilmamano.com/blog/category/dsa'
    },
    SUBSTACK: {
        SHREYCATION: 'https://shreycation.substack.com'
    }
};
exports.URL_CONFIGS = [
    {
        url: exports.URL_TEMPLATES.INTERVIEWING_IO.BLOG,
        contentType: 'blog',
        description: 'Interviewing.io Blog Posts'
    },
    {
        url: exports.URL_TEMPLATES.INTERVIEWING_IO.COMPANY_GUIDES,
        contentType: 'blog',
        description: 'Company Interview Guides'
    },
    {
        url: exports.URL_TEMPLATES.INTERVIEWING_IO.INTERVIEW_GUIDES,
        contentType: 'blog',
        description: 'Interview Preparation Guides'
    },
    {
        url: exports.URL_TEMPLATES.NIL_MAMANO.DSA_BLOG,
        contentType: 'blog',
        description: 'Nil Mamano DS&A Blog Posts'
    },
    {
        url: exports.URL_TEMPLATES.SUBSTACK.SHREYCATION,
        contentType: 'blog',
        description: 'Shreycation Substack Posts'
    }
];
