const express = require('express');
const router = express.Router();
const { getLandlordAnalytics } = require('../controllers/analyticsController');
const { protect, landlordOnly } = require('../middleware/authMiddleware');

router.get('/landlord', protect, landlordOnly, getLandlordAnalytics);

module.exports = router;