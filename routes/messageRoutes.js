const express = require('express');
const router = express.Router();
const {
  startConversation,
  getConversations,
  getMessages,
  sendMessage,
  getUnreadCount,
} = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

// All routes are private
router.post('/conversation', protect, startConversation);
router.get('/conversations', protect, getConversations);
router.get('/unread', protect, getUnreadCount);
router.get('/:conversationId', protect, getMessages);
router.post('/:conversationId', protect, sendMessage);

module.exports = router;