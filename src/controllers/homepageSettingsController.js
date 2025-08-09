const HomepageSettings = require('../models/HomepageSettings');
const Product = require('../models/Product');
const { body, validationResult } = require('express-validator');

/**
 * Get current featured products for homepage
 * GET /api/homepage-settings/featured-products
 */
const getFeaturedProducts = async (req, res) => {
  try {
    const settings = await HomepageSettings.getCurrentSettings();
    const featuredProducts = await settings.getFeaturedProductsWithData();
    
    res.json({
      success: true,
      data: featuredProducts
    });
  } catch (error) {
    console.error('Get featured products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch featured products',
      error: error.message
    });
  }
};

/**
 * Get homepage settings (admin only) - includes metadata
 * GET /api/homepage-settings/admin
 */
const getHomepageSettings = async (req, res) => {
  try {
    const settings = await HomepageSettings.getCurrentSettings();
    
    // Ensure featured products are populated with product data
    await settings.populate('featuredProducts.productId');
    
    res.json({
      success: true,
      data: {
        featuredProducts: settings.featuredProducts,
        lastModifiedBy: settings.lastModifiedBy,
        updatedAt: settings.updatedAt,
        createdAt: settings.createdAt
      }
    });
  } catch (error) {
    console.error('Get homepage settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch homepage settings',
      error: error.message
    });
  }
};

/**
 * Update featured products (admin only)
 * PUT /api/homepage-settings/featured-products
 * Body: { featuredProducts: [{ productId: "id", order: 1 }, ...] }
 */
const updateFeaturedProducts = async (req, res) => {
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

    const { featuredProducts } = req.body;
    const userId = req.user.id;

    // Validate that all products exist and are active
    if (featuredProducts && featuredProducts.length > 0) {
      const productIds = featuredProducts.map(fp => fp.productId);
      const existingProducts = await Product.find({ 
        _id: { $in: productIds }, 
        isActive: true 
      });

      if (existingProducts.length !== productIds.length) {
        const foundIds = existingProducts.map(p => p._id.toString());
        const missingIds = productIds.filter(id => !foundIds.includes(id));
        
        return res.status(400).json({
          success: false,
          message: 'Some products are invalid or inactive',
          invalidProducts: missingIds
        });
      }
    }

    const settings = await HomepageSettings.updateFeaturedProducts(
      featuredProducts || [], 
      userId
    );

    // Populate product data for response
    await settings.populate('featuredProducts.productId');

    res.json({
      success: true,
      message: 'Featured products updated successfully',
      data: {
        featuredProducts: settings.featuredProducts,
        lastModifiedBy: settings.lastModifiedBy,
        updatedAt: settings.updatedAt
      }
    });
  } catch (error) {
    console.error('Update featured products error:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update featured products',
      error: error.message
    });
  }
};

/**
 * Clear all featured products (admin only)
 * DELETE /api/homepage-settings/featured-products
 */
const clearFeaturedProducts = async (req, res) => {
  try {
    const userId = req.user.id;
    const settings = await HomepageSettings.updateFeaturedProducts([], userId);

    res.json({
      success: true,
      message: 'Featured products cleared successfully',
      data: {
        featuredProducts: settings.featuredProducts,
        lastModifiedBy: settings.lastModifiedBy,
        updatedAt: settings.updatedAt
      }
    });
  } catch (error) {
    console.error('Clear featured products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear featured products',
      error: error.message
    });
  }
};

/**
 * Add product to featured products (admin only)
 * POST /api/homepage-settings/featured-products/:productId
 */
const addFeaturedProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const { order } = req.body;
    const userId = req.user.id;

    // Validate product exists and is active
    const product = await Product.findOne({ _id: productId, isActive: true });
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or inactive'
      });
    }

    const settings = await HomepageSettings.getCurrentSettings();
    
    // Check if product is already featured
    const existingIndex = settings.featuredProducts.findIndex(
      fp => fp.productId.toString() === productId
    );
    
    if (existingIndex >= 0) {
      return res.status(400).json({
        success: false,
        message: 'Product is already featured'
      });
    }

    // Check if we're at max capacity
    if (settings.featuredProducts.length >= 4) {
      return res.status(400).json({
        success: false,
        message: 'Maximum 4 featured products allowed'
      });
    }

    // Determine order if not provided
    const targetOrder = order || (settings.featuredProducts.length + 1);
    
    // Validate order is not already taken
    const orderTaken = settings.featuredProducts.some(fp => fp.order === targetOrder);
    if (orderTaken) {
      return res.status(400).json({
        success: false,
        message: `Order position ${targetOrder} is already taken`
      });
    }

    // Add the product
    settings.featuredProducts.push({ productId, order: targetOrder });
    settings.lastModifiedBy = userId;
    await settings.save();

    // Populate for response
    await settings.populate('featuredProducts.productId');

    res.json({
      success: true,
      message: 'Product added to featured products successfully',
      data: {
        featuredProducts: settings.featuredProducts,
        lastModifiedBy: settings.lastModifiedBy,
        updatedAt: settings.updatedAt
      }
    });
  } catch (error) {
    console.error('Add featured product error:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to add featured product',
      error: error.message
    });
  }
};

/**
 * Remove product from featured products (admin only)
 * DELETE /api/homepage-settings/featured-products/:productId
 */
const removeFeaturedProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;

    const settings = await HomepageSettings.getCurrentSettings();
    
    // Find and remove the product
    const initialLength = settings.featuredProducts.length;
    settings.featuredProducts = settings.featuredProducts.filter(
      fp => fp.productId.toString() !== productId
    );

    if (settings.featuredProducts.length === initialLength) {
      return res.status(404).json({
        success: false,
        message: 'Product not found in featured products'
      });
    }

    settings.lastModifiedBy = userId;
    await settings.save();

    // Populate for response
    await settings.populate('featuredProducts.productId');

    res.json({
      success: true,
      message: 'Product removed from featured products successfully',
      data: {
        featuredProducts: settings.featuredProducts,
        lastModifiedBy: settings.lastModifiedBy,
        updatedAt: settings.updatedAt
      }
    });
  } catch (error) {
    console.error('Remove featured product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove featured product',
      error: error.message
    });
  }
};

// Validation middleware
const featuredProductsValidation = [
  body('featuredProducts')
    .optional()
    .isArray({ max: 4 })
    .withMessage('Featured products must be an array with maximum 4 items'),
  
  body('featuredProducts.*.productId')
    .if(body('featuredProducts').exists())
    .isMongoId()
    .withMessage('Product ID must be a valid MongoDB ObjectId'),
  
  body('featuredProducts.*.order')
    .if(body('featuredProducts').exists())
    .isInt({ min: 1, max: 4 })
    .withMessage('Order must be an integer between 1 and 4')
];

const addProductValidation = [
  body('order')
    .optional()
    .isInt({ min: 1, max: 4 })
    .withMessage('Order must be an integer between 1 and 4')
];

module.exports = {
  getFeaturedProducts,
  getHomepageSettings,
  updateFeaturedProducts,
  clearFeaturedProducts,
  addFeaturedProduct,
  removeFeaturedProduct,
  featuredProductsValidation,
  addProductValidation
};