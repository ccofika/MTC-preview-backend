const mongoose = require('mongoose');
const Product = require('../models/Product');
require('dotenv').config();

const mockProducts = [
  {
    title: 'PVC Prozor Standard Line',
    description: 'Kvalitetan PVC prozor sa termopan staklom. Odličan izbor za stambene objekte. Energetski efikasan sa visokim stepenom toplotne izolacije.',
    gallery: [],
    catalog: {
      catalogNumber: 'PVC-STD-001',
      category: 'Prozorski sistemi',
      subcategory: 'PVC Prozori',
      tags: ['pvc', 'prozor', 'standard', 'energetski efikasan']
    },
    colors: [
      { name: 'Bela', hexCode: '#FFFFFF', available: true },
      { name: 'Braon', hexCode: '#8B4513', available: true }
    ],
    sizes: [
      { name: 'Standard', code: 'STD', available: true },
      { name: 'Veliki', code: 'LRG', available: true }
    ],
    price: {
      amount: 25000,
      currency: 'RSD'
    },
    availability: {
      inStock: true,
      quantity: 50
    },
    measurements: [
      {
        size: 'Standard',
        dimensions: { length: '1200', width: '1000', height: '120', weight: '25' }
      }
    ]
  },
  {
    title: 'Aluminijumski Prozor Premium',
    description: 'Premium aluminijumski prozor sa termo prekidom. Idealan za moderne objekte. Otporan na vremenske uslove i koroziju.',
    gallery: [],
    catalog: {
      catalogNumber: 'ALU-PREM-002',
      category: 'Prozorski sistemi',
      subcategory: 'Aluminijumski Prozori',
      tags: ['aluminijum', 'prozor', 'premium', 'termo prekid']
    },
    colors: [
      { name: 'Antracit', hexCode: '#36454F', available: true },
      { name: 'Srebrna', hexCode: '#C0C0C0', available: true }
    ],
    sizes: [
      { name: 'Standard', code: 'STD', available: true },
      { name: 'XL', code: 'XL', available: true }
    ],
    price: {
      amount: 45000,
      currency: 'RSD'
    },
    availability: {
      inStock: true,
      quantity: 30
    },
    measurements: [
      {
        size: 'Standard',
        dimensions: { length: '1400', width: '1200', height: '80', weight: '18' }
      }
    ]
  },
  {
    title: 'Klizna Terasa Vrata',
    description: 'Moderna klizna terasa vrata sa velikim staklenim površinama. Omogućava maksimalno prirodno osvetljenje i povezuje unutrašnji i spoljašnji prostor.',
    gallery: [],
    catalog: {
      catalogNumber: 'DOOR-SLIDE-003',
      category: 'Vrata sistemi',
      subcategory: 'Klizna Vrata',
      tags: ['klizna vrata', 'terasa', 'veliki stakla', 'modern']
    },
    colors: [
      { name: 'Crna', hexCode: '#000000', available: true },
      { name: 'Bela', hexCode: '#FFFFFF', available: true }
    ],
    sizes: [
      { name: 'Dvokrila', code: '2W', available: true },
      { name: 'Trokrila', code: '3W', available: true }
    ],
    price: {
      amount: 85000,
      currency: 'RSD'
    },
    availability: {
      inStock: true,
      quantity: 15
    },
    measurements: [
      {
        size: 'Dvokrila',
        dimensions: { length: '2400', width: '2200', height: '150', weight: '120' }
      }
    ]
  },
  {
    title: 'Fasadni Sistem Curtain Wall',
    description: 'Napredni fasadni sistem za velike poslovne objekte. Kombinuje funkcionalnost i estetiku. Visoke performanse toplotne i zvučne izolacije.',
    gallery: [],
    catalog: {
      catalogNumber: 'FAS-CW-004',
      category: 'Fasadni sistemi',
      subcategory: 'Curtain Wall',
      tags: ['fasada', 'curtain wall', 'poslovni objekti', 'veliki projekti']
    },
    colors: [
      { name: 'Antracit', hexCode: '#36454F', available: true },
      { name: 'Champagne', hexCode: '#F7E7CE', available: true }
    ],
    sizes: [
      { name: 'Modularni', code: 'MOD', available: true }
    ],
    price: {
      amount: 150000,
      currency: 'RSD'
    },
    availability: {
      inStock: false,
      quantity: 0
    },
    measurements: [
      {
        size: 'Modularni',
        dimensions: { length: '3000', width: '1500', height: '200', weight: '80' }
      }
    ]
  },
  {
    title: 'Industrijski Profil Heavy Duty',
    description: 'Robustan industrijski profil za zahtevne primene. Visoka nosivost i otpornost na mehaničke uticaje. Idealan za industrijske hale i skladišta.',
    gallery: [],
    catalog: {
      catalogNumber: 'IND-HD-005',
      category: 'Industrijski profili',
      subcategory: 'Heavy Duty',
      tags: ['industrijski', 'heavy duty', 'visoka nosivost', 'hale']
    },
    colors: [
      { name: 'Prirodni aluminijum', hexCode: '#C0C0C0', available: true },
      { name: 'Anodizovani', hexCode: '#A9A9A9', available: true }
    ],
    sizes: [
      { name: '80x80', code: '80x80', available: true },
      { name: '100x100', code: '100x100', available: true }
    ],
    price: {
      amount: 3500,
      currency: 'RSD'
    },
    availability: {
      inStock: true,
      quantity: 200
    },
    measurements: [
      {
        size: '80x80',
        dimensions: { length: '6000', width: '80', height: '80', weight: '2.5' }
      }
    ]
  },
  {
    title: 'Staklena Ograda Moderna',
    description: 'Elegantna staklena ograda sa aluminijumskim okvirom. Savremeni dizajn koji ne narušava pogled. Sigurna i estetski privlačna.',
    gallery: [],
    catalog: {
      catalogNumber: 'RAIL-GLASS-006',
      category: 'Ograde i balustrade',
      subcategory: 'Staklene Ograde',
      tags: ['ograda', 'staklo', 'moderna', 'elegantna']
    },
    colors: [
      { name: 'Inox', hexCode: '#C0C0C0', available: true },
      { name: 'Crna mat', hexCode: '#2F2F2F', available: true }
    ],
    sizes: [
      { name: 'Standard', code: 'STD', available: true },
      { name: 'Visoka', code: 'HIGH', available: true }
    ],
    price: {
      amount: 12000,
      currency: 'RSD'
    },
    availability: {
      inStock: true,
      quantity: 25
    },
    measurements: [
      {
        size: 'Standard',
        dimensions: { length: '2000', width: '1100', height: '60', weight: '15' }
      }
    ]
  }
];

const seedProducts = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for seeding products...');

    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products');

    // Insert mock products
    const insertedProducts = await Product.insertMany(mockProducts);
    console.log(`✅ Successfully seeded ${insertedProducts.length} products`);

    // Log product titles
    insertedProducts.forEach(product => {
      console.log(`- ${product.title} (${product.catalog.catalogNumber})`);
    });

  } catch (error) {
    console.error('❌ Error seeding products:', error);
  } finally {
    // Close connection
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

// Run seeder if called directly
if (require.main === module) {
  seedProducts();
}

module.exports = seedProducts;