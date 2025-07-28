const SiteSettings = require('../models/SiteSettings');
const { body, validationResult } = require('express-validator');

/**
 * Get current site settings
 * GET /api/settings
 */
const getSiteSettings = async (req, res) => {
  try {
    const settings = await SiteSettings.getCurrentSettings();
    
    // Remove sensitive information from public response
    const publicSettings = {
      companyEmail: settings.companyEmail,
      companyPhone: settings.companyPhone,
      companyAddress: settings.companyAddress,
      workingHours: settings.workingHours,
      socialMedia: settings.socialMedia,
      siteTitle: settings.siteTitle,
      siteDescription: settings.siteDescription,
      siteKeywords: settings.siteKeywords,
      version: settings.version
    };

    res.json({
      success: true,
      data: publicSettings
    });
  } catch (error) {
    console.error('Get site settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch site settings',
      error: error.message
    });
  }
};

/**
 * Get all site settings (admin only)
 * GET /api/settings/admin
 */
const getAdminSiteSettings = async (req, res) => {
  try {
    const settings = await SiteSettings.getCurrentSettings();
    
    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Get admin site settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch site settings',
      error: error.message
    });
  }
};

/**
 * Update site settings
 * PUT /api/settings
 */
const updateSiteSettings = async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const updates = req.body;
    const userId = req.user.id;

    const settings = await SiteSettings.updateSettings(updates, userId);

    res.json({
      success: true,
      message: 'Site settings updated successfully',
      data: settings
    });
  } catch (error) {
    console.error('Update site settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update site settings',
      error: error.message
    });
  }
};

/**
 * Update contact information
 * PUT /api/settings/contact
 */
const updateContactInfo = async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { companyEmail, companyPhone, companyAddress, workingHours } = req.body;
    const userId = req.user.id;

    const updates = {};
    if (companyEmail) updates.companyEmail = companyEmail;
    if (companyPhone) updates.companyPhone = companyPhone;
    if (companyAddress) updates.companyAddress = companyAddress;
    if (workingHours) updates.workingHours = workingHours;

    const settings = await SiteSettings.updateSettings(updates, userId);

    res.json({
      success: true,
      message: 'Contact information updated successfully',
      data: {
        companyEmail: settings.companyEmail,
        companyPhone: settings.companyPhone,
        companyAddress: settings.companyAddress,
        workingHours: settings.workingHours
      }
    });
  } catch (error) {
    console.error('Update contact info error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update contact information',
      error: error.message
    });
  }
};


/**
 * Update email settings
 * PUT /api/settings/email
 */
const updateEmailSettings = async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { emailSettings, notifications } = req.body;
    const userId = req.user.id;

    const updates = {};
    if (emailSettings) updates.emailSettings = emailSettings;
    if (notifications) updates.notifications = notifications;

    const settings = await SiteSettings.updateSettings(updates, userId);

    res.json({
      success: true,
      message: 'Email settings updated successfully',
      data: {
        emailSettings: settings.emailSettings,
        notifications: settings.notifications
      }
    });
  } catch (error) {
    console.error('Update email settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update email settings',
      error: error.message
    });
  }
};

/**
 * Reset settings to default
 * POST /api/settings/reset
 */
const resetToDefault = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Delete current settings and let the model create new default ones
    await SiteSettings.deleteMany({});
    const settings = await SiteSettings.getCurrentSettings();
    settings.lastModifiedBy = userId;
    await settings.save();

    res.json({
      success: true,
      message: 'Settings reset to default successfully',
      data: settings
    });
  } catch (error) {
    console.error('Reset settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset settings',
      error: error.message
    });
  }
};

// Validation middleware
const settingsValidation = [
  body('companyEmail')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid company email'),
  
  body('companyPhone')
    .optional()
    .trim()
    .isLength({ min: 5, max: 20 })
    .withMessage('Phone number must be between 5 and 20 characters'),
  
  body('siteTitle')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Site title must be between 3 and 100 characters'),
  
  body('siteDescription')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Site description cannot exceed 500 characters'),
  
  body('maintenanceMessage')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Maintenance message cannot exceed 1000 characters')
];

const contactValidation = [
  body('companyEmail')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid company email'),
  
  body('companyPhone')
    .optional()
    .trim()
    .isLength({ min: 5, max: 20 })
    .withMessage('Phone number must be between 5 and 20 characters')
];


const emailValidation = [
  body('emailSettings.smtpHost')
    .optional()
    .trim()
    .isLength({ min: 3 })
    .withMessage('SMTP host is required'),
  
  body('emailSettings.smtpPort')
    .optional()
    .isInt({ min: 1, max: 65535 })
    .withMessage('SMTP port must be a valid port number'),
  
  body('emailSettings.emailFrom')
    .optional()
    .isEmail()
    .withMessage('From email must be valid')
];

module.exports = {
  getSiteSettings,
  getAdminSiteSettings,
  updateSiteSettings,
  updateContactInfo,
  updateEmailSettings,
  resetToDefault,
  settingsValidation,
  contactValidation,
  emailValidation
};