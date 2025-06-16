import mongoose from 'mongoose';

export interface IContent {
  team_id: string;
  title: string;
  content: string;
  content_type?: 'blog' | 'podcast_transcript' | 'call_transcript' | 'linkedin_post' | 'reddit_comment' | 'book' | 'other';
  source_url?: string;
  author?: string;
  user_id: string;
}

const contentSchema = new mongoose.Schema<IContent>({
  team_id: { type: String, required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  content_type: {
    type: String,
    enum: ['blog', 'podcast_transcript', 'call_transcript', 'linkedin_post', 'reddit_comment', 'book', 'other']
  },
  source_url: { type: String },
  author: { type: String },
  user_id: { type: String, required: true }
}, {
  timestamps: true
});

export const ContentModel = mongoose.model<IContent>('Content', contentSchema);