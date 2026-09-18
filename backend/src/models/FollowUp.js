const mongoose = require('mongoose');

const followUpSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.ObjectId,
      ref: 'Customer',
      required: [true, 'A follow-up must belong to a customer']
    },
    createdBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'A follow-up must have a creator']
    },
    date: {
      type: Date,
      required: [true, 'Please provide the follow-up date']
    },
    status: {
      type: String,
      enum: {
        values: ['Pending', 'In Progress', 'Completed', 'Cancelled'],
        message: 'Status must be Pending, In Progress, Completed, or Cancelled'
      },
      default: 'Pending'
    },
    notes: {
      type: String,
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
      trim: true
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual property to check if overdue
followUpSchema.virtual('isOverdue').get(function() {
  if (!this.date) return false;
  const now = new Date();
  return this.date < now && (this.status === 'Pending' || this.status === 'In Progress');
});

// Indexes for common queries
followUpSchema.index({ customer: 1 });
followUpSchema.index({ date: 1 });
followUpSchema.index({ status: 1 });

const FollowUp = mongoose.model('FollowUp', followUpSchema);

module.exports = FollowUp;
