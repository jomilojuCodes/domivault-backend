'use strict';

const express = require('express');
const router = express.Router();
const verificationController = require('../controllers/verificationController');
const { protect, landlordOnly } = require('../middleware/authMiddleware');

router.get('/status', protect, landlordOnly, verificationController.getVerificationStatus);
router.post('/nin', protect, landlordOnly, verificationController.submitNIN);
router.post('/cac', protect, landlordOnly, verificationController.submitCAC);
router.post('/face', protect, landlordOnly, verificationController.submitFaceVerification);

module.exports = router;