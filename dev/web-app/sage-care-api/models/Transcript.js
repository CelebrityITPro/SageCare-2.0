const mongoose = require('mongoose');
const { Schema } = mongoose;

const TranscriptSchema = new Schema({
  appointment: {
    type: Schema.Types.ObjectId,
    ref: 'Appointment',
    required: true,
  },
  meetingId: {
    type: String,
    required: true,
    index: true,
  },
  transcript: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Transcript', TranscriptSchema); 