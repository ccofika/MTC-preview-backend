const express = require('express');
const router = express.Router();
const homepageSettingsController = require('../controllers/homepageSettingsController');
const auth = require('../middleware/auth');
const { checkRole } = require('../middleware/auth');

// Public route - get featured products for homepage display
router.get('/featured-products', homepageSettingsController.getFeaturedProducts);

// Admin routes - require authentication and admin role
router.use(auth); // Apply auth middleware to all routes below

// Get homepage settings with metadata (admin only)
router.get('/admin', 
  checkRole(['admin', 'manager']), 
  homepageSettingsController.getHomepageSettings
);

// Update featured products (admin only)
router.put('/featured-products', 
  checkRole(['admin', 'manager']), 
  homepageSettingsController.featuredProductsValidation,
  homepageSettingsController.updateFeaturedProducts
);

// Clear all featured products (admin only)
router.delete('/featured-products', 
  checkRole(['admin', 'manager']), 
  homepageSettingsController.clearFeaturedProducts
);

// Add single product to featured products (admin only)
router.post('/featured-products/:productId', 
  checkRole(['admin', 'manager']), 
  homepageSettingsController.addProductValidation,
  homepageSettingsController.addFeaturedProduct
);

// Remove single product from featured products (admin only)
router.delete('/featured-products/:productId', 
  checkRole(['admin', 'manager']), 
  homepageSettingsController.removeFeaturedProduct
);

module.exports = router;