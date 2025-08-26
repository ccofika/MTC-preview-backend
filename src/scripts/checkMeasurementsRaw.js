const mongoose = require('mongoose');
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

// Check measurements using raw MongoDB queries
const checkMeasurements = async () => {
  try {
    const db = mongoose.connection.db;
    const collection = db.collection('products');
    
    console.log('Checking products collection directly...');
    
    // Get all products
    const allProducts = await collection.find({}).toArray();
    console.log(`Found ${allProducts.length} total products`);
    
    // Check each product for measurements
    allProducts.forEach((product, index) => {
      console.log(`\nProduct ${index + 1}: ${product.title?.sr || 'Unknown'}`);
      console.log(`  - Has measurements: ${product.hasOwnProperty('measurements')}`);
      console.log(`  - Has measurementGroups: ${product.hasOwnProperty('measurementGroups')}`);
      
      if (product.hasOwnProperty('measurements')) {
        console.log(`  - Measurements type: ${typeof product.measurements}`);
        console.log(`  - Measurements value:`, product.measurements);
        
        if (Array.isArray(product.measurements)) {
          console.log(`  - Measurements length: ${product.measurements.length}`);
          product.measurements.forEach((measurement, mIndex) => {
            console.log(`    ${mIndex + 1}: ${measurement.name?.sr || 'Unknown'} = ${measurement.value || 'Unknown'}`);
          });
        }
      }
      
      if (product.hasOwnProperty('measurementGroups')) {
        console.log(`  - MeasurementGroups type: ${typeof product.measurementGroups}`);
        console.log(`  - MeasurementGroups:`, product.measurementGroups);
      }
    });
    
    // Now try to remove measurements field
    console.log('\n🗑️  Attempting to remove measurements field...');
    
    const result = await collection.updateMany(
      {},
      { $unset: { measurements: "" } }
    );
    
    console.log(`Updated ${result.modifiedCount} products`);
    
    // Verify removal
    console.log('\n🔍 Verifying removal...');
    const afterProducts = await collection.find({}).toArray();
    afterProducts.forEach((product, index) => {
      if (product.hasOwnProperty('measurements')) {
        console.log(`Product ${index + 1} still has measurements:`, product.measurements);
      }
    });
    
    const stillHaveMeasurements = afterProducts.filter(p => p.hasOwnProperty('measurements'));
    console.log(`${stillHaveMeasurements.length} products still have measurements field`);
    
  } catch (error) {
    console.error('❌ Error during check:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Database connection closed');
  }
};

// Run the check
const runCheck = async () => {
  await connectDB();
  await checkMeasurements();
  process.exit(0);
};

// Execute if run directly
if (require.main === module) {
  runCheck();
}

module.exports = { checkMeasurements };