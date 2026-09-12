const express = require('express');
const { getCustomers } = require('../controllers/customerController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Protect all routes
router.use(requireAuth);

router.get('/', getCustomers);

module.exports = router;
