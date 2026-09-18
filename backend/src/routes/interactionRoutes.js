const express = require('express');
const {
  getInteractions,
  getInteraction,
  createInteraction,
  updateInteraction,
  deleteInteraction
} = require('../controllers/interactionController');

const { requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();

// All interaction routes require authentication
router.use(requireAuth);

router.route('/')
  .get(getInteractions)
  .post(createInteraction);

router.route('/:id')
  .get(getInteraction)
  .put(updateInteraction)
  .delete(deleteInteraction);

module.exports = router;
