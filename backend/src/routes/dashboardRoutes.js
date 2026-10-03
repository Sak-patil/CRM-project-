const express = require('express');
const { getSeDashboard, getAdminDashboard } = require('../controllers/dashboardController');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

// All dashboard routes require authentication
router.use(requireAuth);

// SE dashboard — accessible to all authenticated users (data is scoped in the controller)
router.get('/se', getSeDashboard);

// Admin dashboard — accessible only to admins
router.get('/admin', requireRole('admin'), getAdminDashboard);

module.exports = router;
