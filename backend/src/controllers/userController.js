const User = require('../models/User');
const Customer = require('../models/Customer');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

/**
 * @desc    Create a new user (Sales Executive)
 * @route   POST /api/v1/users
 * @access  Private/Admin
 */
exports.createUser = catchAsync(async (req, res, next) => {
  const { name, email, password, phone } = req.body;

  // Always create as salesExecutive since only admins use this and admins are seeded
  const role = 'salesExecutive';

  const user = await User.create({
    name,
    email,
    password,
    role,
    phone
  });

  res.status(201).json({
    success: true,
    data: {
      user
    }
  });
});

/**
 * @desc    Get all users (Sales Executives)
 * @route   GET /api/v1/users
 * @access  Private/Admin
 */
exports.getUsers = catchAsync(async (req, res, next) => {
  const users = await User.find({ role: 'salesExecutive' });

  res.status(200).json({
    success: true,
    count: users.length,
    data: {
      users
    }
  });
});

/**
 * @desc    Get specific user details
 * @route   GET /api/v1/users/:id
 * @access  Private/Admin
 */
exports.getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }

  res.status(200).json({
    success: true,
    data: {
      user
    }
  });
});

/**
 * @desc    Update user details
 * @route   PUT /api/v1/users/:id
 * @access  Private/Admin
 */
exports.updateUser = catchAsync(async (req, res, next) => {
  const { name, email, phone, role } = req.body;

  const updateData = {};
  if (name !== undefined) updateData.name = name;
  if (email !== undefined) updateData.email = email;
  if (phone !== undefined) updateData.phone = phone;
  if (role !== undefined) updateData.role = role;

  const user = await User.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true
  });

  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }

  res.status(200).json({
    success: true,
    data: {
      user
    }
  });
});

/**
 * @desc    Delete user
 * @route   DELETE /api/v1/users/:id
 * @access  Private/Admin
 */
exports.deleteUser = catchAsync(async (req, res, next) => {
  if (req.params.id === req.user.id) {
    return next(new AppError('You cannot delete yourself', 400));
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }

  // Check if SE has assigned customers
  const customerCount = await Customer.countDocuments({ assignedTo: req.params.id });
  if (customerCount > 0) {
    return next(new AppError(`Cannot delete user. They have ${customerCount} assigned customer(s). Please reassign them first.`, 400));
  }

  await User.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    data: {}
  });
});
