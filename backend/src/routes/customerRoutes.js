const express = require('express');
const { getCustomers, getCustomer, createCustomer, updateCustomer, deleteCustomer } = require('../controllers/customerController');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

// Protect all routes
router.use(requireAuth);

router.route('/')
  .get(getCustomers)
  .post(createCustomer);

router.route('/:id')
  .get(getCustomer)
  .put(updateCustomer)
  .delete(requireRole('admin'), deleteCustomer);

module.exports = router;
