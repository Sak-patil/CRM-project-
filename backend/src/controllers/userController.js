const User = require('../models/User');
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
