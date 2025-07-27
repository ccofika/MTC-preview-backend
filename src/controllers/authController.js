const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

/**
 * Admin login
 * POST /api/auth/login
 */
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Basic validation
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }

    // Find user by email (username is email or the simplified username)
    const email = username === 'nissalmtctestmail' ? 'nissalmtctestmail@gmail.com' : username;
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Neispravni podaci za prijavu. Molimo proverite korisničko ime i lozinku.'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Neispravni podaci za prijavu. Molimo proverite korisničko ime i lozinku.'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Create JWT token
    const token = jwt.sign(
      { 
        id: user._id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '30d' }
    );

    // Create user object for response
    const userData = {
      id: user._id,
      username: user.email.split('@')[0], // Extract username part from email
      name: user.name,
      email: user.email,
      role: user.role,
      loginTime: new Date().toISOString()
    };

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: userData
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during login',
      error: error.message
    });
  }
};

/**
 * Verify token and get user info
 * GET /api/auth/me
 */
const getMe = async (req, res) => {
  try {
    // User is attached to req by auth middleware
    const user = req.user;

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Logout (invalidate token on client side)
 * POST /api/auth/logout
 */
const logout = async (req, res) => {
  try {
    // Since we're using stateless JWT, logout is handled on the client side
    // by removing the token from localStorage
    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during logout',
      error: error.message
    });
  }
};

/**
 * Refresh token
 * POST /api/auth/refresh
 */
const refreshToken = async (req, res) => {
  try {
    const user = req.user;

    // Create new JWT token
    const token = jwt.sign(
      { 
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '30d' }
    );

    res.json({
      success: true,
      data: {
        token,
        user
      }
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during token refresh',
      error: error.message
    });
  }
};

module.exports = {
  login,
  getMe,
  logout,
  refreshToken
};