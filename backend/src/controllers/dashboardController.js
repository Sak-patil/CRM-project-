const Customer = require('../models/Customer');
const FollowUp = require('../models/FollowUp');
const Interaction = require('../models/Interaction');
const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');

/**
 * @desc    Get Sales Executive dashboard metrics (scoped to logged-in SE)
 * @route   GET /api/v1/dashboard/se
 * @access  Private (any authenticated user — SEs get scoped data, Admin gets all)
 */
exports.getSeDashboard = catchAsync(async (req, res, next) => {
  const now = new Date();

  // Determine the customer filter scope
  let customerFilter = {};
  if (req.user.role === 'salesExecutive') {
    customerFilter = { assignedTo: req.user.id };
  } else if (req.user.role === 'admin' && req.query.userId) {
    customerFilter = { assignedTo: req.query.userId };
  }

  // 1. Get assigned customers
  const assignedCustomers = await Customer.find(customerFilter).select('_id name email phone');
  const customerIds = assignedCustomers.map(c => c._id);
  const customerCount = customerIds.length;

  // 2. Follow-up statistics (scoped to the SE's customers)
  const followUpFilter = { customer: { $in: customerIds } };

  const [
    pendingFollowUps,
    inProgressFollowUps,
    completedFollowUps,
    cancelledFollowUps,
    overdueFollowUps,
    upcomingFollowUps,
    recentInteractions,
    recentFollowUps
  ] = await Promise.all([
    // Pending follow-ups count
    FollowUp.countDocuments({ ...followUpFilter, status: 'Pending' }),
    // In Progress follow-ups count
    FollowUp.countDocuments({ ...followUpFilter, status: 'In Progress' }),
    // Completed follow-ups count
    FollowUp.countDocuments({ ...followUpFilter, status: 'Completed' }),
    // Cancelled follow-ups count
    FollowUp.countDocuments({ ...followUpFilter, status: 'Cancelled' }),
    // Overdue: date < now AND status is active
    FollowUp.countDocuments({
      ...followUpFilter,
      date: { $lt: now },
      status: { $in: ['Pending', 'In Progress'] }
    }),
    // Upcoming: date >= now AND status is active, next 7 days
    FollowUp.find({
      ...followUpFilter,
      date: { $gte: now, $lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) },
      status: { $in: ['Pending', 'In Progress'] }
    })
      .populate('customer', 'name email')
      .sort('date')
      .limit(5),
    // Recent interactions (last 5)
    Interaction.find({ customer: { $in: customerIds } })
      .populate('customer', 'name')
      .sort('-date')
      .limit(5),
    // Recent/pending follow-ups with overdue flag (last 5 by date)
    FollowUp.find({
      ...followUpFilter,
      status: { $in: ['Pending', 'In Progress'] }
    })
      .populate('customer', 'name email')
      .sort('date')
      .limit(5)
  ]);

  // Add isOverdue virtual to upcoming/recent follow-ups
  const processFollowUp = (fu) => ({
    _id: fu._id,
    customer: fu.customer,
    date: fu.date,
    status: fu.status,
    notes: fu.notes,
    isOverdue: fu.date < now && (fu.status === 'Pending' || fu.status === 'In Progress')
  });

  res.status(200).json({
    success: true,
    data: {
      summary: {
        customerCount,
        followUps: {
          pending: pendingFollowUps,
          inProgress: inProgressFollowUps,
          completed: completedFollowUps,
          cancelled: cancelledFollowUps,
          overdue: overdueFollowUps,
          total: pendingFollowUps + inProgressFollowUps + completedFollowUps + cancelledFollowUps
        },
        interactionCount: await Interaction.countDocuments({ customer: { $in: customerIds } })
      },
      customers: assignedCustomers,
      upcomingFollowUps: upcomingFollowUps.map(processFollowUp),
      activeFollowUps: recentFollowUps.map(processFollowUp),
      recentInteractions
    }
  });
});

/**
 * @desc    Get Admin dashboard metrics (system-wide)
 * @route   GET /api/v1/dashboard/admin
 * @access  Private (Admin only)
 */
exports.getAdminDashboard = catchAsync(async (req, res, next) => {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [
    totalCustomers,
    totalSalesExecutives,
    totalFollowUps,
    pendingFollowUps,
    inProgressFollowUps,
    completedFollowUps,
    cancelledFollowUps,
    overdueFollowUps,
    totalInteractions,
    recentInteractions,
    upcomingFollowUps,
    // Per-SE customer breakdown
    customersPerSe,
    // Interaction type breakdown
    interactionsByType,
    // Follow-up status breakdown per SE
    followUpsPerSe
  ] = await Promise.all([
    Customer.countDocuments(),
    User.countDocuments({ role: 'salesExecutive' }),
    FollowUp.countDocuments(),
    FollowUp.countDocuments({ status: 'Pending' }),
    FollowUp.countDocuments({ status: 'In Progress' }),
    FollowUp.countDocuments({ status: 'Completed' }),
    FollowUp.countDocuments({ status: 'Cancelled' }),
    FollowUp.countDocuments({
      date: { $lt: now },
      status: { $in: ['Pending', 'In Progress'] }
    }),
    Interaction.countDocuments(),
    // Recent 10 interactions across the system
    Interaction.find()
      .populate('customer', 'name')
      .populate('createdBy', 'name')
      .sort('-date')
      .limit(10),
    // Upcoming follow-ups in next 7 days (system-wide)
    FollowUp.find({
      date: { $gte: now, $lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) },
      status: { $in: ['Pending', 'In Progress'] }
    })
      .populate('customer', 'name email')
      .populate('createdBy', 'name')
      .sort('date')
      .limit(10),
    // Customers assigned per Sales Executive
    Customer.aggregate([
      {
        $group: {
          _id: '$assignedTo',
          count: { $sum: 1 },
          customers: { $push: { _id: '$_id', name: '$name', email: '$email', phone: '$phone' } }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $project: {
          _id: 1,
          count: 1,
          name: { $arrayElemAt: ['$user.name', 0] },
          email: { $arrayElemAt: ['$user.email', 0] },
          customers: 1
        }
      },
      { $sort: { count: -1 } }
    ]),
    // Interactions breakdown by type
    Interaction.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]),
    // Follow-ups per SE (from createdBy)
    FollowUp.aggregate([
      {
        $group: {
          _id: '$createdBy',
          pending: {
            $sum: { $cond: [{ $eq: ['$status', 'Pending'] }, 1, 0] }
          },
          inProgress: {
            $sum: { $cond: [{ $eq: ['$status', 'In Progress'] }, 1, 0] }
          },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] }
          },
          cancelled: {
            $sum: { $cond: [{ $eq: ['$status', 'Cancelled'] }, 1, 0] }
          },
          total: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $project: {
          _id: 1,
          pending: 1,
          inProgress: 1,
          completed: 1,
          cancelled: 1,
          total: 1,
          name: { $arrayElemAt: ['$user.name', 0] }
        }
      },
      { $sort: { total: -1 } }
    ])
  ]);

  // Process upcoming follow-ups for overdue flag
  const processFollowUp = (fu) => ({
    _id: fu._id,
    customer: fu.customer,
    createdBy: fu.createdBy,
    date: fu.date,
    status: fu.status,
    notes: fu.notes,
    isOverdue: fu.date < now && (fu.status === 'Pending' || fu.status === 'In Progress')
  });

  // Build interaction type map for easy access
  const interactionTypeMap = {};
  interactionsByType.forEach(item => {
    interactionTypeMap[item._id] = item.count;
  });

  res.status(200).json({
    success: true,
    data: {
      summary: {
        totalCustomers,
        totalSalesExecutives,
        followUps: {
          total: totalFollowUps,
          pending: pendingFollowUps,
          inProgress: inProgressFollowUps,
          completed: completedFollowUps,
          cancelled: cancelledFollowUps,
          overdue: overdueFollowUps
        },
        interactions: {
          total: totalInteractions,
          byType: {
            Call: interactionTypeMap['Call'] || 0,
            Email: interactionTypeMap['Email'] || 0,
            Meeting: interactionTypeMap['Meeting'] || 0
          }
        }
      },
      upcomingFollowUps: upcomingFollowUps.map(processFollowUp),
      recentInteractions,
      customersPerSe,
      followUpsPerSe
    }
  });
});
