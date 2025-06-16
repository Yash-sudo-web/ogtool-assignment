export const URL_TEMPLATES = {
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
  
  export interface URLConfig {
    url: string;
    contentType: 'blog' | 'podcast_transcript' | 'call_transcript' | 'linkedin_post' | 'reddit_comment' | 'book' | 'other';
    description: string;
  }
  
  export const URL_CONFIGS: URLConfig[] = [
    {
      url: URL_TEMPLATES.INTERVIEWING_IO.BLOG,
      contentType: 'blog',
      description: 'Interviewing.io Blog Posts'
    },
    {
      url: URL_TEMPLATES.INTERVIEWING_IO.COMPANY_GUIDES,
      contentType: 'blog',
      description: 'Company Interview Guides'
    },
    {
      url: URL_TEMPLATES.INTERVIEWING_IO.INTERVIEW_GUIDES,
      contentType: 'blog',
      description: 'Interview Preparation Guides'
    },
    {
      url: URL_TEMPLATES.NIL_MAMANO.DSA_BLOG,
      contentType: 'blog',
      description: 'Nil Mamano DS&A Blog Posts'
    },
    {
      url: URL_TEMPLATES.SUBSTACK.SHREYCATION,
      contentType: 'blog',
      description: 'Shreycation Substack Posts'
    }
  ];