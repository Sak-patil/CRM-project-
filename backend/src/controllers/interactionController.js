const Interaction = require('../models/Interaction');
const Customer = require('../models/Customer');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

/**
 * Helper function to check if the user has access to a customer.
 * Admins have access to all. SEs only have access to customers assigned to them.
 */
const checkCustomerAccess = async (customerId, user) => {
  const customer = await Customer.findById(customerId);
  if (!customer) {
    throw new AppError('No customer found with that ID', 404);
  }
  if (user.role === 'salesExecutive' && customer.assignedTo.toString() !== user.id) {
    throw new AppError('Not authorized to access interactions for this customer', 403);
  }
  return customer;
};

/**
 * @desc    Get all interactions (scoped by role with filters)
 * @route   GET /api/v1/interactions
 * @access  Private
 */
exports.getInteractions = catchAsync(async (req, res, next) => {
  let query = {};

  // Role scoping
  if (req.user.role === 'salesExecutive') {
    // Get all customers assigned to this SE
    const customers = await Customer.find({ assignedTo: req.user.id }).select('_id');
    const customerIds = customers.map(c => c._id);
    query.customer = { $in: customerIds };
  }

  // Filter by customer if provided
  if (req.query.customer) {
    if (req.user.role === 'salesExecutive') {
      await checkCustomerAccess(req.query.customer, req.user);
    }
    query.customer = req.query.customer;
  }

  // Filter by type if provided
  if (req.query.type) {
    query.type = req.query.type;
  }

  const interactions = await Interaction.find(query)
    .populate('customer', 'name email phone')
    .populate('createdBy', 'name')
    .sort('-date'); // sort by date descending (most recent first for timeline)

  res.status(200).json({
    success: true,
    count: interactions.length,
    data: {
      interactions
    }
  });
});

/**
 * @desc    Get single interaction
 * @route   GET /api/v1/interactions/:id
 * @access  Private
 */
exports.getInteraction = catchAsync(async (req, res, next) => {
  const interaction = await Interaction.findById(req.params.id)
    .populate('customer', 'name email')
    .populate('createdBy', 'name');

  if (!interaction) {
    return next(new AppError('No interaction found with that ID', 404));
  }

  if (req.user.role === 'salesExecutive') {
    await checkCustomerAccess(interaction.customer._id, req.user);
  }

  res.status(200).json({
    success: true,
    data: {
      interaction
    }
  });
});

/**
 * @desc    Create new interaction
 * @route   POST /api/v1/interactions
 * @access  Private
 */
exports.createInteraction = catchAsync(async (req, res, next) => {
  if (!req.body.customer) {
    return next(new AppError('Please provide a customer ID', 400));
  }

  if (req.user.role === 'salesExecutive') {
    await checkCustomerAccess(req.body.customer, req.user);
  } else {
    // Admin checking if customer exists
    const customer = await Customer.findById(req.body.customer);
    if (!customer) {
      return next(new AppError('No customer found with that ID', 404));
    }
  }

  // Set the creator
  req.body.createdBy = req.user.id;

  const interaction = await Interaction.create(req.body);

  res.status(201).json({
    success: true,
    data: {
      interaction
    }
  });
});

/**
 * @desc    Update interaction
 * @route   PUT /api/v1/interactions/:id
 * @access  Private
 */
exports.updateInteraction = catchAsync(async (req, res, next) => {
  let interaction = await Interaction.findById(req.params.id);

  if (!interaction) {
    return next(new AppError('No interaction found with that ID', 404));
  }

  if (req.user.role === 'salesExecutive') {
    await checkCustomerAccess(interaction.customer, req.user);
  }

  // Prevent reassignment of customer or createdBy
  if (req.body.customer && req.body.customer.toString() !== interaction.customer.toString()) {
    return next(new AppError('Cannot change the customer of an existing interaction', 400));
  }
  
  delete req.body.createdBy;

  interaction = await Interaction.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: {
      interaction
    }
  });
});

/**
 * @desc    Delete interaction
 * @route   DELETE /api/v1/interactions/:id
 * @access  Private
 */
exports.deleteInteraction = catchAsync(async (req, res, next) => {
  const interaction = await Interaction.findById(req.params.id);

  if (!interaction) {
    return next(new AppError('No interaction found with that ID', 404));
  }

  if (req.user.role === 'salesExecutive') {
    await checkCustomerAccess(interaction.customer, req.user);
  }

  await interaction.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
});
