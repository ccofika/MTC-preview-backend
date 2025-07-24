const mongoose = require('mongoose');
const Product = require('../models/Product');
const Project = require('../models/Project');
const Message = require('../models/Message');
const User = require('../models/User');
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
    console.log('Database cleared successfully');
  } catch (error) {
    console.error('Error clearing database:', error);
  }
};

const seedProducts = async () => {
  const mockProducts = [
    {
      title: "Luksuzni Kožni Fotelja Milano",
      description: "Elegantna kožna fotelja ručno izrađena od najkvalitetnije italijanske kože. Perfect za moderne dnevne sobe i kancelarije. Ergonomski dizajn pruža maksimalnu udobnost.",
      gallery: [
        {
          url: "https://res.cloudinary.com/demo/image/upload/v1234567890/nissal/products/fotelja-milano-1.jpg",
          publicId: "nissal/products/fotelja-milano-1",
          alt: "Milano fotelja - glavni pogled",
          isMain: true
        },
        {
          url: "https://res.cloudinary.com/demo/image/upload/v1234567890/nissal/products/fotelja-milano-2.jpg",
          publicId: "nissal/products/fotelja-milano-2", 
          alt: "Milano fotelja - bočni pogled"
        }
      ],
      measurements: [
        {
          size: "Standard",
          dimensions: {
            length: 85,
            width: 90,
            height: 105,
            weight: 35
          }
        }
      ],
      catalog: {
        catalogNumber: "NIS-FOT-001",
        category: "Fotelje",
        subcategory: "Kožne fotelje",
        tags: ["luksuz", "koža", "udobnost", "moderna"]
      },
      colors: [
        { name: "Tamno braon", hexCode: "#3C2415", available: true },
        { name: "Crna", hexCode: "#000000", available: true },
        { name: "Krem", hexCode: "#F5F5DC", available: false }
      ],
      sizes: [
        { name: "Standard", code: "STD", available: true }
      ],
      price: {
        amount: 125000,
        currency: "RSD"
      },
      availability: {
        inStock: true,
        quantity: 15
      }
    },
    {
      title: "Moderni Trosed Roma",
      description: "Savremeni trosed sa čistim linijama i visokoukvalitetnim tekstilom. Idealan za moderne domove. Dostupan u različitim bojama i veličinama.",
      gallery: [
        {
          url: "https://res.cloudinary.com/demo/image/upload/v1234567890/nissal/products/trosed-roma-1.jpg",
          publicId: "nissal/products/trosed-roma-1",
          alt: "Roma trosed - glavni pogled",
          isMain: true
        },
        {
          url: "https://res.cloudinary.com/demo/image/upload/v1234567890/nissal/products/trosed-roma-2.jpg",
          publicId: "nissal/products/trosed-roma-2",
          alt: "Roma trosed - detalj"
        }
      ],
      measurements: [
        {
          size: "Trosed",
          dimensions: {
            length: 200,
            width: 85,
            height: 85,
            weight: 45
          }
        }
      ],
      catalog: {
        catalogNumber: "NIS-TRO-002",
        category: "Garniture",
        subcategory: "Trosedi",
        tags: ["moderno", "tekstil", "udobnost", "porodica"]
      },
      colors: [
        { name: "Siva", hexCode: "#808080", available: true },
        { name: "Teget", hexCode: "#000080", available: true },
        { name: "Bež", hexCode: "#F5F5DC", available: true }
      ],
      sizes: [
        { name: "Trosed", code: "3S", available: true },
        { name: "Dvosed", code: "2S", available: true }
      ],
      price: {
        amount: 89000,
        currency: "RSD"
      },
      availability: {
        inStock: true,
        quantity: 8
      }
    },
    {
      title: "Klasični Sto za Trpezariju Vintage",
      description: "Elegantan sto za trpezariju od masivnog drveta hrasta. Klasičan dizajn koji se savršeno uklapa u tradicionalne i moderne enterijer.",
      gallery: [
        {
          url: "https://res.cloudinary.com/demo/image/upload/v1234567890/nissal/products/sto-vintage-1.jpg",
          publicId: "nissal/products/sto-vintage-1",
          alt: "Vintage sto - glavni pogled",
          isMain: true
        }
      ],
      measurements: [
        {
          size: "6 mesta",
          dimensions: {
            length: 180,
            width: 90,
            height: 75,
            weight: 55
          }
        },
        {
          size: "8 mesta",
          dimensions: {
            length: 220,
            width: 100,
            height: 75,
            weight: 70
          }
        }
      ],
      catalog: {
        catalogNumber: "NIS-STO-003",
        category: "Stolovi",
        subcategory: "Trpezarijski stolovi",
        tags: ["hrast", "masivno", "klasično", "porodica"]
      },
      colors: [
        { name: "Prirodno drvo", hexCode: "#DEB887", available: true },
        { name: "Tamni hrast", hexCode: "#8B4513", available: true }
      ],
      sizes: [
        { name: "6 mesta", code: "6P", available: true },
        { name: "8 mesta", code: "8P", available: true }
      ],
      price: {
        amount: 75000,
        currency: "RSD"
      },
      availability: {
        inStock: true,
        quantity: 12
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
      title: "Luksuzni Apartman u Beogradu",
      description: "Kompletno uređenje luksuznog apartmana od 120m² u centru Beograda. Projekat je obuhvatio dizajn i izradu sve potrebnog nameštaja, uključujući dnevnu sobu, trpezariju, spavaće sobe i radni prostor. Kombinacija modernog dizajna sa klasičnim elementima.",
      gallery: [
        {
          url: "https://res.cloudinary.com/demo/image/upload/v1234567890/nissal/projects/apartman-beograd-1.jpg",
          publicId: "nissal/projects/apartman-beograd-1",
          alt: "Apartman Beograd - dnevna soba",
          isMain: true,
          order: 1
        },
        {
          url: "https://res.cloudinary.com/demo/image/upload/v1234567890/nissal/projects/apartman-beograd-2.jpg",
          publicId: "nissal/projects/apartman-beograd-2",
          alt: "Apartman Beograd - trpezarija",
          order: 2
        },
        {
          url: "https://res.cloudinary.com/demo/image/upload/v1234567890/nissal/projects/apartman-beograd-3.jpg",
          publicId: "nissal/projects/apartman-beograd-3",
          alt: "Apartman Beograd - spavaća soba",
          order: 3
        }
      ],
      category: "Stambeni prostori",
      client: "Porodica Marković",
      location: "Beograd, Vračar",
      completionDate: new Date("2024-03-15"),
      tags: ["luksuz", "apartman", "moderno", "kompletno uređenje"],
      featured: true
    },
    {
      title: "Korporativne Kancelarije Tech Kompanije",
      description: "Dizajn i oprema modernih kancelarijskih prostora na 300m² za IT kompaniju. Open space koncept sa fleksibilnim radnim zonama, meeting sobama i relaks prostorima. Fokus na ergonomiju i produktivnost zaposlenih.",
      gallery: [
        {
          url: "https://res.cloudinary.com/demo/image/upload/v1234567890/nissal/projects/kancelarije-tech-1.jpg",
          publicId: "nissal/projects/kancelarije-tech-1",
          alt: "Tech kancelarije - open space",
          isMain: true,
          order: 1
        },
        {
          url: "https://res.cloudinary.com/demo/image/upload/v1234567890/nissal/projects/kancelarije-tech-2.jpg",
          publicId: "nissal/projects/kancelarije-tech-2",
          alt: "Tech kancelarije - meeting soba",
          order: 2
        }
      ],
      category: "Poslovni prostori",
      client: "TechSolutions d.o.o.",
      location: "Novi Sad, BTP",
      completionDate: new Date("2024-01-20"),
      tags: ["kancelarije", "IT", "open space", "ergonomija"],
      featured: true
    },
    {
      title: "Tradicionalni Restoran 'Stara Čaršija'",
      description: "Kompletno uređenje tradicionalnog restorana sa 80 mesta. Kombinacija autentičnih materijalsa poput drveta i kamena sa modernim funkcionalnim rešenjima. Projekat je uključivao dizajn enterijera, custom nameštaj i ambijentalno osvetljenje.",
      gallery: [
        {
          url: "https://res.cloudinary.com/demo/image/upload/v1234567890/nissal/projects/restoran-stara-1.jpg",
          publicId: "nissal/projects/restoran-stara-1",
          alt: "Restoran - glavni salon",
          isMain: true,
          order: 1
        },
        {
          url: "https://res.cloudinary.com/demo/image/upload/v1234567890/nissal/projects/restoran-stara-2.jpg",
          publicId: "nissal/projects/restoran-stara-2",
          alt: "Restoran - bar prostor",
          order: 2
        },
        {
          url: "https://res.cloudinary.com/demo/image/upload/v1234567890/nissal/projects/restoran-stara-3.jpg",
          publicId: "nissal/projects/restoran-stara-3",
          alt: "Restoran - privatna sala",
          order: 3
        }
      ],
      category: "Ugostiteljski objekti",
      client: "Restoran 'Stara Čaršija'",
      location: "Kragujevac, Centar",
      completionDate: new Date("2023-11-10"),
      tags: ["restoran", "tradicionalno", "drvo", "kamen", "ambijent"],
      featured: false
    },
    {
      title: "Moderna Vila u Dedinjštini",
      description: "Enterijer moderne vile od 250m² sa naglašenim minimalističkim pristupom. Clean lines, prirodni materijali i puno svetlosti. Projekat je obuhvatao sve prostorije uključujući home cinema, wine cellar i spa prostor.",
      gallery: [
        {
          url: "https://res.cloudinary.com/demo/image/upload/v1234567890/nissal/projects/vila-dedinje-1.jpg",
          publicId: "nissal/projects/vila-dedinje-1",
          alt: "Vila Dedinje - dnevna soba",
          isMain: true,
          order: 1
        },
        {
          url: "https://res.cloudinary.com/demo/image/upload/v1234567890/nissal/projects/vila-dedinje-2.jpg",
          publicId: "nissal/projects/vila-dedinje-2",
          alt: "Vila Dedinje - kuhinja",
          order: 2
        }
      ],
      category: "Stambeni prostori",
      client: "Privatni klijent",
      location: "Beograd, Dedinje",
      completionDate: new Date("2024-05-30"),
      tags: ["vila", "minimalizam", "luksuz", "prirodni materijali"],
      featured: true
    }
  ];

  try {
    await Project.insertMany(mockProjects);
    console.log('Projects seeded successfully');
  } catch (error) {
    console.error('Error seeding projects:', error);
  }
};

const seedUsers = async () => {
  const mockUsers = [
    {
      name: "Marko Petrović",
      email: "admin@nissal.rs",
      password: "admin123",
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
      name: "Ana Nikolić",
      email: "manager@nissal.rs", 
      password: "manager123",
      role: "manager",
      permissions: [
        'manage_products',
        'manage_projects',
        'manage_messages',
        'view_analytics'
      ]
    },
    {
      name: "Stefan Jovanović",
      email: "staff@nissal.rs",
      password: "staff123", 
      role: "staff",
      permissions: [
        'manage_messages'
      ]
    }
  ];

  try {
    const users = await User.insertMany(mockUsers);
    console.log('Users seeded successfully');
    return users;
  } catch (error) {
    console.error('Error seeding users:', error);
    return [];
  }
};

const seedMessages = async (users) => {
  if (!users || users.length === 0) {
    console.error('No users available for message seeding');
    return;
  }

  const adminUser = users.find(u => u.role === 'admin');
  const managerUser = users.find(u => u.role === 'manager');
  const staffUser = users.find(u => u.role === 'staff');

  const mockMessages = [
    {
      type: "contact",
      sender: {
        name: "Marija Petrović",
        email: "marija.petrovic@email.com",
        phone: "+381641234567",
        company: ""
      },
      subject: "Upit za trosed Roma",
      content: "Pozdrav, interesuje me trosed Roma koji sam videla na vašem sajtu. Da li je dostupan u teget boji i koliko vremena je potrebno za izradu? Takođe, da li je moguća dostava u Niš?",
      status: "new",
      priority: "medium",
      metadata: {
        ipAddress: "192.168.1.100",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        source: "website"
      }
    },
    {
      type: "order",
      sender: {
        name: "Stefan Nikolić", 
        email: "stefan.nikolic@firma.rs",
        phone: "+381629876543",
        company: "Nikolić Trade d.o.o."
      },
      subject: "Narudžbina kancelarijskog nameštaja",
      content: "Trebaju nam kancelarijski stolovi i stolice za 15 radnih mesta. Interesuju nas moderna rešenja slična onima što ste radili za Tech kompaniju. Budžet je oko 500.000 RSD. Molim kontakt radi dogovora termina za pregled prostora.",
      status: "in_progress",
      priority: "high",
      adminNotes: "Klijent ima hitan potrebu, zakazati pregled za sledeću nedelju",
      assignedTo: managerUser._id,
      metadata: {
        ipAddress: "192.168.1.101",
        userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        source: "website"
      }
    },
    {
      type: "inquiry",
      sender: {
        name: "Ana Jovanović",
        email: "ana.jovanovic@gmail.com",
        phone: "+381113456789"
      },
      subject: "Mogućnost custom izrade fotelje",
      content: "Zdravo, da li radite custom fotelje po specifičnim merama? Potrebna mi je fotelja dimenzija 80x85x110cm u burgundy boji. Da li je to moguće i kolika bi bila cena?",
      status: "replied",
      priority: "medium",
      replies: [
        {
          content: "Poštovana Ana, hvala na upitu. Da, radimo custom izradu po vašim specifikacijama. Za fotelje dimenzija koje ste naveli, cena bi bila oko 95.000 RSD u zavisnosti od odabranog materijala. Burgundy boja je dostupna. Molim vas pozovite nas da dogovorimo detalje.",
          sentBy: staffUser._id,
          sentAt: new Date("2024-07-20T10:30:00"),
          emailSent: true,
          emailSentAt: new Date("2024-07-20T10:32:00")
        }
      ],
      assignedTo: staffUser._id,
      metadata: {
        ipAddress: "192.168.1.102", 
        userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15",
        source: "website"
      }
    },
    {
      type: "complaint",
      sender: {
        name: "Miloš Stojanović",
        email: "milos.stojanovic@email.com",
        phone: "+381601234567"
      },
      subject: "Problem sa dostavom",
      content: "Naručio sam Milano fotelje pre mesec dana i trebalo je da budu dostavljene prošle nedelje. Još uvek ih nisam dobio i niko me nije kontaktirao. Molim hitno objašnjenje.",
      status: "resolved",
      priority: "urgent",
      adminNotes: "Problem rešen - fotelje dostavljene 22.07. Klijent zadovoljan.",
      replies: [
        {
          content: "Poštovani Milošo, izvinjavam se zbog kašnjenja. Došlo je do problema u proizvodnji koje smo rešili. Vaše fotelje će biti dostavljene sutra između 10-12h. Zbog neprijatnosti, odobravamo vam 10% popust na sledeću kupovinu.",
          sentBy: adminUser._id,
          sentAt: new Date("2024-07-21T14:15:00"),
          emailSent: true,
          emailSentAt: new Date("2024-07-21T14:17:00")
        }
      ],
      assignedTo: adminUser._id,
      metadata: {
        ipAddress: "192.168.1.103",
        userAgent: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36",
        source: "website"
      }
    },
    {
      type: "other",
      sender: {
        name: "Jelena Mitrović",
        email: "jelena.mitrovic@design.com",
        phone: "+381654321098",
        company: "Interior Design Studio"
      },
      subject: "Mogućnost saradnje",
      content: "Pozdrav, ja sam interior designer i često imam klijente kojima su potrebni custom nameštaj. Da li biste bili zainteresovani za saradnju? Radim uglavnom na high-end projektima.",
      status: "read",
      priority: "medium",
      metadata: {
        ipAddress: "192.168.1.104",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/115.0",
        source: "website"
      }
    }
  ];

  try {
    await Message.insertMany(mockMessages);
    console.log('Messages seeded successfully');
  } catch (error) {
    console.error('Error seeding messages:', error);
  }
};

const seedDatabase = async () => {
  await connectDB();
  
  console.log('Starting database seeding...');
  
  // Clear existing data
  await clearDatabase();
  
  // Seed new data
  const users = await seedUsers();
  await seedProducts();
  await seedProjects(); 
  await seedMessages(users);
  
  console.log('Database seeding completed successfully!');
  
  // Close connection
  await mongoose.connection.close();
  console.log('Database connection closed.');
};

module.exports = { seedDatabase, clearDatabase, seedProducts, seedProjects, seedMessages };

// Run seeder if this file is executed directly
if (require.main === module) {
  seedDatabase().catch(console.error);
}