import mongoose from 'mongoose';

const codeSnapshotSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true
  },
  language: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const aiAnalysisSchema = new mongoose.Schema({
  timeComplexity: String,
  spaceComplexity: String,
  correctness: Number,
  bugs: [String],
  suggestions: [String],
  codeStyle: Number,
  overallScore: Number,
  summary: String,
  analyzedAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const sessionSchema = new mongoose.Schema({
  problem: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  host: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  participant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  status: {
    type: String,
    enum: ['active', 'completed'],
    default: 'active'
  },
  roomId: {
    type: String,
    required: true,
    unique: true
  },
  codeSnapshots: {
    type: [codeSnapshotSchema],
    default: []
  },
  aiAnalysis: {
    type: aiAnalysisSchema,
    default: null
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  endedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

sessionSchema.index({ roomId: 1 });
sessionSchema.index({ host: 1 });
sessionSchema.index({ status: 1 });

const Session = mongoose.model('Session', sessionSchema);

export default Session;
