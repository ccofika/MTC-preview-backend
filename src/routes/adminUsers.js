const express = require('express');
const {
  getAllAdminUsers,
  getAdminUser,
  createAdminUser,
  updateAdminUser,
  deleteAdminUser,
  toggleUserStatus,
  changeUserPassword,
  createUserValidation,
  updateUserValidation,
  changePasswordValidation
} = require('../controllers/adminUserController');
const auth = require('../middleware/auth');

const router = express.Router();

// Middleware to check if user has admin permissions
const requireAdminOrManager = (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'manager') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin or manager role required.'
    });
  }
  next();
};

// Middleware to check if user has admin permissions for user management
const requireUserManagement = (req, res, next) => {
  try {
    if (req.user.role === 'admin') {
      return next();
    }
    
    if (req.user.permissions && req.user.permissions.includes('manage_users')) {
      return next();
    }
    
    return res.status(403).json({
      success: false,
      message: 'Access denied. User management permission required.'
    });
  } catch (error) {
    console.error('Permission check error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error checking permissions.'
    });
  }
};

/**
 * @route   GET /api/adminUsers
 * @desc    Get all admin users
 * @access  Private (Admin/Manager with manage_users permission)
 */
router.get('/', auth, requireUserManagement, getAllAdminUsers);

/**
 * @route   GET /api/adminUsers/:id
 * @desc    Get single admin user
 * @access  Private (Admin/Manager with manage_users permission)
 */
router.get('/:id', auth, requireUserManagement, getAdminUser);

/**
 * @route   POST /api/adminUsers
 * @desc    Create new admin user
 * @access  Private (Admin/Manager with manage_users permission)
 */
router.post('/', auth, requireUserManagement, createUserValidation, createAdminUser);

/**
 * @route   PUT /api/adminUsers/:id
 * @desc    Update admin user
 * @access  Private (Admin/Manager with manage_users permission)
 */
router.put('/:id', auth, requireUserManagement, updateUserValidation, updateAdminUser);

/**
 * @route   DELETE /api/adminUsers/:id
 * @desc    Delete admin user
 * @access  Private (Admin only)
 */
router.delete('/:id', auth, (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin role required for user deletion.'
    });
  }
  next();
}, deleteAdminUser);

/**
 * @route   PATCH /api/adminUsers/:id/toggle-status
 * @desc    Disable/Enable admin user
 * @access  Private (Admin/Manager with manage_users permission)
 */
router.patch('/:id/toggle-status', auth, requireUserManagement, toggleUserStatus);

/**
 * @route   PATCH /api/adminUsers/:id/change-password
 * @desc    Change user password
 * @access  Private (Admin/Manager with manage_users permission)
 */
router.patch('/:id/change-password', auth, requireUserManagement, changePasswordValidation, changeUserPassword);

module.exports = router;