"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const contentSchema = new mongoose_1.default.Schema({
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
exports.ContentModel = mongoose_1.default.model('Content', contentSchema);
