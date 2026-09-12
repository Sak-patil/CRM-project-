const express = require('express');
const { createUser } = require('../controllers/userController');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

// Protect all routes and restrict to admin
router.use(requireAuth);
router.use(requireRole('admin'));

router.post('/', createUser);

module.exports = router;
