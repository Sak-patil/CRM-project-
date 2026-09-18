const mongoose = require('mongoose');

const interactionSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.ObjectId,
    ref: 'Customer',
    required: [true, 'Interaction must belong to a customer']
  },
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Interaction must have a creator']
  },
  type: {
    type: String,
    required: [true, 'Please provide interaction type'],
    enum: {
      values: ['Call', 'Email', 'Meeting'],
      message: 'Type must be either Call, Email, or Meeting'
    }
  },
  date: {
    type: Date,
    required: [true, 'Please provide the interaction date']
  },
  summary: {
    type: String,
    required: [true, 'Please provide a brief summary'],
    minlength: [2, 'Summary must be at least 2 characters long'],
    maxlength: [200, 'Summary cannot exceed 200 characters']
  },
  notes: {
    type: String,
    maxlength: [2000, 'Notes cannot exceed 2000 characters']
  },
  duration: {
    type: Number,
    min: [1, 'Duration must be at least 1 minute']
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Interaction', interactionSchema);
