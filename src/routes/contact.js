const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const upload = require('../middleware/upload');

// Public routes
router.post('/submit', upload.single('attachment'), contactController.submitContactForm);

module.exports = router;