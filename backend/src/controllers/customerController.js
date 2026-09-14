const Customer = require('../models/Customer');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

/**
 * @desc    Get all customers (scoped by role with search/filter)
 * @route   GET /api/v1/customers
 * @access  Private
 */
exports.getCustomers = catchAsync(async (req, res, next) => {
  let query = {};
  
  // Role scoping
  if (req.user.role === 'salesExecutive') {
    query.assignedTo = req.user.id;
  } else if (req.query.assignedTo) {
    // Admin filtering by SE
    query.assignedTo = req.query.assignedTo;
  }
  
  // Search by name or email
  if (req.query.search) {
    query.$or = [
      { name: { $regex: req.query.search, $options: 'i' } },
      { email: { $regex: req.query.search, $options: 'i' } }
    ];
  }

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

/**
 * @desc    Get single customer
 * @route   GET /api/v1/customers/:id
 * @access  Private
 */
exports.getCustomer = catchAsync(async (req, res, next) => {
  const customer = await Customer.findById(req.params.id).populate('assignedTo', 'name email');

  if (!customer) {
    return next(new AppError('No customer found with that ID', 404));
  }

  // Authorization check for Sales Executive
  if (req.user.role === 'salesExecutive' && customer.assignedTo._id.toString() !== req.user.id) {
    return next(new AppError('Not authorized to access this customer', 403));
  }

  res.status(200).json({
    success: true,
    data: {
      customer
    }
  });
});

/**
 * @desc    Create new customer
 * @route   POST /api/v1/customers
 * @access  Private
 */
exports.createCustomer = catchAsync(async (req, res, next) => {
  const { name, email, phone, address, assignedTo } = req.body;

  let assignedUserId = assignedTo;

  if (req.user.role === 'salesExecutive') {
    // SE can only assign to themselves
    assignedUserId = req.user.id;
  } else if (req.user.role === 'admin' && !assignedTo) {
    return next(new AppError('Please assign this customer to a Sales Executive', 400));
  }

  const customer = await Customer.create({
    name,
    email,
    phone,
    address,
    assignedTo: assignedUserId,
    createdBy: req.user.id
  });

  res.status(201).json({
    success: true,
    data: {
      customer
    }
  });
});

/**
 * @desc    Update customer
 * @route   PUT /api/v1/customers/:id
 * @access  Private
 */
exports.updateCustomer = catchAsync(async (req, res, next) => {
  let customer = await Customer.findById(req.params.id);

  if (!customer) {
    return next(new AppError('No customer found with that ID', 404));
  }

  // Authorization check for Sales Executive
  if (req.user.role === 'salesExecutive' && customer.assignedTo.toString() !== req.user.id) {
    return next(new AppError('Not authorized to update this customer', 403));
  }

  const { name, email, phone, address, assignedTo } = req.body;
  const updateData = {};

  if (name) updateData.name = name;
  if (email) updateData.email = email;
  if (phone) updateData.phone = phone;
  if (address !== undefined) updateData.address = address; // can be cleared

  // Only Admin can reassign
  if (req.user.role === 'admin' && assignedTo) {
    updateData.assignedTo = assignedTo;
  }

  customer = await Customer.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true
  }).populate('assignedTo', 'name email');

  res.status(200).json({
    success: true,
    data: {
      customer
    }
  });
});

/**
 * @desc    Delete customer
 * @route   DELETE /api/v1/customers/:id
 * @access  Private (Admin Only - Enforced in routes)
 */
exports.deleteCustomer = catchAsync(async (req, res, next) => {
  const customer = await Customer.findById(req.params.id);

  if (!customer) {
    return next(new AppError('No customer found with that ID', 404));
  }

  // Note: Future phases (9 & 10) will require cascading deletion of Follow-ups and Interactions here.
  // For now, we only delete the customer.
  await Customer.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    data: {}
  });
});
