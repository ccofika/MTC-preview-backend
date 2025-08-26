const mongoose = require('mongoose');
const Product = require('../models/Product');
require('dotenv').config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/nissal';
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected...');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

// Check categories in products
const checkCategories = async () => {
  try {
    console.log('Checking product categories...');
    
    const products = await Product.find({}).select('title catalog');
    
    console.log(`Found ${products.length} products`);
    
    products.forEach((product, index) => {
      console.log(`\nProduct ${index + 1}: ${product.title?.sr || 'Unknown'}`);
      console.log(`  Catalog:`, product.catalog);
      console.log(`  Category type:`, typeof product.catalog?.category);
      console.log(`  Category value:`, product.catalog?.category);
      
      if (typeof product.catalog?.category === 'object') {
        console.log(`  Category SR:`, product.catalog.category.sr);
        console.log(`  Category EN:`, product.catalog.category.en);
        console.log(`  Category DE:`, product.catalog.category.de);
      }
    });
    
  } catch (error) {
    console.error('❌ Error during check:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDatabase connection closed');
  }
};

// Run the check
const runCheck = async () => {
  await connectDB();
  await checkCategories();
  process.exit(0);
};

// Execute if run directly
if (require.main === module) {
  runCheck();
}

module.exports = { checkCategories };