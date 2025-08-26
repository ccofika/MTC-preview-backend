const mongoose = require('mongoose');
const Product = require('../models/Product');
require('dotenv').config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/nissal';
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected for cleanup...');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

// Clean old measurements from all products
const cleanOldMeasurements = async () => {
  try {
    console.log('Starting cleanup of old measurements...');
    
    // Find all products that have the old measurements field
    const allProducts = await Product.find({});
    console.log(`Found ${allProducts.length} total products in database`);
    
    const productsWithOldMeasurements = await Product.find({
      measurements: { $exists: true }
    });
    
    console.log(`Found ${productsWithOldMeasurements.length} products with old measurements field`);
    
    if (productsWithOldMeasurements.length > 0) {
      // Log what will be deleted
      productsWithOldMeasurements.forEach(product => {
        console.log(`Product: ${product.title?.sr || 'Unknown'}`);
        console.log(`  - Has measurements field: ${product.measurements !== undefined}`);
        console.log(`  - Measurements type: ${typeof product.measurements}`);
        console.log(`  - Measurements length: ${product.measurements?.length || 0}`);
        console.log(`  - Measurements content:`, product.measurements);
        
        if (product.measurements && Array.isArray(product.measurements)) {
          product.measurements.forEach((measurement, index) => {
            console.log(`  - Measurement ${index + 1}: ${measurement.name?.sr || 'Unknown'} = ${measurement.value || 'Unknown'}`);
          });
        }
        console.log('---');
      });
      
      // Ask for confirmation before deletion
      console.log('\n🗑️  DELETING old measurements field from ALL products...\n');
      
      // Remove the old measurements field from all products
      const result = await Product.updateMany(
        { measurements: { $exists: true } },
        { $unset: { measurements: 1 } }
      );
      
      console.log(`✅ Successfully removed old measurements field from ${result.modifiedCount} products`);
    } else {
      console.log('✅ No products found with old measurements field');
    }
    
    // Verify cleanup
    const remainingProductsWithMeasurements = await Product.find({
      measurements: { $exists: true }
    });
    
    console.log(`\n🔍 Verification: ${remainingProductsWithMeasurements.length} products still have measurements field`);
    
    if (remainingProductsWithMeasurements.length > 0) {
      console.log('Remaining products with measurements:');
      remainingProductsWithMeasurements.forEach(product => {
        console.log(`- ${product.title?.sr || 'Unknown'}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Database connection closed');
  }
};

// Run the cleanup
const runCleanup = async () => {
  await connectDB();
  await cleanOldMeasurements();
  process.exit(0);
};

// Execute if run directly
if (require.main === module) {
  runCleanup();
}

module.exports = { cleanOldMeasurements };