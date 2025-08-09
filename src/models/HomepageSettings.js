const mongoose = require('mongoose');

const homepageSettingsSchema = new mongoose.Schema({
  featuredProducts: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    order: {
      type: Number,
      required: true,
      min: 1,
      max: 4
    }
  }],
  
  // Metadata
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Index for faster queries
homepageSettingsSchema.index({ lastModifiedBy: 1 });
homepageSettingsSchema.index({ 'featuredProducts.order': 1 });

// Validate max 4 featured products
homepageSettingsSchema.pre('save', function(next) {
  if (this.featuredProducts && this.featuredProducts.length > 4) {
    const error = new Error('Maximum 4 featured products allowed');
    error.name = 'ValidationError';
    return next(error);
  }

  // Validate unique order numbers
  const orders = this.featuredProducts.map(fp => fp.order);
  const uniqueOrders = [...new Set(orders)];
  if (orders.length !== uniqueOrders.length) {
    const error = new Error('Featured products must have unique order numbers');
    error.name = 'ValidationError';
    return next(error);
  }

  next();
});

// Static method to get current homepage settings (singleton pattern)
homepageSettingsSchema.statics.getCurrentSettings = async function() {
  let settings = await this.findOne({}).populate('featuredProducts.productId');
  
  if (!settings) {
    // Create default settings if none exist
    settings = await this.create({ featuredProducts: [] });
  }
  
  return settings;
};

// Method to update featured products
homepageSettingsSchema.statics.updateFeaturedProducts = async function(featuredProducts, userId) {
  let settings = await this.findOne({});
  
  if (!settings) {
    settings = new this({ featuredProducts: [], lastModifiedBy: userId });
  } else {
    settings.featuredProducts = featuredProducts;
    settings.lastModifiedBy = userId;
  }
  
  return await settings.save();
};

// Method to get featured products with full product data
homepageSettingsSchema.methods.getFeaturedProductsWithData = async function() {
  await this.populate('featuredProducts.productId');
  
  return this.featuredProducts
    .filter(fp => fp.productId && fp.productId.isActive && !fp.productId.isHidden)
    .sort((a, b) => a.order - b.order)
    .map(fp => fp.productId);
};

module.exports = mongoose.model('HomepageSettings', homepageSettingsSchema);