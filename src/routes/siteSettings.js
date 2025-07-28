const express = require('express');
const {
  getSiteSettings,
  getAdminSiteSettings,
  updateSiteSettings,
  updateContactInfo,
  updateEmailSettings,
  resetToDefault,
  settingsValidation,
  contactValidation,
  emailValidation
} = require('../controllers/siteSettingsController');
const auth = require('../middleware/auth');

const router = express.Router();

// Middleware to check if user has system settings permission
const requireSystemSettings = (req, res, next) => {
  try {
    if (req.user.role === 'admin') {
      return next();
    }
    
    if (req.user.permissions && req.user.permissions.includes('system_settings')) {
      return next();
    }
    
    return res.status(403).json({
      success: false,
      message: 'Access denied. System settings permission required.'
    });
  } catch (error) {
    console.error('Permission check error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error checking permissions.'
    });
  }
};

// Middleware to check admin role only
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin role required.'
    });
  }
  next();
};

/**
 * @route   GET /api/settings
 * @desc    Get public site settings
 * @access  Public
 */
router.get('/', getSiteSettings);

/**
 * @route   GET /api/settings/admin
 * @desc    Get all site settings (admin only)
 * @access  Private (Admin or System Settings permission)
 */
router.get('/admin', auth, requireSystemSettings, getAdminSiteSettings);

/**
 * @route   PUT /api/settings
 * @desc    Update site settings
 * @access  Private (Admin or System Settings permission)
 */
router.put('/', auth, requireSystemSettings, settingsValidation, updateSiteSettings);

/**
 * @route   PUT /api/settings/contact
 * @desc    Update contact information
 * @access  Private (Admin or System Settings permission)
 */
router.put('/contact', auth, requireSystemSettings, contactValidation, updateContactInfo);


/**
 * @route   PUT /api/settings/email
 * @desc    Update email settings
 * @access  Private (Admin only)
 */
router.put('/email', auth, requireAdmin, emailValidation, updateEmailSettings);

/**
 * @route   POST /api/settings/reset
 * @desc    Reset settings to default
 * @access  Private (Admin only)
 */
router.post('/reset', auth, requireAdmin, resetToDefault);

module.exports = router;