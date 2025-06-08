import mongoose from 'mongoose';

const debateSchema = new mongoose.Schema({
  speaker: {
    type: String,
    required: true,
    enum: ["George Church", "Francis Fukuyama", "Moderador"]
  },
  message: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true,
    enum: ["pro", "against", "moderator"]
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  collection: 'debates'
});

export default mongoose.model('Debate', debateSchema);