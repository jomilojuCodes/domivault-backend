const express = require('express');
const router = express.Router();
const {
  getAllProperties,
  approveProperty,
  markAsInspected,
  rejectProperty,
  getAllUsers,
  suspendUser,
  verifyLandlord,
  resetDevData,
  getStats,
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/properties', protect, adminOnly, getAllProperties);
router.put('/properties/:id/approve', protect, adminOnly, approveProperty);
router.put('/properties/:id/inspect', protect, adminOnly, markAsInspected);
router.put('/properties/:id/reject', protect, adminOnly, rejectProperty);

router.get('/users', protect, adminOnly, getAllUsers);
router.put('/users/:id/suspend', protect, adminOnly, suspendUser);
router.put('/users/:id/verify', protect, adminOnly, verifyLandlord);

router.delete('/reset-dev-data', protect, adminOnly, resetDevData);
router.get('/stats', protect, adminOnly, getStats);

module.exports = router;