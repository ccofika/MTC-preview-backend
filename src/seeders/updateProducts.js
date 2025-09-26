const mongoose = require('mongoose');
const Product = require('../models/Product');
require('dotenv').config();

const newProducts = [
  {
    title: 'ALT 7500 - Termoizolacioni aluminijumski sistem',
    description: 'ALT 7500 predstavlja vrhunski termoizolacioni aluminijumski sistem namenjen za najzahtevnije projekte. Sa dubinom profila od 75mm i mogućnošću ugradnje stakla do 52mm, ovaj sistem pruža izuzetne toplotne performanse. Idealan za pasivne kuće i objekte sa visokim energetskim standardima.',
    gallery: [],
    catalog: {
      catalogNumber: 'ALT-7500',
      tags: ['aluminijum', 'termoizolacija', 'pasivna kuća', 'energetska efikasnost', 'ALT 7500']
    },
    colors: [
      { name: 'RAL 9016 Bela', hexCode: '#F1F0EA', available: true },
      { name: 'RAL 7016 Antracit siva', hexCode: '#383E42', available: true },
      { name: 'RAL 9005 Crna', hexCode: '#0A0A0A', available: true },
      { name: 'RAL 1015 Svetlo žuta', hexCode: '#E6D690', available: false }
    ],
    sizes: [
      { name: 'Standard 75mm', code: 'STD75', available: true },
      { name: 'Premium 75mm', code: 'PREM75', available: true }
    ],
    price: {
      amount: 65000,
      currency: 'RSD'
    },
    availability: {
      inStock: true,
      quantity: 75
    },
    measurements: [
      {
        size: 'Standard 75mm',
        dimensions: { length: '1400', width: '1200', height: '75', weight: '3.2' }
      }
    ]
  },
  {
    title: 'ALS 57 - Aluminijumski sistem za prozore',
    description: 'ALS 57 je moderni aluminijumski prozorski sistem koji kombinuje estetiku i funkcionalnost. Idealan je za stambene i poslovne objekte koji zahtevaju visoke performanse toplotne izolacije i dugotrajnost. Sistem ima dubinu od 57mm i omogućava ugradnju stakla do 32mm debljine.',
    gallery: [],
    catalog: {
      catalogNumber: 'ALS-57',
      tags: ['aluminijum', 'prozor', 'termo prekid', 'energetska efikasnost', 'ALS 57']
    },
    colors: [
      { name: 'RAL 9016 Bela', hexCode: '#F1F0EA', available: true },
      { name: 'RAL 7016 Antracit siva', hexCode: '#383E42', available: true },
      { name: 'RAL 8014 Sepija braon', hexCode: '#3E2723', available: true },
      { name: 'Prirodni aluminijum', hexCode: '#C0C0C0', available: true }
    ],
    sizes: [
      { name: 'Fiksni', code: 'FIX', available: true },
      { name: 'Otvorno', code: 'OPEN', available: true },
      { name: 'Otvorno-nagibni', code: 'TILT', available: true }
    ],
    price: {
      amount: 42000,
      currency: 'RSD'
    },
    availability: {
      inStock: true,
      quantity: 100
    },
    measurements: [
      {
        size: 'Standard',
        dimensions: { length: '1200', width: '1000', height: '57', weight: '2.1' }
      }
    ]
  },
  {
    title: 'ALS 57 Vrata - Aluminijumski sistem za vrata',
    description: 'ALS 57 Vrata je specijalizovani sistem za ulazna i terasa vrata baziran na ALS 57 platformi. Kombinuje dokazane performanse ALS 57 sistema sa dodatnim karakteristikama potrebnim za vrata. Pruža odličnu sigurnost, toplotnu izolaciju i trajnost.',
    gallery: [],
    catalog: {
      catalogNumber: 'ALS-57-VRATA',
      tags: ['aluminijum', 'vrata', 'ALS 57', 'ulazna vrata', 'terasa vrata']
    },
    colors: [
      { name: 'RAL 9016 Bela', hexCode: '#F1F0EA', available: true },
      { name: 'RAL 7016 Antracit siva', hexCode: '#383E42', available: true },
      { name: 'RAL 8014 Sepija braon', hexCode: '#3E2723', available: true },
      { name: 'RAL 9005 Crna', hexCode: '#0A0A0A', available: true },
      { name: 'Prirodni aluminijum', hexCode: '#C0C0C0', available: true }
    ],
    sizes: [
      { name: 'Jednostruko', code: 'SINGLE', available: true },
      { name: 'Dvostruko', code: 'DOUBLE', available: true },
      { name: 'Klizno', code: 'SLIDE', available: true }
    ],
    price: {
      amount: 75000,
      currency: 'RSD'
    },
    availability: {
      inStock: true,
      quantity: 60
    },
    measurements: [
      {
        size: 'Standard',
        dimensions: { length: '2100', width: '900', height: '57', weight: '35' }
      }
    ]
  },
  {
    title: 'Staklene Ograde - Premium stakleni baluster sistem',
    description: 'Premium staklene ograde sa aluminijumskim nosačima predstavljaju savršen spoj funkcionalnosti i estetike. Idealne su za moderne objekte, terase, balkone i stepenice. Pružaju maksimalnu transparentnost i osećaj prostora uz najveću sigurnost.',
    gallery: [],
    catalog: {
      catalogNumber: 'STGL-OGRADE',
      tags: ['staklo', 'ograda', 'baluster', 'moderna', 'transparentnost']
    },
    colors: [
      { name: 'Inox finish', hexCode: '#C0C0C0', available: true },
      { name: 'RAL 7016 Antracit siva', hexCode: '#383E42', available: true },
      { name: 'RAL 9005 Crna mat', hexCode: '#0A0A0A', available: true },
      { name: 'RAL 9016 Bela', hexCode: '#F1F0EA', available: true }
    ],
    sizes: [
      { name: 'Standard 1100mm', code: 'STD1100', available: true },
      { name: 'Visoka 1200mm', code: 'HIGH1200', available: true },
      { name: 'Ekstremno visoka 1400mm', code: 'EXHIGH1400', available: true }
    ],
    price: {
      amount: 18000,
      currency: 'RSD'
    },
    availability: {
      inStock: true,
      quantity: 85
    },
    measurements: [
      {
        size: 'Standard 1100mm',
        dimensions: { length: '2000', width: '1100', height: '50', weight: '12' }
      }
    ]
  },
  {
    title: 'ALS 4800 - Kompaktni aluminijumski sistem',
    description: 'ALS 4800 je kompaktni aluminijumski sistem dubine 48mm, dizajniran za projekte gde je potreban balans između performansi i ekonomičnosti. Ovaj sistem je idealan za renovacije postojećih objekata i projekte sa ograničenim budžetom, a da se ne žrtvuju osnovne karakteristike kvalitetnog aluminijumskog sistema.',
    gallery: [],
    catalog: {
      catalogNumber: 'ALS-4800',
      tags: ['aluminijum', 'kompaktni', 'ekonomski', 'renovacija', 'ALS 4800']
    },
    colors: [
      { name: 'RAL 9016 Bela', hexCode: '#F1F0EA', available: true },
      { name: 'RAL 7016 Antracit siva', hexCode: '#383E42', available: true },
      { name: 'RAL 8014 Sepija braon', hexCode: '#3E2723', available: true }
    ],
    sizes: [
      { name: 'Kompaktni 48mm', code: 'COMP48', available: true },
      { name: 'Standardni 48mm', code: 'STD48', available: true }
    ],
    price: {
      amount: 35000,
      currency: 'RSD'
    },
    availability: {
      inStock: true,
      quantity: 120
    },
    measurements: [
      {
        size: 'Kompaktni 48mm',
        dimensions: { length: '1100', width: '900', height: '48', weight: '1.8' }
      }
    ]
  },
  {
    title: 'ALD 9100 - Premium aluminijumski sistem za vrata',
    description: 'ALD 9100 je premium aluminijumski sistem specifično dizajniran za ulazna vrata i terasa vrata. Sa robusnom konstrukcijom dubine 91mm, ovaj sistem pruža maksimalnu sigurnost, toplotnu izolaciju i trajnost. Idealan je za luksuzne stambene i prestižne poslovne objekte.',
    gallery: [],
    catalog: {
      catalogNumber: 'ALD-9100',
      tags: ['aluminijum', 'vrata', 'premium', 'sigurnost', 'ALD 9100']
    },
    colors: [
      { name: 'RAL 9016 Bela', hexCode: '#F1F0EA', available: true },
      { name: 'RAL 7016 Antracit siva', hexCode: '#383E42', available: true },
      { name: 'RAL 9005 Crna', hexCode: '#0A0A0A', available: true },
      { name: 'RAL 3004 Purpurno crvena', hexCode: '#75151E', available: true },
      { name: 'Prirodni aluminijum', hexCode: '#C0C0C0', available: true }
    ],
    sizes: [
      { name: 'Jednostruko', code: 'SINGLE', available: true },
      { name: 'Dvostruko', code: 'DOUBLE', available: true },
      { name: 'Klizno', code: 'SLIDE', available: true }
    ],
    price: {
      amount: 95000,
      currency: 'RSD'
    },
    availability: {
      inStock: true,
      quantity: 45
    },
    measurements: [
      {
        size: 'Jednostruko',
        dimensions: { length: '2100', width: '900', height: '91', weight: '45' }
      }
    ]
  }
];

const updateProducts = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('🔗 Connected to MongoDB for updating products...');

    // Clear existing products
    const deletedCount = await Product.deleteMany({});
    console.log(`🗑️  Deleted ${deletedCount.deletedCount} existing products`);

    // Insert new products
    const insertedProducts = await Product.insertMany(newProducts);
    console.log(`✅ Successfully added ${insertedProducts.length} new products`);

    // Log new product details
    console.log('\n📦 New products added:');
    insertedProducts.forEach(product => {
      console.log(`   - ${product.title}`);
      console.log(`     Catalog: ${product.catalog.catalogNumber}`);
      console.log(`     Price: ${product.price.amount} ${product.price.currency}`);
      console.log(`     In Stock: ${product.availability.quantity} pieces`);
      console.log('');
    });

    console.log('🎉 Product update completed successfully!');

  } catch (error) {
    console.error('❌ Error updating products:', error);
    process.exit(1);
  } finally {
    // Close connection
    await mongoose.connection.close();
    console.log('📱 Database connection closed');
  }
};

// Run update if called directly
if (require.main === module) {
  updateProducts();
}

module.exports = updateProducts;