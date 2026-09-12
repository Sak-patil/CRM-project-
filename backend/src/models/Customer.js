const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide the customer name'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
      type: String,
      required: [true, 'Please provide the customer email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address'
      ]
    },
    phone: {
      type: String,
      required: [true, 'Please provide the customer phone number'],
      trim: true,
      match: [
        /^\+?[1-9]\d{1,14}$/,
        'Please provide a valid phone number'
      ]
    },
    address: {
      type: String,
      maxlength: [500, 'Address cannot exceed 500 characters'],
      trim: true,
      default: ''
    },
    assignedTo: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'A customer must be assigned to a Sales Executive']
    },
    createdBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'A customer must have a creator']
    }
  },
  {
    timestamps: true
  }
);

// Add text index for searching
customerSchema.index({ name: 'text', email: 'text' });
// Add index for querying by assigned SE
customerSchema.index({ assignedTo: 1 });

const Customer = mongoose.model('Customer', customerSchema);

module.exports = Customer;
