const Customer = require('../models/Customer');
const catchAsync = require('../utils/catchAsync');

/**
 * @desc    Get all customers (scoped by role)
 * @route   GET /api/v1/customers
 * @access  Private
 */
exports.getCustomers = catchAsync(async (req, res, next) => {
  let query = {};
  
  // If user is a sales executive, they can only see their assigned customers
  if (req.user.role === 'salesExecutive') {
    query.assignedTo = req.user.id;
  }
  
  // Admin sees all customers, so query remains empty

  const customers = await Customer.find(query)
    .populate('assignedTo', 'name email')
    .sort('-createdAt');

  res.status(200).json({
    success: true,
    count: customers.length,
    data: {
      customers
    }
  });
});
