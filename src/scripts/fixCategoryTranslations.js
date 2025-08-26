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

// Category mapping
const categoryMapping = {
  'Prozorski sistemi': {
    en: 'Window systems',
    de: 'Fenstersysteme'
  },
  'Vrata sistemi': {
    en: 'Door systems', 
    de: 'Türsysteme'
  },
  'Fasadni sistemi': {
    en: 'Facade systems',
    de: 'Fassadensysteme'
  },
  'Industrijski profili': {
    en: 'Industrial profiles',
    de: 'Industrieprofile'
  },
  'Ograde i balustrade': {
    en: 'Railings and balustrades',
    de: 'Geländer und Baluster'
  },
  'Roletne i žaluzine': {
    en: 'Shutters and blinds',
    de: 'Rollläden und Jalousien'
  },
  'Aluminijumski sistemi': {
    en: 'Aluminum systems',
    de: 'Aluminiumsysteme'
  }
};

// Fix category translations
const fixCategoryTranslations = async () => {
  try {
    console.log('Fixing category translations...\n');
    
    const products = await Product.find({});
    let updatedCount = 0;
    
    for (const product of products) {
      let needsUpdate = false;
      const updates = {};
      
      if (product.catalog && product.catalog.category && typeof product.catalog.category === 'object') {
        const srCategory = product.catalog.category.sr;
        const enCategory = product.catalog.category.en;
        const deCategory = product.catalog.category.de;
        
        // Check if we have mapping for this Serbian category
        if (srCategory && categoryMapping[srCategory]) {
          const correctTranslations = categoryMapping[srCategory];
          
          // Fix EN translation if it's wrong
          if (!enCategory || enCategory === srCategory || enCategory !== correctTranslations.en) {
            console.log(`Fixing EN category for "${product.title?.sr}": "${enCategory}" → "${correctTranslations.en}"`);
            updates['catalog.category.en'] = correctTranslations.en;
            needsUpdate = true;
          }
          
          // Fix DE translation if it's wrong  
          if (!deCategory || deCategory === srCategory || deCategory !== correctTranslations.de) {
            console.log(`Fixing DE category for "${product.title?.sr}": "${deCategory}" → "${correctTranslations.de}"`);
            updates['catalog.category.de'] = correctTranslations.de;
            needsUpdate = true;
          }
        } else if (srCategory) {
          console.log(`⚠️  No mapping found for category: "${srCategory}" in product "${product.title?.sr}"`);
        }
      }
      
      if (needsUpdate) {
        await Product.findByIdAndUpdate(product._id, { $set: updates });
        updatedCount++;
        console.log(`✅ Updated product: "${product.title?.sr}"\n`);
      }
    }
    
    console.log(`\n🎉 Successfully updated ${updatedCount} products with correct category translations`);
    
  } catch (error) {
    console.error('❌ Error during fix:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Database connection closed');
  }
};

// Run the fix
const runFix = async () => {
  await connectDB();
  await fixCategoryTranslations();
  process.exit(0);
};

// Execute if run directly
if (require.main === module) {
  runFix();
}

module.exports = { fixCategoryTranslations };