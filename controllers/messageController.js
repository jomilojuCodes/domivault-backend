const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const { createNotification } = require('./notificationController');

// @desc    Start or get a conversation
// @route   POST /api/messages/conversation
// @access  Private
const startConversation = async (req, res) => {
  try {
    const { recipientId, propertyId } = req.body;

    let conversation = await Conversation.findOne({
      participants: { $all: [req.user._id, recipientId] },
      property: propertyId,
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [req.user._id, recipientId],
        property: propertyId,
      });

      // Notify recipient of new enquiry
      await createNotification({
        recipient: recipientId,
        type: 'new_enquiry',
        title: 'New enquiry',
        message: `${req.user.name} has sent you an enquiry about your property.`,
        property: propertyId,
        sender: req.user._id,
      });
    }

    await conversation.populate('participants', 'name email avatar role');
    await conversation.populate('property', 'title location images price');

    res.json(conversation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all conversations for current user
// @route   GET /api/messages/conversations
// @access  Private
const getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id,
    })
      .populate('participants', 'name email avatar role')
      .populate('property', 'title location images price')
      .sort({ lastMessageAt: -1 });

    res.json(conversations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get messages in a conversation
// @route   GET /api/messages/:conversationId
// @access  Private
const getMessages = async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.conversationId);

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    if (!conversation.participants.includes(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const messages = await Message.find({
      conversation: req.params.conversationId,
    })
      .populate('sender', 'name avatar role')
      .sort({ createdAt: 1 });

    await Message.updateMany(
      {
        conversation: req.params.conversationId,
        sender: { $ne: req.user._id },
        read: false,
      },
      { read: true }
    );

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Send a message
// @route   POST /api/messages/:conversationId
// @access  Private
const sendMessage = async (req, res) => {
  try {
    const { text } = req.body;
    const conversation = await Conversation.findById(req.params.conversationId);

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    if (!conversation.participants.includes(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const message = await Message.create({
      conversation: req.params.conversationId,
      sender: req.user._id,
      text,
    });

    // Update conversation last message
    conversation.lastMessage = text;
    conversation.lastMessageAt = new Date();
    await conversation.save();

    // Notify the other participant
    const recipientId = conversation.participants.find(
      (p) => p.toString() !== req.user._id.toString()
    );

    await createNotification({
      recipient: recipientId,
      type: 'new_message',
      title: 'New message',
      message: `${req.user.name}: ${text.substring(0, 60)}${text.length > 60 ? '...' : ''}`,
      property: conversation.property,
      sender: req.user._id,
    });

    await message.populate('sender', 'name avatar role');

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get unread message count
// @route   GET /api/messages/unread
// @access  Private
const getUnreadCount = async (req, res) => {
  try {
    const count = await Message.countDocuments({
      sender: { $ne: req.user._id },
      read: false,
      conversation: {
        $in: await Conversation.find({
          participants: req.user._id,
        }).distinct('_id'),
      },
    });

    res.json({ unreadCount: count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  startConversation,
  getConversations,
  getMessages,
  sendMessage,
  getUnreadCount,
};