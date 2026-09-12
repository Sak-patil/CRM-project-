const express = require('express');
const { createUser, getUsers, getUser, updateUser, deleteUser } = require('../controllers/userController');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

// Protect all routes and restrict to admin
router.use(requireAuth);
router.use(requireRole('admin'));

router.route('/')
  .get(getUsers)
  .post(createUser);

router.route('/:id')
  .get(getUser)
  .put(updateUser)
  .delete(deleteUser);

module.exports = router;
