const express = require('express');
const {
  getFollowUps,
  getFollowUp,
  createFollowUp,
  updateFollowUp,
  updateFollowUpStatus,
  deleteFollowUp
} = require('../controllers/followUpController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Protect all follow-up routes
router.use(requireAuth);

router.route('/')
  .get(getFollowUps)
  .post(createFollowUp);

router.route('/:id')
  .get(getFollowUp)
  .put(updateFollowUp)
  .delete(deleteFollowUp);

router.route('/:id/status')
  .patch(updateFollowUpStatus);

module.exports = router;
