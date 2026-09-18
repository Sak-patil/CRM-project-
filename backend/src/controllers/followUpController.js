const FollowUp = require('../models/FollowUp');
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
    throw new AppError('Not authorized to access follow-ups for this customer', 403);
  }
  return customer;
};

/**
 * @desc    Get all follow-ups (scoped by role with filters)
 * @route   GET /api/v1/follow-ups
 * @access  Private
 */
exports.getFollowUps = catchAsync(async (req, res, next) => {
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
      // Make sure the requested customer is one of their own
      await checkCustomerAccess(req.query.customer, req.user);
    }
    query.customer = req.query.customer;
  }

  // Filter by status if provided
  if (req.query.status) {
    query.status = req.query.status;
  }

  const followUps = await FollowUp.find(query)
    .populate('customer', 'name email phone')
    .populate('createdBy', 'name')
    .sort('date'); // default sort by date (upcoming first if combined with status)

  res.status(200).json({
    success: true,
    count: followUps.length,
    data: {
      followUps
    }
  });
});

/**
 * @desc    Get single follow-up
 * @route   GET /api/v1/follow-ups/:id
 * @access  Private
 */
exports.getFollowUp = catchAsync(async (req, res, next) => {
  const followUp = await FollowUp.findById(req.params.id)
    .populate('customer', 'name email phone')
    .populate('createdBy', 'name');

  if (!followUp) {
    return next(new AppError('No follow-up found with that ID', 404));
  }

  // Authorization check for Sales Executive
  await checkCustomerAccess(followUp.customer._id, req.user);

  res.status(200).json({
    success: true,
    data: {
      followUp
    }
  });
});

/**
 * @desc    Create new follow-up
 * @route   POST /api/v1/follow-ups
 * @access  Private
 */
exports.createFollowUp = catchAsync(async (req, res, next) => {
  const { customer, date, status, notes } = req.body;

  // Verify access to customer
  await checkCustomerAccess(customer, req.user);

  const followUp = await FollowUp.create({
    customer,
    date,
    status: status || 'Pending',
    notes,
    createdBy: req.user.id
  });

  res.status(201).json({
    success: true,
    data: {
      followUp
    }
  });
});

/**
 * @desc    Update follow-up (date, notes)
 * @route   PUT /api/v1/follow-ups/:id
 * @access  Private
 */
exports.updateFollowUp = catchAsync(async (req, res, next) => {
  let followUp = await FollowUp.findById(req.params.id);

  if (!followUp) {
    return next(new AppError('No follow-up found with that ID', 404));
  }

  // Authorization check
  await checkCustomerAccess(followUp.customer, req.user);

  // Terminal states cannot be modified via full update unless done by admin
  if ((followUp.status === 'Completed' || followUp.status === 'Cancelled') && req.user.role !== 'admin') {
    return next(new AppError('Cannot edit a follow-up that is Completed or Cancelled', 400));
  }

  const { date, notes } = req.body;
  const updateData = {};

  if (date) updateData.date = date;
  if (notes !== undefined) updateData.notes = notes;

  followUp = await FollowUp.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true
  }).populate('customer', 'name email');

  res.status(200).json({
    success: true,
    data: {
      followUp
    }
  });
});

/**
 * @desc    Update follow-up status
 * @route   PATCH /api/v1/follow-ups/:id/status
 * @access  Private
 */
exports.updateFollowUpStatus = catchAsync(async (req, res, next) => {
  let followUp = await FollowUp.findById(req.params.id);

  if (!followUp) {
    return next(new AppError('No follow-up found with that ID', 404));
  }

  // Authorization check
  await checkCustomerAccess(followUp.customer, req.user);

  const { status } = req.body;
  if (!status) {
    return next(new AppError('Please provide a status', 400));
  }

  // State machine logic
  const currentStatus = followUp.status;

  if (currentStatus === 'Completed' || currentStatus === 'Cancelled') {
    return next(new AppError(`Cannot change status from terminal state '${currentStatus}'`, 400));
  }

  if (currentStatus === 'Pending') {
    if (!['In Progress', 'Completed', 'Cancelled'].includes(status)) {
      return next(new AppError(`Invalid status transition from Pending to ${status}`, 400));
    }
  }

  if (currentStatus === 'In Progress') {
    if (!['Completed', 'Cancelled'].includes(status)) {
      return next(new AppError(`Invalid status transition from In Progress to ${status}`, 400));
    }
  }

  followUp.status = status;
  await followUp.save();

  // Re-fetch to apply population and virtuals properly
  followUp = await FollowUp.findById(req.params.id).populate('customer', 'name email');

  res.status(200).json({
    success: true,
    data: {
      followUp
    }
  });
});

/**
 * @desc    Delete follow-up
 * @route   DELETE /api/v1/follow-ups/:id
 * @access  Private
 */
exports.deleteFollowUp = catchAsync(async (req, res, next) => {
  const followUp = await FollowUp.findById(req.params.id);

  if (!followUp) {
    return next(new AppError('No follow-up found with that ID', 404));
  }

  // Authorization check
  await checkCustomerAccess(followUp.customer, req.user);

  await FollowUp.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    data: {}
  });
});
