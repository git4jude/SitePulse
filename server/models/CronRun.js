import mongoose from 'mongoose';

const cronRunSchema = new mongoose.Schema({
  job: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['running', 'completed', 'failed'],
    default: 'running',
  },
  startedAt: {
    type: Date,
    required: true,
  },
  finishedAt: {
    type: Date,
    default: null,
  },
  totalKeywords: {
    type: Number,
    default: 0,
  },
  checked: {
    type: Number,
    default: 0,
  },
  failed: {
    type: Number,
    default: 0,
  },
  error: {
    type: String,
    default: null,
  },
}, {timestamps: true});

const CronRun = mongoose.model('CronRun', cronRunSchema);

export default CronRun;
