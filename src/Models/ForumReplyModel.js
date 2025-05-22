import mongoose from 'mongoose';

const ForumReplySchema = new mongoose.Schema({
  topicId: { type: mongoose.Schema.Types.ObjectId, ref: 'ForumTopic', required: true },
  author: { type: String, required: true },
  body: { type: String, required: true },
  image: { type: String },
}, { timestamps: true });

const ForumReply = mongoose.model('ForumReply', ForumReplySchema);
export { ForumReply, ForumReplySchema }; 