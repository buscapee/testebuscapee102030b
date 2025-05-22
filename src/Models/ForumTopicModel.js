import mongoose from 'mongoose';

const ForumTopicSchema = new mongoose.Schema({
  forumGroupId: { type: mongoose.Schema.Types.ObjectId, ref: 'ForumGroup', required: true },
  title: { type: String, required: true },
  body: { type: String, required: true },
  image: { type: String },
  author: { type: String, required: true }, // nickname
  respostas: [
    {
      author: String,
      body: String,
      image: String,
      createdAt: { type: Date, default: Date.now }
    }
  ]
}, { timestamps: true });

const ForumTopic = mongoose.model('ForumTopic', ForumTopicSchema);
export { ForumTopic, ForumTopicSchema }; 