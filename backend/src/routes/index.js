const express = require('express');
const router = express.Router();

const healthRoutes = require('./healthRoutes');

// Mount routes
router.use('/health', healthRoutes);
// Other routes will be mounted here in future phases

module.exports = router;
