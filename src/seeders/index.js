const mongoose = require('mongoose');
const Product = require('../models/Product');
const Project = require('../models/Project');
const Message = require('../models/Message');
const User = require('../models/User');
const SiteSettings = require('../models/SiteSettings');
const seedSiteSettings = require('./siteSettingsSeeder');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected for seeding...');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

const clearDatabase = async () => {
  try {
    await Product.deleteMany({});
    await Project.deleteMany({});
    await Message.deleteMany({});
    await User.deleteMany({});
    await SiteSettings.deleteMany({});
    console.log('Database cleared successfully');
  } catch (error) {
    console.error('Error clearing database:', error);
  }
};

const seedProducts = async () => {
  const mockProducts = [
    {
      title: "ALS 57 - Aluminijumski Sistem",
      description: "Visokokvalitetni aluminijumski profili za prozore i vrata. Sistem ALS 57 omogućava izuzetnu termičku izolaciju i dugotrajnost. Idealan za stambene i komercijalne objekte.",
      gallery: [],
      measurements: [
        {
          size: "Standardni profil",
          dimensions: {
            length: 6000,
            width: 57,
            height: 57,
            weight: 1.85
          }
        },
        {
          size: "Ojačani profil", 
          dimensions: {
            length: 6000,
            width: 57,
            height: 70,
            weight: 2.1
          }
        }
      ],
      catalog: {
        catalogNumber: "ALS-057",
        category: "Prozorski sistemi",
        subcategory: "Standardni profili",
        tags: ["prozori", "vrata", "termička izolacija", "aluminijum"]
      },
      colors: [
        { name: "Bela RAL 9016", hexCode: "#F6F6F6", available: true },
        { name: "Antracit RAL 7016", hexCode: "#383E42", available: true },
        { name: "Braon RAL 8017", hexCode: "#45322E", available: true },
        { name: "Zlatni hrast", hexCode: "#B8860B", available: false }
      ],
      sizes: [
        { name: "Standardni 57mm", code: "STD57", available: true },
        { name: "Ojačani 70mm", code: "REI70", available: true }
      ],
      price: {
        amount: 2500,
        currency: "RSD"
      },
      availability: {
        inStock: true,
        quantity: 50
      }
    },
    {
      title: "ALS 4800 - Prozorski Sistem",
      description: "Napredni aluminijumski sistem za velike staklene površine. ALS 4800 pruža vrhunsku termičku izolaciju i strukturalnu čvrstoću. Pogidan za moderne arhitektonske rešenja.",
      gallery: [],
      measurements: [
        {
          size: "Osnovni ram",
          dimensions: {
            length: 6000,
            width: 48,
            height: 80,
            weight: 2.3
          }
        },
        {
          size: "Krilo prozora",
          dimensions: {
            length: 6000,
            width: 48,
            height: 65,
            weight: 1.95
          }
        }
      ],
      catalog: {
        catalogNumber: "ALS-4800",
        category: "Prozorski sistemi",
        subcategory: "Veliki otvori",
        tags: ["veliki otvori", "termička izolacija", "moderna arhitektura", "strukturalno ostakljenje"]
      },
      colors: [
        { name: "Bela RAL 9016", hexCode: "#F6F6F6", available: true },
        { name: "Antracit RAL 7016", hexCode: "#383E42", available: true },
        { name: "Crna RAL 9005", hexCode: "#0A0A0A", available: true },
        { name: "Eloxirani aluminijum", hexCode: "#C0C0C0", available: true }
      ],
      sizes: [
        { name: "Ram 48x80mm", code: "FR4880", available: true },
        { name: "Krilo 48x65mm", code: "WG4865", available: true }
      ],
      price: {
        amount: 3200,
        currency: "RSD"
      },
      availability: {
        inStock: true,
        quantity: 35
      }
    },
    {
      title: "ALT 7500 - Toplotno Izolovan Sistem",
      description: "Visokoenergetski aluminijumski sistem sa prekidom termalnog mosta. ALT 7500 je idealan za pasivne kuće i energetski efikasne zgrade. Omogućava postizanje visokih standarda izolacije.",
      gallery: [],
      measurements: [
        {
          size: "Ram sa termalnim prekidom",
          dimensions: {
            length: 6000,
            width: 75,
            height: 85,
            weight: 2.8
          }
        },
        {
          size: "Krilo sa prekidom",
          dimensions: {
            length: 6000,
            width: 75,
            height: 70,
            weight: 2.4
          }
        }
      ],
      catalog: {
        catalogNumber: "ALT-7500",
        category: "Toplotno izolovani sistemi",
        subcategory: "Visoka energetska efikasnost",
        tags: ["energetska efikasnost", "termalni prekid", "pasivna kuća", "visoka izolacija"]
      },
      colors: [
        { name: "Bela RAL 9016", hexCode: "#F6F6F6", available: true },
        { name: "Antracit RAL 7016", hexCode: "#383E42", available: true },
        { name: "Braon RAL 8017", hexCode: "#45322E", available: true }
      ],
      sizes: [
        { name: "Ram 75x85mm", code: "FR7585", available: true },
        { name: "Krilo 75x70mm", code: "WG7570", available: true }
      ],
      price: {
        amount: 4500,
        currency: "RSD"
      },
      availability: {
        inStock: true,
        quantity: 25
      }
    },
    {
      title: "ALD 9100 - Aluminijumski Profili",
      description: "Premium aluminijumski profili za vrhunska rešenja. ALD 9100 pruža izuzetnu čvrstoću i fleksibilnost u dizajnu. Pogidan za luksuzne stambene i komercijalne projekte.",
      gallery: [],
      measurements: [
        {
          size: "Ram profila",
          dimensions: {
            length: 6000,
            width: 91,
            height: 91,
            weight: 3.2
          }
        },
        {
          size: "Krilo profila",
          dimensions: {
            length: 6000,
            width: 114,
            height: 75,
            weight: 3.8
          }
        }
      ],
      catalog: {
        catalogNumber: "ALD-9100",
        category: "Premium profili",
        subcategory: "Luksuzni sistemi",
        tags: ["premium", "veliki profili", "luksuz", "fleksibilnost"]
      },
      colors: [
        { name: "Eloxirani prirodni", hexCode: "#C0C0C0", available: true },
        { name: "Antracit RAL 7016", hexCode: "#383E42", available: true },
        { name: "Zlatni hrast", hexCode: "#B8860B", available: true },
        { name: "Crna RAL 9005", hexCode: "#0A0A0A", available: false }
      ],
      sizes: [
        { name: "Ram 91x91mm", code: "FR9191", available: true },
        { name: "Krilo 114x75mm", code: "WG11475", available: true }
      ],
      price: {
        amount: 5800,
        currency: "RSD"
      },
      availability: {
        inStock: true,
        quantity: 18
      }
    },
    {
      title: "Interior Door System - Unutrašnji Sistem Vrata",
      description: "Elegantni aluminijumski sistem za unutrašnja vrata. Moderan dizajn sa mogućnostima različitih ispuna - staklo, panel, kombinovano. Idealan za kancelarije, hotele i moderne domove.",
      gallery: [],
      measurements: [
        {
          size: "Standardna vrata",
          dimensions: {
            length: 2100,
            width: 900,
            height: 40,
            weight: 28
          }
        },
        {
          size: "Dupla vrata",
          dimensions: {
            length: 2100,
            width: 1800,
            height: 40,
            weight: 45
          }
        }
      ],
      catalog: {
        catalogNumber: "IDS-001",
        category: "Unutrašnja vrata",
        subcategory: "Aluminijumski sistemi",
        tags: ["unutrašnja vrata", "kancelarije", "moderan dizajn", "fleksibilna ispuna"]
      },
      colors: [
        { name: "Eloxirani srebrni", hexCode: "#C0C0C0", available: true },
        { name: "Bela RAL 9016", hexCode: "#F6F6F6", available: true },
        { name: "Antracit RAL 7016", hexCode: "#383E42", available: true },
        { name: "Crna mat", hexCode: "#2C2C2C", available: true }
      ],
      sizes: [
        { name: "900x2100mm", code: "STD90", available: true },
        { name: "1000x2100mm", code: "STD100", available: true },
        { name: "1800x2100mm", code: "DUB180", available: true }
      ],
      price: {
        amount: 35000,
        currency: "RSD"
      },
      availability: {
        inStock: true,
        quantity: 12
      }
    },
    {
      title: "Staklena Ograda - Glass Balustrade System",
      description: "Moderna staklena ograda sa aluminijumskim nosačima. Bezbednost i elegancija u jednom sistemu. Pogodna za terase, balkone i unutrašnje stepenice. Minimalistički dizajn sa maksimalnom transparentnošću.",
      gallery: [],
      measurements: [
        {
          size: "Standardni panel",
          dimensions: {
            length: 1500,
            width: 12,
            height: 1100,
            weight: 45
          }
        },
        {
          size: "Ugaoni element",
          dimensions: {
            length: 1200,
            width: 12,
            height: 1100,
            weight: 38
          }
        }
      ],
      catalog: {
        catalogNumber: "GBS-100",
        category: "Ograde i balustrande",
        subcategory: "Staklene ograde",
        tags: ["staklena ograda", "moderna", "transparentnost", "bezbednost"]
      },
      colors: [
        { name: "Eloxirani prirodni", hexCode: "#C0C0C0", available: true },
        { name: "Antracit RAL 7016", hexCode: "#383E42", available: true },
        { name: "Bela RAL 9016", hexCode: "#F6F6F6", available: true }
      ],
      sizes: [
        { name: "Panel 1500mm", code: "PAN150", available: true },
        { name: "Panel 1200mm", code: "PAN120", available: true },
        { name: "Ugaoni element", code: "COR90", available: true }
      ],
      price: {
        amount: 18500,
        currency: "RSD"
      },
      availability: {
        inStock: true,
        quantity: 8
      }
    },
    {
      title: "Solar Mounting System - Sistem za Solarni Montaže",
      description: "Aluminijumski nosači za solarni paneli. Otporan na koroziju i vremenski uslovi. Jednostavna ugradnja sa fleksibilnim postavkama uglova. Idealan za krovove i fasade sa solarnim instalacijama.",
      gallery: [],
      measurements: [
        {
          size: "Osnovni nosač",
          dimensions: {
            length: 4000,
            width: 50,
            height: 40,
            weight: 1.2
          }
        },
        {
          size: "Krajnji nosač",
          dimensions: {
            length: 2000,
            width: 50,
            height: 40,
            weight: 0.8
          }
        }
      ],
      catalog: {
        catalogNumber: "SMS-200",
        category: "Specijalni sistemi",
        subcategory: "Solarni montažni sistemi",
        tags: ["solari", "održivost", "energija", "montaža"]
      },
      colors: [
        { name: "Eloxirani prirodni", hexCode: "#C0C0C0", available: true },
        { name: "Antracit RAL 7016", hexCode: "#383E42", available: true }
      ],
      sizes: [
        { name: "Nosač 4000mm", code: "SUP400", available: true },
        { name: "Nosač 2000mm", code: "SUP200", available: true },
        { name: "Spojni elementi", code: "CON-SET", available: true }
      ],
      price: {
        amount: 1200,
        currency: "RSD"
      },
      availability: {
        inStock: true,
        quantity: 100
      }
    },
    {
      title: "Lexan System - Polikarbonatni Sistem",
      description: "Aluminijumski sistem za polikarbonatne ploče. Idealan za nadstrešnice, zimske bašte i svetlosne krovove. Kombinuje čvrstoću aluminijuma sa transparentnošću polikarbonata.",
      gallery: [],
      measurements: [
        {
          size: "Nosači profil",
          dimensions: {
            length: 6000,
            width: 60,
            height: 25,
            weight: 1.1
          }
        },
        {
          size: "Završni profil",
          dimensions: {
            length: 6000,
            width: 45,
            height: 20,
            weight: 0.8
          }
        }
      ],
      catalog: {
        catalogNumber: "LEX-600",
        category: "Nadstrešnice i krovovi", 
        subcategory: "Polikarbonatni sistemi",
        tags: ["polikarbonat", "nadstrešnice", "transparentnost", "svetlosni krov"]
      },
      colors: [
        { name: "Bela RAL 9016", hexCode: "#F6F6F6", available: true },
        { name: "Antracit RAL 7016", hexCode: "#383E42", available: true },
        { name: "Braon RAL 8017", hexCode: "#45322E", available: true }
      ],
      sizes: [
        { name: "Nosač 60x25mm", code: "SUP6025", available: true },
        { name: "Završni 45x20mm", code: "END4520", available: true }
      ],
      price: {
        amount: 800,
        currency: "RSD"
      },
      availability: {
        inStock: true,
        quantity: 150
      }
    }
  ];

  try {
    await Product.insertMany(mockProducts);
    console.log('Products seeded successfully');
  } catch (error) {
    console.error('Error seeding products:', error);
  }
};

const seedProjects = async () => {
  const mockProjects = [
    {
      title: "Poslovni Kompleks Belgrade Plaza",
      description: "Savremeni poslovni kompleks sa preko 15.000m² aluminijumskih sistema. Korišćeni su ALS 4800 i ALT 7500 sistemi za maksimalnu energetsku efikasnost. Projekat je realizovan u saradnji sa renomiranim arhitektama.",
      client: "Belgrade Development Group",
      location: "Beograd, Novi Beograd",
      completionDate: new Date('2023-09-15'),
      projectType: "Komercijalni",
      category: "commercial",
      gallery: [],
      technicalData: {
        totalArea: 15000,
        numberOfUnits: 250,
        realizationTime: 8,
        projectValue: 2500000
      },
      productsUsed: [
        "ALS 4800 - Prozorski Sistem",
        "ALT 7500 - Toplotno Izolovan Sistem",
        "Interior Door System"
      ],
      tags: ["komercijalni", "energetska efikasnost", "veliki projekat", "beograd"]
    },
    {
      title: "Luksuzna Vila Dedinje",
      description: "Ekskluzivna privatna rezidencija sa premium aluminijumskim sistemima. Korišćeni ALD 9100 profili i staklene ograde za moderan i elegantan izgled. Posebna pažnja posvećena detaljima i završnoj obradi.",
      client: "Privatno lice",
      location: "Beograd, Dedinje", 
      completionDate: new Date('2023-11-20'),
      projectType: "Stambeni - luksuzni",
      category: "residential",
      gallery: [],
      technicalData: {
        totalArea: 450,
        numberOfUnits: 1,
        realizationTime: 3,
        projectValue: 180000
      },
      productsUsed: [
        "ALD 9100 - Aluminijumski Profili",
        "Staklena Ograda - Glass Balustrade System",
        "ALT 7500 - Toplotno Izolovan Sistem"
      ],
      tags: ["luksuz", "privatna kuća", "premium", "dedinje"]
    },
    {
      title: "Hotel Metropolitan Novi Sad",
      description: "Renoviranje fasade hotela sa modernim aluminijumskim sistemima. Kombinacija ALS 57 i Interior Door sistema. Projekat je uključivao i ugradnju solarnog montažnog sistema na krovu.",
      client: "Hotel Metropolitan d.o.o.",
      location: "Novi Sad, Centar",
      completionDate: new Date('2023-07-10'),
      projectType: "Ugostitelski",
      category: "commercial",
      gallery: [],
      technicalData: {
        totalArea: 2800,
        numberOfUnits: 85,
        realizationTime: 4,
        projectValue: 420000
      },
      productsUsed: [
        "ALS 57 - Aluminijumski Sistem",
        "Interior Door System",
        "Solar Mounting System"
      ],
      tags: ["hotel", "renoviranje", "solari", "novi sad"]
    },
    {
      title: "Sportski Centar Zemun",
      description: "Moderna sportska hala sa velikim staklenim površinama. Korišćen je Lexan sistem za svetlosni krov i ALS 4800 za fasadne elemente. Projekat omogućava odličnu prirodnu osvetljenost.",
      client: "Opština Zemun",
      location: "Zemun, Novi Grad",
      completionDate: new Date('2023-05-30'),
      projectType: "Javni - sportski",
      category: "public",
      gallery: [],
      technicalData: {
        totalArea: 3200,
        numberOfUnits: 1,
        realizationTime: 6,
        projectValue: 680000
      },
      productsUsed: [
        "Lexan System - Polikarbonatni Sistem",
        "ALS 4800 - Prozorski Sistem",
        "Staklena Ograda - Glass Balustrade System"
      ],
      tags: ["javni objekti", "sport", "svetlosni krov", "zemun"]
    },
    {
      title: "Stambena Zgrada Vračar",
      description: "Moderan stambeni kompleks sa 45 stanova. Korišćeni su energetski efikasni ALT 7500 sistemi za sve prozore i balkanske vrata. Posebno je obrađena fasada sa kombinacijom različitih boja.",
      client: "Vračar Invest d.o.o.",
      location: "Beograd, Vračar",
      completionDate: new Date('2023-12-15'),
      projectType: "Stambeni",
      category: "residential",
      gallery: [],
      technicalData: {
        totalArea: 4500,
        numberOfUnits: 45,
        realizationTime: 5,
        projectValue: 950000
      },
      productsUsed: [
        "ALT 7500 - Toplotno Izolovan Sistem",
        "ALS 57 - Aluminijumski Sistem"
      ],
      tags: ["stambeni", "energetska efikasnost", "vračar", "apartmani"]
    }
  ];

  try {
    await Project.insertMany(mockProjects);
    console.log('Projects seeded successfully');
  } catch (error) {
    console.error('Error seeding projects:', error);
  }
};

const seedMessages = async () => {
  const mockMessages = [
    {
      type: "order",
      sender: {
        name: "Marko Petrović",
        email: "marko.petrovic@email.com",
        phone: "+381 64 123 4567",
        company: "Petrović Gradnja d.o.o."
      },
      subject: "Ponuda za ALS 4800 sistem",
      content: "Poštovani, zanima me ponuda za ALS 4800 sistem za objekat od 500m². Molim vas da mi pošaljete detaljnu specifikaciju i cenovnik. Projekat planiramo da realizujemo tokom proleća.",
      status: "new",
      priority: "medium",
      createdAt: new Date('2024-01-15T10:30:00Z')
    },
    {
      type: "inquiry",
      sender: {
        name: "Ana Nikolić",
        email: "ana.nikolic@arhitektura.rs",
        phone: "+381 63 987 6543",
        company: "Studio Nikolić"
      },
      subject: "Konsultacije za luksuznu vilu",
      content: "Zdravo, architect sam i radim na projektu luksuzne vile. Trebam konsultacije za izbor najkvalitetnijih aluminijumskih sistema. Koje biste proizvode preporučili za ovakav tip objekta?",
      status: "in_progress",
      priority: "high",
      createdAt: new Date('2024-01-18T14:15:00Z')
    },
    {
      type: "other",
      sender: {
        name: "Stefan Jovanović",
        email: "stefan@email.com",
        phone: "+381 65 555 1234"
      },
      subject: "Pitanje o garanciji",
      content: "Poštovani, pre godinu dana ste mi ugradili ALS 57 sistem. Primetio sam da se jedan od prozora teško otvara. Da li je ovo pokriveno garancijom i kako da zakažem servis?",
      status: "resolved",
      priority: "medium",
      createdAt: new Date('2024-01-12T09:45:00Z')
    },
    {
      type: "order",
      sender: {
        name: "Milica Stojanović",
        email: "milica.stojanovic@hotel.rs",
        phone: "+381 62 333 7890",
        company: "Grand Hotel Beograd"
      },
      subject: "Obnova fasade hotela",
      content: "Potrebna nam je obnova fasade hotela sa modernim aluminijumskim sistemima. Objekat ima oko 150 prozora različitih dimenzija. Možete li nam poslati predstavnika za merenje?",
      status: "new",
      priority: "high",
      createdAt: new Date('2024-01-20T11:00:00Z')
    }
  ];

  try {
    await Message.insertMany(mockMessages);
    console.log('Messages seeded successfully');
  } catch (error) {
    console.error('Error seeding messages:', error);
  }
};

const seedUsers = async () => {
  const bcrypt = require('bcryptjs');
  
  // Hash the password for nissalmtctestmail123
  const hashedPassword = await bcrypt.hash('nissalmtctestmail123', 12);
  
  const mockUsers = [
    {
      name: "MTC Nissal Admin",
      email: "nissalmtctestmail@gmail.com",
      password: hashedPassword,
      role: "admin",
      permissions: [
        'manage_products',
        'manage_projects', 
        'manage_messages',
        'manage_users',
        'view_analytics',
        'system_settings'
      ]
    },
    {
      name: "Nikola Radić",
      email: "admin@nissal.rs",
      password: await bcrypt.hash('admin123', 12),
      role: "admin",
      permissions: [
        'manage_products',
        'manage_projects', 
        'manage_messages',
        'manage_users',
        'view_analytics',
        'system_settings'
      ]
    },
    {
      name: "Marija Petrović",
      email: "manager@nissal.rs", 
      password: await bcrypt.hash('manager123', 12),
      role: "manager",
      permissions: [
        'manage_products',
        'manage_projects', 
        'manage_messages',
        'view_analytics'
      ]
    }
  ];

  try {
    await User.insertMany(mockUsers);
    console.log('Users seeded successfully');
  } catch (error) {
    console.error('Error seeding users:', error);
  }
};

const seedDatabase = async () => {
  try {
    await connectDB();
    await clearDatabase();
    await seedProducts();
    await seedProjects();
    await seedMessages();
    await seedUsers();
    await seedSiteSettings();
    
    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run seeder if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

module.exports = {
  seedDatabase,
  clearDatabase,
  seedProducts,
  seedProjects,
  seedMessages,
  seedUsers,
  seedSiteSettings
};