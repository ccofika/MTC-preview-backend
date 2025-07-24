const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const upload = require('../middleware/upload');
const auth = require('../middleware/auth');

// Public routes
router.post('/submit', upload.single('attachment'), contactController.submitContactForm);

// Admin routes (require authentication)
router.use(auth); // Apply auth middleware to all routes below

router.get('/messages', contactController.getMessages);
router.get('/messages/:id', contactController.getMessageById);
router.patch('/messages/:id/status', contactController.updateMessageStatus);
router.post('/messages/:id/reply', contactController.replyToMessage);
router.delete('/messages/:id', contactController.deleteMessage);
router.get('/stats', contactController.getMessageStats);

module.exports = router;